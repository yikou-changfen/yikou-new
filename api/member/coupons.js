const { methodNotAllowed, requireConfiguredEnv, sendJson } = require("../_member-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  sendJson(response, 501, {
    ok: false,
    code: "MEMBER_COUPONS_NOT_CONNECTED",
    message: "優惠券包需先連接會員資料庫。"
  });
};
