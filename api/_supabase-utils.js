function getSupabaseConfig() {
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

function requireSupabase() {
  const config = getSupabaseConfig();
  if (!config.url || !config.key) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }
  return config;
}

async function supabaseRequest(path, options = {}) {
  const config = requireSupabase();
  const url = `${config.url.replace(/\/$/, "")}/rest/v1/${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: config.key,
      authorization: `Bearer ${config.key}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error("SUPABASE_REQUEST_FAILED");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function resolveTier(points) {
  if (points >= 600) return "金印會員";
  if (points >= 250) return "紅籠會員";
  return "竹籠會員";
}

async function writeAuditLog({ actorId = "", actorRole, action, targetTable, targetId = null, metadata = {} }) {
  const rows = await supabaseRequest("audit_logs", {
    method: "POST",
    body: JSON.stringify([{
      actor_id: actorId || null,
      actor_role: actorRole,
      action,
      target_table: targetTable,
      target_id: targetId,
      metadata
    }])
  });
  return rows[0];
}

async function findIdentity(provider, providerSubject) {
  const rows = await supabaseRequest(`member_identities?provider=eq.${encodeURIComponent(provider)}&provider_subject=eq.${encodeURIComponent(providerSubject)}&select=member_id`);
  return rows && rows[0] ? rows[0] : null;
}

async function createMember(profile = {}) {
  const rows = await supabaseRequest("members", {
    method: "POST",
    body: JSON.stringify([{
      display_name: profile.displayName || "",
      phone: profile.phone || null,
      birthday: profile.birthday || null,
      preferred_taste: profile.preferredTaste || "鮮蝦蛋腸粉",
      marketing_opt_in: true,
      source: profile.provider || "oauth",
      points: 30,
      tier: "竹籠會員"
    }])
  });
  return rows[0];
}

async function createIdentity(memberId, profile) {
  const rows = await supabaseRequest("member_identities", {
    method: "POST",
    body: JSON.stringify([{
      member_id: memberId,
      provider: profile.provider,
      provider_subject: profile.subject,
      email: profile.email || null,
      verified_at: new Date().toISOString()
    }])
  });
  return rows[0];
}

async function getMember(memberId) {
  const rows = await supabaseRequest(`members?id=eq.${encodeURIComponent(memberId)}&select=*`);
  return rows && rows[0] ? rows[0] : null;
}

async function updateMember(memberId, patch) {
  const allowed = {};
  if ("displayName" in patch) allowed.display_name = String(patch.displayName || "").slice(0, 80);
  if ("phone" in patch) allowed.phone = String(patch.phone || "").slice(0, 40);
  if ("birthday" in patch) allowed.birthday = patch.birthday || null;
  if ("taste" in patch) allowed.preferred_taste = String(patch.taste || "").slice(0, 80);
  if ("marketingOptIn" in patch) allowed.marketing_opt_in = Boolean(patch.marketingOptIn);
  allowed.updated_at = new Date().toISOString();

  const rows = await supabaseRequest(`members?id=eq.${encodeURIComponent(memberId)}`, {
    method: "PATCH",
    body: JSON.stringify(allowed)
  });
  return rows[0];
}

async function getCouponForMember(memberId, couponId) {
  const rows = await supabaseRequest(`coupons?id=eq.${encodeURIComponent(couponId)}&member_id=eq.${encodeURIComponent(memberId)}&select=*`);
  return rows && rows[0] ? rows[0] : null;
}

async function listOrdersForMember(memberId, limit = 20) {
  return supabaseRequest(
    `orders?member_id=eq.${encodeURIComponent(memberId)}&select=id,pos_order_id,channel,total_amount,created_at,order_items(item_name,quantity,unit_price)&order=created_at.desc&limit=${Number(limit) || 20}`
  );
}

async function listCouponsForMember(memberId) {
  return supabaseRequest(
    `coupons?member_id=eq.${encodeURIComponent(memberId)}&select=id,title,detail,status,expires_at,created_at&order=created_at.desc`
  );
}

async function redeemCouponForMember({ memberId, couponId, orderId = null, redeemedBy = "member" }) {
  const coupon = await getCouponForMember(memberId, couponId);
  if (!coupon) {
    const error = new Error("COUPON_NOT_FOUND");
    error.status = 404;
    throw error;
  }
  if (coupon.status !== "available") {
    const error = new Error("COUPON_NOT_AVAILABLE");
    error.status = 409;
    throw error;
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    const error = new Error("COUPON_EXPIRED");
    error.status = 409;
    throw error;
  }

  const updated = await supabaseRequest(`coupons?id=eq.${encodeURIComponent(couponId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "redeemed" })
  });
  await supabaseRequest("coupon_redemptions", {
    method: "POST",
    body: JSON.stringify([{
      coupon_id: couponId,
      order_id: orderId,
      redeemed_by: redeemedBy
    }])
  });
  await writeAuditLog({
    actorId: memberId,
    actorRole: redeemedBy,
    action: "coupon.redeem",
    targetTable: "coupons",
    targetId: couponId,
    metadata: { orderId }
  });
  return updated[0];
}

async function completePosOrder({ memberId = null, posOrderId = "", channel = "pos", totalAmount = 0, items = [], storeId = "yikou-main" }) {
  const orderRows = await supabaseRequest("orders", {
    method: "POST",
    body: JSON.stringify([{
      member_id: memberId || null,
      pos_order_id: posOrderId || null,
      channel,
      store_id: storeId,
      total_amount: Number(totalAmount || 0),
      payment_status: "paid",
      fulfillment_status: "completed"
    }])
  });
  const order = orderRows[0];

  if (items.length) {
    await supabaseRequest("order_items", {
      method: "POST",
      body: JSON.stringify(items.map(item => ({
        order_id: order.id,
        item_name: String(item.name || item.itemName || "未命名品項").slice(0, 120),
        quantity: Math.max(1, Number(item.quantity || 1)),
        unit_price: Math.max(0, Number(item.unitPrice || item.price || 0))
      })))
    });
  }

  let member = null;
  let pointsAdded = 0;
  if (memberId) {
    member = await getMember(memberId);
    if (member) {
      pointsAdded = Math.max(0, Math.round(Number(totalAmount || 0) / 10));
      await supabaseRequest("point_ledger", {
        method: "POST",
        body: JSON.stringify([{
          member_id: memberId,
          order_id: order.id,
          delta: pointsAdded,
          reason: "pos_order_completed",
          created_by: "pos"
        }])
      });
      const nextPoints = Number(member.points || 0) + pointsAdded;
      const rows = await supabaseRequest(`members?id=eq.${encodeURIComponent(memberId)}`, {
        method: "PATCH",
        body: JSON.stringify({
          points: nextPoints,
          tier: resolveTier(nextPoints),
          updated_at: new Date().toISOString()
        })
      });
      member = rows[0];
    }
  }

  await writeAuditLog({
    actorId: "pos",
    actorRole: "staff",
    action: "order.complete",
    targetTable: "orders",
    targetId: order.id,
    metadata: { posOrderId, memberId, pointsAdded }
  });

  return { order, member, pointsAdded };
}

async function upsertOAuthMember(profile) {
  const identity = await findIdentity(profile.provider, profile.subject);
  if (identity) {
    const member = await getMember(identity.member_id);
    return { member, created: false };
  }

  const member = await createMember(profile);
  await createIdentity(member.id, profile);
  return { member, created: true };
}

module.exports = {
  completePosOrder,
  getCouponForMember,
  getMember,
  listCouponsForMember,
  listOrdersForMember,
  requireSupabase,
  redeemCouponForMember,
  updateMember,
  upsertOAuthMember,
  writeAuditLog
};
