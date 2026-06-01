const assert = require("assert");

const baseUrl = (process.env.PRODUCTION_URL || "https://yikou-cheungfun-line-order-v2.vercel.app").replace(/\/$/, "");

async function fetchJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    redirect: "manual",
    ...options,
    headers: {
      accept: "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { response, text, json };
}

function line(name, status, detail = "") {
  const label = status ? "PASS" : "WARN";
  console.log(`${label} ${name}${detail ? ` - ${detail}` : ""}`);
}

function missingList(check) {
  return Array.isArray(check?.missing) ? check.missing.join(", ") : "";
}

async function checkHealth() {
  const { response, json, text } = await fetchJson("/api/health");
  assert.equal(response.status, 200, `/api/health returned ${response.status}: ${text.slice(0, 200)}`);
  assert.equal(json.ok, true, "/api/health did not return ok:true");

  const checks = json.checks || {};
  line("health endpoint", true, `ready=${json.ready}`);
  line("Google Place ID", checks.googlePlace?.configured === true, checks.googlePlace?.placeId || missingList(checks.googlePlace));
  line("OAuth security", checks.oauthSecurity?.configured === true, missingList(checks.oauthSecurity));
  line("LINE official account", checks.lineOfficialAccount?.configured === true, missingList(checks.lineOfficialAccount));
  line("LINE member login", checks.lineLogin?.configured === true, missingList(checks.lineLogin));
  line("Google member login", checks.googleLogin?.configured === true, missingList(checks.googleLogin));
  line("member database", checks.memberDatabase?.configured === true, missingList(checks.memberDatabase));
  line("Google business hours", checks.googleBusinessHours?.configured === true, missingList(checks.googleBusinessHours));
  line("POS integration", checks.posIntegration?.configured === true, missingList(checks.posIntegration));

  return json;
}

async function checkSetupPage() {
  const response = await fetch(`${baseUrl}/setup.html?ts=${Date.now()}`, { cache: "no-store" });
  const text = await response.text();
  assert.equal(response.status, 200, `setup.html returned ${response.status}`);
  assert(text.includes("一口腸粉"), "setup.html missing brand text");
  assert(text.includes("/api/auth/line/callback"), "setup.html missing LINE callback");
  assert(text.includes("/api/auth/google/callback"), "setup.html missing Google callback");
  line("setup page", true);
}

async function checkOAuthStart(path, providerName) {
  const { response, json, text } = await fetchJson(path);
  if (response.status === 302 || response.status === 307) {
    const location = response.headers.get("location") || "";
    const expectedHost = providerName === "LINE" ? "access.line.me" : "accounts.google.com";
    assert(location.includes(expectedHost), `${providerName} redirect target unexpected: ${location}`);
    line(`${providerName} OAuth start`, true, "redirect configured");
    return;
  }
  assert(response.status === 503, `${providerName} OAuth start unexpected status ${response.status}: ${text.slice(0, 200)}`);
  line(`${providerName} OAuth start`, false, Array.isArray(json?.missing) ? json.missing.join(", ") : json?.message || "not configured");
}

async function checkBusinessHours() {
  const { response, json, text } = await fetchJson("/api/business-hours");
  if (response.status === 200) {
    assert(json.ok === true, `/api/business-hours returned 200 without ok:true: ${text.slice(0, 200)}`);
    line("Google business hours API", true, json.todayText || "ok");
    return;
  }
  assert(response.status === 503, `/api/business-hours unexpected status ${response.status}`);
  line("Google business hours API", false, Array.isArray(json?.missing) ? json.missing.join(", ") : json?.message || "not configured");
}

async function checkMemberEndpoint(path) {
  const { response, json, text } = await fetchJson(path);
  if (response.status === 200 || response.status === 401) {
    line(path, true, response.status === 401 ? "requires login" : "ok");
    return;
  }
  assert(response.status === 503, `${path} unexpected status ${response.status}: ${text.slice(0, 200)}`);
  line(path, false, Array.isArray(json?.missing) ? json.missing.join(", ") : json?.message || "not configured");
}

async function main() {
  console.log(`Production smoke test: ${baseUrl}`);
  const health = await checkHealth();
  await checkSetupPage();
  await checkOAuthStart("/api/auth/line/start", "LINE");
  await checkOAuthStart("/api/auth/google/start", "Google");
  await checkBusinessHours();
  await checkMemberEndpoint("/api/member/me");
  await checkMemberEndpoint("/api/member/orders");
  await checkMemberEndpoint("/api/member/coupons");

  if (!health.ready) {
    const missing = Object.entries(health.checks || {})
      .flatMap(([name, check]) => Array.isArray(check.missing) ? check.missing.map(key => `${name}:${key}`) : []);
    console.log(`Production is not fully ready yet. Missing: ${missing.join(", ")}`);
    process.exitCode = 2;
    return;
  }

  console.log("Production is ready.");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
