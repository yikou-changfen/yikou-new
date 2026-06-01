const { methodNotAllowed, sendJson } = require("../../lib/member-utils");
const { clearSessionCookie } = require("../../lib/session-utils");

module.exports = function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  clearSessionCookie(response);
  sendJson(response, 200, {
    ok: true,
    message: "已登出會員。"
  });
};
