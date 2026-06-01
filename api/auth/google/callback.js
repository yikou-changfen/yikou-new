const { methodNotAllowed, sendJson } = require("../../../lib/member-utils");
const { setSessionCookie } = require("../../../lib/session-utils");
const { upsertOAuthMember } = require("../../../lib/supabase-utils");
const { verifyState } = require("../../../lib/oauth-utils");

async function exchangeGoogleToken(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!tokenResponse.ok) throw new Error("GOOGLE_TOKEN_EXCHANGE_FAILED");
  return tokenResponse.json();
}

async function getGoogleProfile(accessToken) {
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` }
  });

  if (!profileResponse.ok) throw new Error("GOOGLE_PROFILE_FAILED");
  return profileResponse.json();
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const callbackUrl = new URL(request.url, `https://${request.headers.host}`);
  const stateCheck = verifyState(request, response, "google", callbackUrl.searchParams.get("state"));
  if (!stateCheck.ok) {
    sendJson(response, 400, { ok: false, code: stateCheck.code, message: "Google 登入狀態驗證失敗，請重新開始註冊。" });
    return;
  }

  const missing = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OAUTH_STATE_SECRET"].filter(name => !process.env[name]);
  if (missing.length) {
    sendJson(response, 503, { ok: false, code: "GOOGLE_CALLBACK_NOT_CONFIGURED", message: "Google callback 尚未連接正式會員資料庫。未設定完成前不會交換 token 或保存個資。", missing });
    return;
  }

  const code = callbackUrl.searchParams.get("code");
  if (!code) {
    sendJson(response, 400, { ok: false, code: "GOOGLE_CODE_MISSING" });
    return;
  }

  try {
    const redirectUri = `${callbackUrl.origin}/api/auth/google/callback`;
    const token = await exchangeGoogleToken(code, redirectUri);
    const profile = await getGoogleProfile(token.access_token);
    const { member } = await upsertOAuthMember({ provider: "google", subject: profile.sub, displayName: profile.name || "", email: profile.email || "", preferredTaste: "鮮蝦蛋腸粉" });
    setSessionCookie(response, member.id, "google");
    response.statusCode = 302;
    response.setHeader("location", "/#member");
    response.end();
  } catch (error) {
    sendJson(response, 502, { ok: false, code: error.message || "GOOGLE_CALLBACK_FAILED", message: "Google 註冊失敗，請稍後再試。" });
  }
};
