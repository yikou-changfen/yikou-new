const { methodNotAllowed, requireConfiguredEnv, sendJson } = require("../_member-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  sendJson(response, 501, {
    ok: false,
    code: "COUPON_REDEEM_NOT_CONNECTED",
    message: "優惠券核銷需先連接會員資料庫與登入 session。"
  });
};
