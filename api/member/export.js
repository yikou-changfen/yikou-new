const {
  maskMember,
  methodNotAllowed,
  requireConfiguredEnv,
  sendJson
} = require("../_member-utils");
const { getSession } = require("../_session-utils");
const { getMember, writeAuditLog } = require("../_supabase-utils");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  if (!requireConfiguredEnv(response)) return;

  const session = getSession(request);
  if (!session) {
    sendJson(response, 401, {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "匯出會員資料需要登入。"
    });
    return;
  }

  try {
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
      member: maskMember({
        memberId: member.id,
        name: member.display_name,
        phone: member.phone,
        birthday: member.birthday,
        taste: member.preferred_taste,
        marketingOptIn: member.marketing_opt_in,
        points: member.points,
        tier: member.tier,
        updatedAt: member.updated_at
      })
    });
  } catch (error) {
    sendJson(response, 502, {
      ok: false,
      code: error.message || "MEMBER_EXPORT_FAILED"
    });
  }
};
