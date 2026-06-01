const { methodNotAllowed, sendJson } = require("../../../lib/member-utils");
const { setSessionCookie } = require("../../../lib/session-utils");
const { upsertOAuthMember } = require("../../../lib/supabase-utils");
const { verifyState } = require("../../../lib/oauth-utils");

async function exchangeLineToken(code, redirectUri) {
  const body = new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri, client_id: process.env.LINE_LOGIN_CHANNEL_ID, client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET });
  const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!tokenResponse.ok) throw new Error("LINE_TOKEN_EXCHANGE_FAILED");
  return tokenResponse.json();
}

async function verifyLineIdToken(idToken) {
  const body = new URLSearchParams({ id_token: idToken, client_id: process.env.LINE_LOGIN_CHANNEL_ID });
  const verifyResponse = await fetch("https://api.line.me/oauth2/v2.1/verify", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!verifyResponse.ok) throw new Error("LINE_ID_TOKEN_VERIFY_FAILED");
  return verifyResponse.json();
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const callbackUrl = new URL(request.url, `https://${request.headers.host}`);
  const stateCheck = verifyState(request, response, "line", callbackUrl.searchParams.get("state"));
  if (!stateCheck.ok) {
    sendJson(response, 400, { ok: false, code: stateCheck.code, message: "LINE 登入狀態驗證失敗，請重新開始註冊。" });
    return;
  }

  const missing = ["LINE_LOGIN_CHANNEL_ID", "LINE_LOGIN_CHANNEL_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter(name => !process.env[name]);
  if (!process.env.OAUTH_STATE_SECRET && !process.env.SESSION_SECRET) missing.push("OAUTH_STATE_SECRET_OR_SESSION_SECRET");
  if (missing.length) {
    sendJson(response, 503, { ok: false, code: "LINE_CALLBACK_NOT_CONFIGURED", message: "LINE callback 尚未連接正式會員資料庫。未設定完成前不會交換 token 或保存個資。", missing });
    return;
  }

  const code = callbackUrl.searchParams.get("code");
  if (!code) {
    sendJson(response, 400, { ok: false, code: "LINE_CODE_MISSING" });
    return;
  }

  try {
    const redirectUri = `${callbackUrl.origin}/api/auth/line/callback`;
    const token = await exchangeLineToken(code, redirectUri);
    const verified = await verifyLineIdToken(token.id_token);
    const { member } = await upsertOAuthMember({ provider: "line", subject: verified.sub, displayName: verified.name || "", email: verified.email || "", preferredTaste: "鮮蝦蛋腸粉" });
    setSessionCookie(response, member.id, "line");
    response.statusCode = 302;
    response.setHeader("location", "/#member");
    response.end();
  } catch (error) {
    sendJson(response, 502, { ok: false, code: error.message || "LINE_CALLBACK_FAILED", message: "LINE 註冊失敗，請稍後再試。" });
  }
};
