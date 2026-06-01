const { methodNotAllowed } = require("../../../lib/member-utils");
const { createSignedState, getBaseUrl, missingOAuth, setStateCookie } = require("../../../lib/oauth-utils");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const missing = ["GOOGLE_CLIENT_ID"].filter(name => !process.env[name]);
  if (!process.env.OAUTH_STATE_SECRET && !process.env.SESSION_SECRET) missing.push("OAUTH_STATE_SECRET_OR_SESSION_SECRET");
  if (missing.length) {
    missingOAuth(response, "google", missing);
    return;
  }

  const baseUrl = getBaseUrl(request);
  const callbackUrl = `${baseUrl}/api/auth/google/callback`;
  const state = createSignedState("google");
  const params = new URLSearchParams({ response_type: "code", client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: callbackUrl, state, scope: "openid email profile", prompt: "select_account", access_type: "offline" });

  setStateCookie(response, "google", state);
  response.statusCode = 302;
  response.setHeader("location", `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  response.end();
};
