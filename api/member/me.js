const { methodNotAllowed, requireConfiguredEnv, sendJson } = require("../_member-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "PATCH") {
    methodNotAllowed(response, ["GET", "PATCH"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  sendJson(response, 501, {
    ok: false,
    code: "MEMBER_PROFILE_NOT_CONNECTED",
    message: "會員資料庫已設定後才能讀寫會員資料。"
  });
};
