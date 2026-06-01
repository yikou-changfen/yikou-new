const {
  getBearerToken,
  methodNotAllowed,
  readBody,
  requireConfiguredEnv,
  sendJson
} = require("../../../lib/member-utils");
const { completePosOrder } = require("../../../lib/supabase-utils");

function hasValidPosToken(request) {
  const expected = process.env.POS_API_TOKEN;
  if (!expected) return { ok: false, code: "POS_TOKEN_NOT_CONFIGURED" };
  const token = getBearerToken(request);
  if (!token || token !== expected) return { ok: false, code: "POS_AUTH_REQUIRED" };
  return { ok: true };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  const auth = hasValidPosToken(request);
  if (!auth.ok) {
    sendJson(response, 401, { ok: false, code: auth.code, message: "POS 完成訂單需要員工或系統授權。" });
    return;
  }

  try {
    const body = await readBody(request);
    const result = await completePosOrder({ memberId: body.memberId || null, posOrderId: body.posOrderId || "", channel: body.channel || "pos", totalAmount: body.totalAmount || 0, items: Array.isArray(body.items) ? body.items : [], storeId: body.storeId || "yikou-main" });
    sendJson(response, 200, {
      ok: true,
      order: { id: result.order.id, posOrderId: result.order.pos_order_id, totalAmount: result.order.total_amount },
      member: result.member ? { id: result.member.id, points: result.member.points, tier: result.member.tier } : null,
      pointsAdded: result.pointsAdded
    });
  } catch (error) {
    sendJson(response, error.status || 400, { ok: false, code: error.message || "POS_ORDER_COMPLETE_FAILED" });
  }
};
