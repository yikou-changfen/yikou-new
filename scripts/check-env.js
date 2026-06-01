const { buildIntegrationChecks } = require("../lib/integration-status");

function main() {
  const checks = buildIntegrationChecks();
  const report = Object.entries(checks).map(([name, check]) => ({ name, ...check }));

  const ready = report.every(item => item.configured);
  console.log(JSON.stringify({
    ready,
    googlePlaceId: checks.googlePlace.placeId,
    checks: report
  }, null, 2));

  if (!ready) process.exitCode = 1;
}

main();
