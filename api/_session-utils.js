const crypto = require("crypto");

function base64urlJson(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(payload) {
  const secret = process.env.OAUTH_STATE_SECRET;
  if (!secret) return "";
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function createSession(memberId, provider) {
  const payload = base64urlJson({
    memberId,
    provider,
    issuedAt: Date.now()
  });
  return `${payload}.${sign(payload)}`;
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

function setSessionCookie(response, memberId, provider) {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  appendSetCookie(response, `yikou_member_session=${createSession(memberId, provider)}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${60 * 60 * 24 * 30}`);
}

function clearSessionCookie(response) {
  appendSetCookie(response, "yikou_member_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
}

function getSession(request) {
  const token = parseCookies(request).yikou_member_session || "";
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.memberId) return null;
    if (Date.now() - Number(parsed.issuedAt || 0) > 60 * 60 * 24 * 30 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

module.exports = {
  clearSessionCookie,
  getSession,
  setSessionCookie
};
