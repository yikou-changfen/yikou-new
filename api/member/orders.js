const { methodNotAllowed, requireConfiguredEnv, sendJson } = require("../_member-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  sendJson(response, 501, {
    ok: false,
    code: "MEMBER_ORDERS_NOT_CONNECTED",
    message: "訂單紀錄需先連接會員資料庫。"
  });
};
