const { methodNotAllowed, sendJson } = require("../_member-utils");

module.exports = function handler(request, response) {
  if (request.method !== "POST") {
    methodNotAllowed(response, ["POST"]);
    return;
  }

  response.setHeader("set-cookie", "yikou_member_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  sendJson(response, 200, {
    ok: true,
    message: "已登出會員。"
  });
};
