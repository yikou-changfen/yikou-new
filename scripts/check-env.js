const groups = {
  googleBusinessHours: ["GOOGLE_PLACES_API_KEY"],
  lineOfficialAccount: ["LINE_OFFICIAL_ACCOUNT_URL"],
  oauthSecurity: ["OAUTH_STATE_SECRET_OR_SESSION_SECRET"],
  lineLogin: ["LINE_LOGIN_CHANNEL_ID", "LINE_LOGIN_CHANNEL_SECRET"],
  googleLogin: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  memberDatabase: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
  posIntegration: ["POS_API_TOKEN"]
};

const defaults = {
  GOOGLE_PLACE_ID: process.env.GOOGLE_PLACE_ID || "ChIJ0wZdQgA9aTQR-dLMJWRvNEc"
};

function missingFor(names) {
  return names.filter(name => {
    if (name === "OAUTH_STATE_SECRET_OR_SESSION_SECRET") {
      return !process.env.OAUTH_STATE_SECRET && !process.env.SESSION_SECRET;
    }
    return !process.env[name];
  });
}

function main() {
  const report = Object.entries(groups).map(([name, envNames]) => ({
    name,
    configured: missingFor(envNames).length === 0,
    missing: missingFor(envNames)
  }));

  const ready = report.every(item => item.configured);
  console.log(JSON.stringify({
    ready,
    googlePlaceId: defaults.GOOGLE_PLACE_ID,
    checks: report
  }, null, 2));

  if (!ready) process.exitCode = 1;
}

main();
