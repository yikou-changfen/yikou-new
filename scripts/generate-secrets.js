const crypto = require("crypto");

function createToken(byteLength) {
  return crypto.randomBytes(byteLength).toString("base64url");
}

const values = {
  OAUTH_STATE_SECRET: createToken(48),
  SESSION_SECRET: createToken(48),
  POS_API_TOKEN: createToken(32)
};

if (new Set(Object.values(values)).size !== Object.keys(values).length) {
  throw new Error("Generated duplicate secret values. Please run the command again.");
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(values, null, 2));
} else {
  console.log("# 一口腸粉安全密鑰");
  console.log("# 請貼到 Vercel Environment Variables，不要 commit 到 GitHub。");
  console.log("# 每次執行都會產生新值，換值後需要重新部署。");
  for (const [key, value] of Object.entries(values)) {
    console.log(`${key}=${value}`);
  }
}
