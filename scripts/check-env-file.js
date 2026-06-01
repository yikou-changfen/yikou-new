const fs = require("fs");
const path = require("path");
const { requiredGroups, missingFor } = require("../lib/integration-status");

const filePath = process.argv[2] || ".env.production.local";

const validators = {
  GOOGLE_PLACE_ID(value) {
    return value === "ChIJ0wZdQgA9aTQR-dLMJWRvNEc";
  },
  LINE_OFFICIAL_ACCOUNT_URL(value) {
    return /^https:\/\/(lin\.ee|page\.line\.me)\//.test(value);
  },
  SUPABASE_URL(value) {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value);
  },
  GOOGLE_CLIENT_ID(value) {
    return /\.apps\.googleusercontent\.com$/.test(value);
  },
  SESSION_SECRET(value) {
    return value.length >= 32;
  },
  OAUTH_STATE_SECRET(value) {
    return value.length >= 32;
  },
  POS_API_TOKEN(value) {
    return value.length >= 24;
  }
};

function parseEnv(content) {
  const env = {};
  content.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      throw new Error(`第 ${index + 1} 行不是 KEY=VALUE 格式`);
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  });
  return env;
}

function validate(env) {
  const warnings = [];
  Object.entries(validators).forEach(([key, validator]) => {
    if (env[key] && !validator(env[key])) warnings.push(`${key} 格式看起來不正確`);
  });
  if (!env.GOOGLE_PLACE_ID) warnings.push("GOOGLE_PLACE_ID 未設定，會使用程式預設的一口腸粉 Place ID");
  return warnings;
}

function redactedEnv(env) {
  return Object.fromEntries(Object.entries(env).map(([key, value]) => [
    key,
    value ? `${value.slice(0, Math.min(4, value.length))}${"*".repeat(Math.min(8, Math.max(0, value.length - 4)))}` : ""
  ]));
}

function main() {
  const absolute = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolute)) {
    console.error(`找不到 env 檔：${absolute}`);
    console.error("請先複製 env.production.example 成 .env.production.local，再填入正式值。");
    process.exit(1);
  }

  const env = parseEnv(fs.readFileSync(absolute, "utf8"));
  const checks = Object.entries(requiredGroups).map(([name, keys]) => ({
    name,
    configured: missingFor(env, keys).length === 0,
    missing: missingFor(env, keys)
  }));
  const warnings = validate(env);
  const ready = checks.every(check => check.configured) && warnings.length === 0;

  console.log(JSON.stringify({
    ready,
    file: absolute,
    checks,
    warnings,
    redacted: redactedEnv(env)
  }, null, 2));

  if (!ready) process.exitCode = 1;
}

main();
