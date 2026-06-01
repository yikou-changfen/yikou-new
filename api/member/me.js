const {
  maskMember,
  methodNotAllowed,
  readBody,
  requireConfiguredEnv,
  sendJson
} = require("../_member-utils");
const { getSession } = require("../_session-utils");
const { getMember, updateMember } = require("../_supabase-utils");

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

  if (request.method === "GET") {
    try {
      const member = await getMember(session.memberId);
      if (!member) {
        sendJson(response, 404, { ok: false, code: "MEMBER_NOT_FOUND" });
        return;
      }
      sendJson(response, 200, {
        ok: true,
        authProvider: session.provider,
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
        code: error.message || "MEMBER_READ_FAILED"
      });
    }
    return;
  }

  if (request.method === "PATCH") {
    try {
      const body = await readBody(request);
      const member = await updateMember(session.memberId, body);
      sendJson(response, 200, {
        ok: true,
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
    } catch {
      sendJson(response, 400, { ok: false, code: "MEMBER_UPDATE_FAILED" });
    }
    return;
  }

  methodNotAllowed(response, ["GET", "PATCH"]);
};
