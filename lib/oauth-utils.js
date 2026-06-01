const crypto = require("crypto");
const { sendJson } = require("./member-utils");

const DEFAULT_PUBLIC_BASE_URL = "https://yikou-cheungfun-line-order-v2.vercel.app";

function normalizeBaseUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "";
    return url.origin;
  } catch {
    return "";
  }
}

function safeHeaderHost(host = "") {
  const value = String(host).split(",")[0].trim().toLowerCase();
  if (!/^[a-z0-9.-]+(?::\d+)?$/.test(value)) return "";
  return value;
}

function getBaseUrl(request) {
  const configured = normalizeBaseUrl(process.env.PUBLIC_BASE_URL || DEFAULT_PUBLIC_BASE_URL);
  if (configured) return configured;

  const proto = request.headers["x-forwarded-proto"] === "http" ? "http" : "https";
  const host = safeHeaderHost(request.headers["x-forwarded-host"] || request.headers.host);
  return host ? `${proto}://${host}` : DEFAULT_PUBLIC_BASE_URL;
}

function getRequestUrl(request) {
  return new URL(request.url, getBaseUrl(request));
}

function missingOAuth(response, provider, missing) {
  sendJson(response, 503, {
    ok: false,
    code: `${provider.toUpperCase()}_OAUTH_NOT_CONFIGURED`,
    message: `${provider} 註冊尚未設定 OAuth 金鑰。請在 Vercel 環境變數設定後再啟用。`,
    missing
  });
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signState(payload) {
  const secret = process.env.OAUTH_STATE_SECRET || process.env.SESSION_SECRET;
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(expected, actual) {
  if (!expected || !actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function createSignedState(provider) {
  const issuedAt = Date.now();
  const nonce = crypto.randomBytes(24).toString("hex");
  const payload = base64url(JSON.stringify({ provider, nonce, issuedAt }));
  const signature = signState(payload);
  return `${payload}.${signature}`;
}

function parseCookies(request) {
  const header = request.headers.cookie || "";
  return Object.fromEntries(header.split(";").map(part => {
    const [key, ...value] = part.trim().split("=");
    return [key, value.join("=")];
  }).filter(([key]) => key));
}

function appendSetCookie(response, cookie) {
  const current = response.getHeader("set-cookie");
  if (!current) {
    response.setHeader("set-cookie", [cookie]);
    return;
  }
  response.setHeader("set-cookie", Array.isArray(current) ? [...current, cookie] : [current, cookie]);
}

function setStateCookie(response, provider, state) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  appendSetCookie(response, `yikou_oauth_${provider}_state=${state}; HttpOnly;${secure} SameSite=Lax; Path=/api/auth/${provider}; Max-Age=600`);
}

function clearStateCookie(response, provider) {
  appendSetCookie(response, `yikou_oauth_${provider}_state=; HttpOnly; SameSite=Lax; Path=/api/auth/${provider}; Max-Age=0`);
}

function verifyState(request, response, provider, state) {
  const cookies = parseCookies(request);
  const expected = cookies[`yikou_oauth_${provider}_state`];
  clearStateCookie(response, provider);

  if (!state || !expected || state !== expected) {
    return { ok: false, code: "OAUTH_STATE_MISMATCH" };
  }

  const [payload, signature] = state.split(".");
  if (!payload || !signature || !signaturesMatch(signState(payload), signature)) {
    return { ok: false, code: "OAUTH_STATE_INVALID" };
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (parsed.provider !== provider) return { ok: false, code: "OAUTH_PROVIDER_MISMATCH" };
    if (Date.now() - Number(parsed.issuedAt || 0) > 10 * 60 * 1000) return { ok: false, code: "OAUTH_STATE_EXPIRED" };
    return { ok: true, parsed };
  } catch {
    return { ok: false, code: "OAUTH_STATE_PARSE_FAILED" };
  }
}

module.exports = {
  clearStateCookie,
  createSignedState,
  getBaseUrl,
  getRequestUrl,
  missingOAuth,
  setStateCookie,
  verifyState
};
