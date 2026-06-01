const { getBearerToken, methodNotAllowed, requireConfiguredEnv, sendJson } = require("../../_member-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  if (!process.env.POS_API_TOKEN || getBearerToken(request) !== process.env.POS_API_TOKEN) {
    sendJson(response, 401, {
      ok: false,
      code: "POS_TOKEN_INVALID",
      message: "POS 串接需要有效的伺服器 token。"
    });
    return;
  }

  sendJson(response, 501, {
    ok: false,
    code: "POS_ORDER_COMPLETE_NOT_CONNECTED",
    message: "POS 完成訂單需先連接會員資料庫。"
  });
};
