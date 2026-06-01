const {
  methodNotAllowed,
  requireConfiguredEnv,
  sendJson
} = require("../_member-utils");
const { getSession } = require("../_session-utils");
const { listCouponsForMember } = require("../_supabase-utils");

const statusLabels = {
  available: "可使用",
  redeemed: "已使用",
  expired: "已過期",
  void: "已作廢"
};

function resolveCouponStatus(coupon) {
  if (coupon.status === "available" && coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return "已過期";
  }
  return statusLabels[coupon.status] || coupon.status || "";
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  const session = getSession(request);
  if (!session) {
    sendJson(response, 401, {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "讀取優惠券包需要會員登入。"
    });
    return;
  }

  try {
    const coupons = await listCouponsForMember(session.memberId);
    sendJson(response, 200, {
      ok: true,
      coupons: coupons.map(coupon => ({
        id: coupon.id,
        title: coupon.title,
        detail: coupon.expires_at
          ? `${coupon.detail}｜期限 ${new Date(coupon.expires_at).toLocaleDateString("zh-TW")}`
          : coupon.detail,
        status: resolveCouponStatus(coupon),
        expiresAt: coupon.expires_at,
        createdAt: coupon.created_at
      }))
    });
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      code: error.message || "MEMBER_COUPONS_READ_FAILED"
    });
  }
};
