const { methodNotAllowed, sendJson } = require("../lib/member-utils");

function has(name) {
  return Boolean(process.env[name]);
}

function status(required) {
  const missing = required.filter(name => {
    if (name === "OAUTH_STATE_SECRET") return !has("OAUTH_STATE_SECRET") && !has("SESSION_SECRET");
    return !has(name);
  });
  return {
    configured: missing.length === 0,
    missing
  };
}

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const checks = {
    googleBusinessHours: status(["GOOGLE_PLACES_API_KEY"]),
    googlePlace: {
      configured: true,
      placeId: process.env.GOOGLE_PLACE_ID || "ChIJ0wZdQgA9aTQR-dLMJWRvNEc"
    },
    lineOfficialAccount: status(["LINE_OFFICIAL_ACCOUNT_URL"]),
    oauthSecurity: status(["OAUTH_STATE_SECRET"]),
    lineLogin: status(["LINE_LOGIN_CHANNEL_ID", "LINE_LOGIN_CHANNEL_SECRET", "OAUTH_STATE_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]),
    googleLogin: status(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "OAUTH_STATE_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]),
    memberDatabase: status(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OAUTH_STATE_SECRET"]),
    posIntegration: status(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "OAUTH_STATE_SECRET", "POS_API_TOKEN"])
  };

  const ready = Object.values(checks).every(check => check.configured);

  response.setHeader("cache-control", "no-store");
  sendJson(response, 200, {
    ok: true,
    ready,
    checkedAt: new Date().toISOString(),
    brand: "一口腸粉",
    checks
  });
};
