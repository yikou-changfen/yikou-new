const { sendJson } = require("../../_member-utils");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    sendJson(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED", allowed: ["GET"] });
    return;
  }

  const missing = ["LINE_LOGIN_CHANNEL_ID", "OAUTH_STATE_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter(name => !process.env[name]);
  if (missing.length) {
    sendJson(response, 503, {
      ok: false,
      code: "LINE_LOGIN_NOT_CONFIGURED",
      message: "LINE 會員登入尚未設定完成。",
      missing
    });
    return;
  }

  sendJson(response, 501, { ok: false, code: "LINE_LOGIN_CALLBACK_NOT_CONNECTED" });
};
