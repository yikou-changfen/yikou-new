function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.setHeader("cache-control", "no-store");
  response.end(JSON.stringify(payload));
}

function has(name) {
  return Boolean(process.env[name]);
}

function status(required) {
  const missing = required.filter(name => !has(name));
  return {
    configured: missing.length === 0,
    missing
  };
}

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("allow", "GET");
    sendJson(response, 405, { ok: false, code: "METHOD_NOT_ALLOWED", allowed: ["GET"] });
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

  sendJson(response, 200, {
    ok: true,
    ready,
    checkedAt: new Date().toISOString(),
    brand: "一口腸粉",
    checks
  });
};
