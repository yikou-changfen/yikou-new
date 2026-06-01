const DEFAULT_GOOGLE_PLACE_ID = "ChIJ0wZdQgA9aTQR-dLMJWRvNEc";
const OAUTH_SECRET_GROUP = "OAUTH_STATE_SECRET_OR_SESSION_SECRET";

const requiredGroups = {
  googleBusinessHours: ["GOOGLE_PLACES_API_KEY"],
  lineOfficialAccount: ["LINE_OFFICIAL_ACCOUNT_URL"],
  oauthSecurity: [OAUTH_SECRET_GROUP],
  lineLogin: ["LINE_LOGIN_CHANNEL_ID", "LINE_LOGIN_CHANNEL_SECRET", OAUTH_SECRET_GROUP, "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  googleLogin: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", OAUTH_SECRET_GROUP, "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  memberDatabase: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", OAUTH_SECRET_GROUP],
  posIntegration: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", OAUTH_SECRET_GROUP, "POS_API_TOKEN"]
};

function has(env, name) {
  return Boolean(env[name]);
}

function missingFor(env, names) {
  return names.filter(name => {
    if (name === OAUTH_SECRET_GROUP) {
      return !has(env, "OAUTH_STATE_SECRET") && !has(env, "SESSION_SECRET");
    }
    return !has(env, name);
  });
}

function statusFor(env, names) {
  const missing = missingFor(env, names);
  return {
    configured: missing.length === 0,
    missing
  };
}

function buildIntegrationChecks(env = process.env) {
  const checks = Object.fromEntries(
    Object.entries(requiredGroups).map(([name, names]) => [name, statusFor(env, names)])
  );
  checks.googlePlace = {
    configured: true,
    placeId: env.GOOGLE_PLACE_ID || DEFAULT_GOOGLE_PLACE_ID
  };
  return checks;
}

function isReady(checks) {
  return Object.values(checks).every(check => check.configured);
}

module.exports = {
  DEFAULT_GOOGLE_PLACE_ID,
  OAUTH_SECRET_GROUP,
  buildIntegrationChecks,
  isReady,
  missingFor,
  requiredGroups
};
