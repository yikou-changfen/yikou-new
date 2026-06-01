const { methodNotAllowed, sendJson } = require("../lib/member-utils");
const { buildIntegrationChecks, isReady } = require("../lib/integration-status");

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const checks = buildIntegrationChecks();
  const ready = isReady(checks);

  response.setHeader("cache-control", "no-store");
  sendJson(response, 200, {
    ok: true,
    ready,
    checkedAt: new Date().toISOString(),
    brand: "一口腸粉",
    checks
  });
};
