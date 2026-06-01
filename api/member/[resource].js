const {
  maskMember,
  methodNotAllowed,
  readBody,
  requireConfiguredEnv,
  sendJson
} = require("../../lib/member-utils");
const { getSession } = require("../../lib/session-utils");
const {
  getMember,
  listCouponsForMember,
  listOrdersForMember,
  updateMember,
  writeAuditLog
} = require("../../lib/supabase-utils");

const statusLabels = {
  available: "可使用",
  redeemed: "已使用",
  expired: "已過期",
  void: "已作廢"
};

function getResource(request) {
  const url = new URL(request.url, `https://${request.headers.host || "localhost"}`);
  return url.pathname.split("/").filter(Boolean).pop();
}

function summarizeItems(items = []) {
  return items.map(item => {
    const quantity = Number(item.quantity || 1);
    return `${item.item_name} x${quantity}`;
  }).join("、");
}

function resolveCouponStatus(coupon) {
  if (coupon.status === "available" && coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return "已過期";
  }
  return statusLabels[coupon.status] || coupon.status || "";
}

function formatMember(member) {
  return maskMember({
    memberId: member.id,
    name: member.display_name,
    phone: member.phone,
    birthday: member.birthday,
    taste: member.preferred_taste,
    marketingOptIn: member.marketing_opt_in,
    points: member.points,
    tier: member.tier,
    updatedAt: member.updated_at
  });
}

async function handleProfile(request, response, session) {
  if (request.method === "GET") {
    const member = await getMember(session.memberId);
    if (!member) {
      sendJson(response, 404, { ok: false, code: "MEMBER_NOT_FOUND" });
      return;
    }
    sendJson(response, 200, {
      ok: true,
      authProvider: session.provider,
      member: formatMember(member)
    });
    return;
  }

  if (request.method === "PATCH") {
    const body = await readBody(request);
    const member = await updateMember(session.memberId, body);
    sendJson(response, 200, {
      ok: true,
      member: formatMember(member)
    });
    return;
  }

  methodNotAllowed(response, ["GET", "PATCH"]);
}

async function handleOrders(request, response, session) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

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
}

async function handleCoupons(request, response, session) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

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
}

async function handleExport(request, response, session) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  const member = await getMember(session.memberId);
  if (!member) {
    sendJson(response, 404, { ok: false, code: "MEMBER_NOT_FOUND" });
    return;
  }

  await writeAuditLog({
    actorId: session.memberId,
    actorRole: "member",
    action: "member.export.redacted",
    targetTable: "members",
    targetId: session.memberId,
    metadata: { privacyMode: "redacted" }
  });

  sendJson(response, 200, {
    ok: true,
    privacyMode: "redacted-member-export",
    exportedAt: new Date().toISOString(),
    member: formatMember(member)
  });
}

module.exports = async function handler(request, response) {
  if (!requireConfiguredEnv(response)) return;

  const session = getSession(request);
  if (!session) {
    sendJson(response, 401, {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "請先透過 LINE 或 Google 註冊/登入。"
    });
    return;
  }

  try {
    const resource = getResource(request);
    if (resource === "me") return await handleProfile(request, response, session);
    if (resource === "orders") return await handleOrders(request, response, session);
    if (resource === "coupons") return await handleCoupons(request, response, session);
    if (resource === "export") return await handleExport(request, response, session);
    sendJson(response, 404, { ok: false, code: "MEMBER_ENDPOINT_NOT_FOUND" });
  } catch (error) {
    sendJson(response, error.status || 502, {
      ok: false,
      code: error.message || "MEMBER_ENDPOINT_FAILED"
    });
  }
};
