const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  Object.entries(jsonHeaders).forEach(([key, value]) => response.setHeader(key, value));
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 64) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
    });
    request.on("error", reject);
  });
}

function requireConfiguredEnv(response) {
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter(name => !process.env[name]);
  if (!process.env.OAUTH_STATE_SECRET && !process.env.SESSION_SECRET) missing.push("OAUTH_STATE_SECRET_OR_SESSION_SECRET");
  if (!missing.length) return true;
  sendJson(response, 503, { ok: false, code: "MEMBER_BACKEND_NOT_CONFIGURED", message: "會員後端尚未設定，前端會使用不保存個資的安全本機模式。", missing });
  return false;
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function maskMember(member = {}) {
  return {
    memberId: member.memberId || member.member_id || "",
    displayName: member.name ? `${String(member.name).slice(0, 1)}**` : "",
    maskedPhone: member.phone ? `${String(member.phone).replace(/\D/g, "").slice(0, 4)} *** ${String(member.phone).replace(/\D/g, "").slice(-3)}` : "",
    birthdayMonth: member.birthday ? String(member.birthday).slice(5, 7) : "",
    taste: member.taste || "",
    marketingOptIn: Boolean(member.marketingOptIn ?? member.marketing_opt_in),
    points: Number(member.points || 0),
    tier: member.tier || "竹籠會員",
    lineBound: Boolean(member.lineUid || member.line_uid),
    updatedAt: member.updatedAt || member.updated_at || ""
  };
}

function methodNotAllowed(response, allowed) {
  response.setHeader("allow", allowed.join(", "));
  sendJson(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED", allowed });
}

module.exports = { getBearerToken, maskMember, methodNotAllowed, readBody, requireConfiguredEnv, sendJson };
