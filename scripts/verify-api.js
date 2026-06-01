const assert = require("assert");
const { execFileSync } = require("child_process");
const { EventEmitter } = require("events");
const fs = require("fs");
const path = require("path");

function createRequest({ method = "GET", url = "/", headers = {}, body = null } = {}) {
  const request = new EventEmitter();
  request.method = method;
  request.url = url;
  request.headers = { host: "localhost:3000", ...headers };
  request.destroy = () => {};
  process.nextTick(() => {
    if (body !== null) request.emit("data", Buffer.from(typeof body === "string" ? body : JSON.stringify(body)));
    request.emit("end");
  });
  return request;
}

function createResponse() {
  let resolveDone;
  const done = new Promise(resolve => { resolveDone = resolve; });
  const headers = {};
  return {
    statusCode: 200,
    body: "",
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
    },
    getHeader(key) {
      return headers[key.toLowerCase()];
    },
    end(chunk = "") {
      this.body += chunk;
      resolveDone(this);
    },
    json() {
      return JSON.parse(this.body || "{}");
    },
    headers,
    done
  };
}

async function invoke(handler, requestOptions) {
  const request = createRequest(requestOptions);
  const response = createResponse();
  await handler(request, response);
  return response.done;
}

async function testPublicConfig() {
  const handler = require("../api/public-config");
  const response = await invoke(handler);
  assert.equal(response.statusCode, 200);
  const payload = response.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.lineOfficialAccountConfigured, false);
  assert.equal(payload.lineOfficialAccountUrl, "");
}

async function testHealthDoesNotLeakSecrets() {
  const handler = require("../api/health");
  const response = await invoke(handler);
  assert.equal(response.statusCode, 200);
  const payload = response.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.ready, false);
  assert.equal(payload.checks.googlePlace.placeId, "ChIJ0wZdQgA9aTQR-dLMJWRvNEc");
  assert(payload.checks.googleBusinessHours.missing.includes("GOOGLE_PLACES_API_KEY"));
  const serialized = JSON.stringify(payload);
  assert(!serialized.includes("SERVICE_ROLE_KEY="));
  assert(!serialized.includes("SECRET="));
}

async function testBusinessHoursMissingKey() {
  const handler = require("../api/business-hours");
  const response = await invoke(handler);
  assert.equal(response.statusCode, 503);
  const payload = response.json();
  assert.equal(payload.code, "GOOGLE_BUSINESS_HOURS_NOT_CONFIGURED");
  assert(payload.missing.includes("GOOGLE_PLACES_API_KEY"));
  assert(!payload.missing.includes("GOOGLE_PLACE_ID"));
}

async function testOAuthStartRequiresSecret() {
  const lineStart = require("../api/auth/line/start");
  const googleStart = require("../api/auth/google/start");

  const lineResponse = await invoke(lineStart);
  assert.equal(lineResponse.statusCode, 503);
  assert(lineResponse.json().missing.includes("OAUTH_STATE_SECRET_OR_SESSION_SECRET"));

  const googleResponse = await invoke(googleStart);
  assert.equal(googleResponse.statusCode, 503);
  assert(googleResponse.json().missing.includes("OAUTH_STATE_SECRET_OR_SESSION_SECRET"));
}

async function testMemberMeRequiresBackend() {
  const handler = require("../api/member/[resource]");
  const response = await invoke(handler, { url: "/api/member/me" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "MEMBER_BACKEND_NOT_CONFIGURED");
}

async function testMemberExportRequiresBackendBeforeSession() {
  const handler = require("../api/member/[resource]");
  const response = await invoke(handler, { method: "POST", url: "/api/member/export" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "MEMBER_BACKEND_NOT_CONFIGURED");
}

async function testMemberOrdersRequiresBackendBeforeSession() {
  const handler = require("../api/member/[resource]");
  const response = await invoke(handler, { url: "/api/member/orders" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "MEMBER_BACKEND_NOT_CONFIGURED");
}

async function testMemberCouponsRequiresBackendBeforeSession() {
  const handler = require("../api/member/[resource]");
  const response = await invoke(handler, { url: "/api/member/coupons" });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "MEMBER_BACKEND_NOT_CONFIGURED");
}

async function testCouponRedeemRequiresBackendBeforeSession() {
  const handler = require("../api/coupons/redeem");
  const response = await invoke(handler, { method: "POST", body: { couponId: "demo" } });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "MEMBER_BACKEND_NOT_CONFIGURED");
}

async function testPosRequiresConfiguredBackendBeforeToken() {
  const handler = require("../api/pos/orders/complete");
  const response = await invoke(handler, { method: "POST", body: { posOrderId: "POS-1" } });
  assert.equal(response.statusCode, 503);
  assert.equal(response.json().code, "MEMBER_BACKEND_NOT_CONFIGURED");
}

async function testLogoutClearsSession() {
  const handler = require("../api/auth/logout");
  const response = await invoke(handler, { method: "POST" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().ok, true);
  const cookie = response.getHeader("set-cookie");
  assert(Array.isArray(cookie));
  assert(cookie.join(";").includes("yikou_member_session="));
  assert(cookie.join(";").includes("Max-Age=0"));
}

function testGitignoreProtectsLocalSecrets() {
  const gitignore = fs.readFileSync(path.join(__dirname, "..", ".gitignore"), "utf8");
  assert(gitignore.includes(".env.*"));
  assert(gitignore.includes("!.env.example"));
  assert(gitignore.includes("!env.production.example"));
}

function testSessionSignatureValidation() {
  const { getSession, setSessionCookie } = require("../lib/session-utils");
  process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars";
  const response = createResponse();
  setSessionCookie(response, "member-1", "line");
  const cookie = response.getHeader("set-cookie")[0].split(";")[0];
  const valid = getSession({ headers: { cookie } });
  assert.equal(valid.memberId, "member-1");

  const tampered = cookie.replace("member", "tamper");
  assert.equal(getSession({ headers: { cookie: tampered } }), null);
  delete process.env.SESSION_SECRET;
}

function testOAuthStateSignatureValidation() {
  const { createSignedState, verifyState } = require("../lib/oauth-utils");
  process.env.SESSION_SECRET = "test-oauth-secret-at-least-32-chars";
  const state = createSignedState("line");
  const response = createResponse();
  const ok = verifyState({
    headers: { cookie: `yikou_oauth_line_state=${state}` }
  }, response, "line", state);
  assert.equal(ok.ok, true);

  const bad = verifyState({
    headers: { cookie: `yikou_oauth_line_state=${state}` }
  }, createResponse(), "line", `${state.slice(0, -1)}x`);
  assert.equal(bad.ok, false);
  delete process.env.SESSION_SECRET;
}

function testFrontendUsesServerExport() {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert(html.includes("/api/member/export"));
  assert(html.includes("/api/member/orders"));
  assert(html.includes("/api/member/coupons"));
  assert(html.includes("exportMemberData"));
  assert(html.includes("已從後端匯出遮罩會員資料"));
}

function testSecretGenerator() {
  const output = execFileSync(process.execPath, [path.join(__dirname, "generate-secrets.js"), "--json"], {
    encoding: "utf8"
  });
  const payload = JSON.parse(output);
  const required = ["OAUTH_STATE_SECRET", "SESSION_SECRET", "POS_API_TOKEN"];

  for (const key of required) {
    assert.equal(typeof payload[key], "string");
    assert(payload[key].length >= 32);
    assert(/^[A-Za-z0-9_-]+$/.test(payload[key]));
  }

  assert.equal(new Set(required.map(key => payload[key])).size, required.length);
}

function testSetupPageCanGenerateSecretsLocally() {
  const html = fs.readFileSync(path.join(__dirname, "..", "setup.html"), "utf8");
  assert(html.includes("generateSecretsBtn"));
  assert(html.includes("generateSecretsInlineBtn"));
  assert(html.includes("copyGeneratedSecretsBtn"));
  assert(html.includes("crypto.getRandomValues"));
  assert(html.includes("OAUTH_STATE_SECRET"));
  assert(html.includes("SESSION_SECRET"));
  assert(html.includes("POS_API_TOKEN"));
}

function testIntegrationStatusUsesSharedReadinessRules() {
  const { buildIntegrationChecks } = require("../lib/integration-status");

  const emptyChecks = buildIntegrationChecks({});
  assert.equal(emptyChecks.oauthSecurity.configured, false);
  assert(emptyChecks.oauthSecurity.missing.includes("OAUTH_STATE_SECRET_OR_SESSION_SECRET"));
  assert(emptyChecks.lineLogin.missing.includes("SUPABASE_URL"));
  assert(emptyChecks.lineLogin.missing.includes("SUPABASE_SERVICE_ROLE_KEY"));
  assert(emptyChecks.posIntegration.missing.includes("POS_API_TOKEN"));

  const sessionOnlyChecks = buildIntegrationChecks({ SESSION_SECRET: "x".repeat(40) });
  assert.equal(sessionOnlyChecks.oauthSecurity.configured, true);
  assert(!sessionOnlyChecks.memberDatabase.missing.includes("OAUTH_STATE_SECRET_OR_SESSION_SECRET"));
}

async function main() {
  delete process.env.GOOGLE_PLACES_API_KEY;
  delete process.env.GOOGLE_PLACE_ID;
  delete process.env.LINE_LOGIN_CHANNEL_ID;
  delete process.env.LINE_LOGIN_CHANNEL_SECRET;
  delete process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_SECRET;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.OAUTH_STATE_SECRET;
  delete process.env.SESSION_SECRET;
  delete process.env.LINE_OFFICIAL_ACCOUNT_URL;
  delete process.env.POS_API_TOKEN;

  await testPublicConfig();
  await testHealthDoesNotLeakSecrets();
  await testBusinessHoursMissingKey();
  await testOAuthStartRequiresSecret();
  await testMemberMeRequiresBackend();
  await testMemberExportRequiresBackendBeforeSession();
  await testMemberOrdersRequiresBackendBeforeSession();
  await testMemberCouponsRequiresBackendBeforeSession();
  await testCouponRedeemRequiresBackendBeforeSession();
  await testPosRequiresConfiguredBackendBeforeToken();
  await testLogoutClearsSession();
  testGitignoreProtectsLocalSecrets();
  testSessionSignatureValidation();
  testOAuthStateSignatureValidation();
  testFrontendUsesServerExport();
  testSecretGenerator();
  testSetupPageCanGenerateSecretsLocally();
  testIntegrationStatusUsesSharedReadinessRules();

  console.log("API safety checks passed");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
