const {
  methodNotAllowed,
  readBody,
  requireConfiguredEnv,
  sendJson
} = require("../../lib/member-utils");
const { getSession } = require("../../lib/session-utils");
const { redeemCouponForMember } = require("../../lib/supabase-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  const session = getSession(request);
  if (!session) {
    sendJson(response, 401, { ok: false, code: "AUTH_REQUIRED", message: "優惠券核銷需要會員登入。" });
    return;
  }

  try {
    const body = await readBody(request);
    if (!body.couponId) {
      sendJson(response, 400, { ok: false, code: "COUPON_ID_REQUIRED" });
      return;
    }
    const coupon = await redeemCouponForMember({ memberId: session.memberId, couponId: body.couponId, orderId: body.orderId || null, redeemedBy: "member" });
    sendJson(response, 200, { ok: true, coupon: { id: coupon.id, title: coupon.title, status: coupon.status } });
  } catch (error) {
    sendJson(response, error.status || 400, { ok: false, code: error.message || "COUPON_REDEEM_FAILED" });
  }
};
