const { methodNotAllowed } = require("../../_member-utils");
const { createSignedState, getBaseUrl, missingOAuth, setStateCookie } = require("../_oauth-utils");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const missing = ["LINE_LOGIN_CHANNEL_ID", "OAUTH_STATE_SECRET"].filter(name => !process.env[name]);
  if (missing.length) {
    missingOAuth(response, "line", missing);
    return;
  }

  const baseUrl = getBaseUrl(request);
  const callbackUrl = `${baseUrl}/api/auth/line/callback`;
  const state = createSignedState("line");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINE_LOGIN_CHANNEL_ID,
    redirect_uri: callbackUrl,
    state,
    scope: "profile openid email"
  });

  setStateCookie(response, "line", state);
  response.statusCode = 302;
  response.setHeader("location", `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`);
  response.end();
};
