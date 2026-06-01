const {
  methodNotAllowed,
  requireConfiguredEnv,
  sendJson
} = require("../_member-utils");
const { getSession } = require("../_session-utils");
const { listOrdersForMember } = require("../_supabase-utils");

function summarizeItems(items = []) {
  return items.map(item => {
    const quantity = Number(item.quantity || 1);
    return `${item.item_name} x${quantity}`;
  }).join("、");
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
      message: "讀取訂單紀錄需要會員登入。"
    });
    return;
  }

  try {
    const orders = await listOrdersForMember(session.memberId);
    sendJson(response, 200, {
      ok: true,
      orders: orders.map(order => ({
        id: order.id,
        title: order.pos_order_id ? `POS 訂單 ${order.pos_order_id}` : `${order.channel || "會員"} 訂單`,
        date: order.created_at ? new Date(order.created_at).toLocaleDateString("zh-TW") : "",
        items: summarizeItems(order.order_items || []),
        total: Number(order.total_amount || 0),
        points: Math.max(0, Math.round(Number(order.total_amount || 0) / 10)),
        createdAt: order.created_at
      }))
    });
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      code: error.message || "MEMBER_ORDERS_READ_FAILED"
    });
  }
};
