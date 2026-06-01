const { methodNotAllowed, sendJson } = require("./_member-utils");

function isAllowedLineUrl(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname === "lin.ee" ||
      url.hostname === "line.me" ||
      url.hostname.endsWith(".line.me")
    );
  } catch {
    return false;
  }
}

module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const lineOfficialAccountUrl = process.env.LINE_OFFICIAL_ACCOUNT_URL || "";

  response.setHeader("cache-control", "s-maxage=300, stale-while-revalidate=3600");
  sendJson(response, 200, {
    ok: true,
    brand: "一口腸粉",
    lineOfficialAccountUrl: isAllowedLineUrl(lineOfficialAccountUrl) ? lineOfficialAccountUrl : "",
    lineOfficialAccountConfigured: isAllowedLineUrl(lineOfficialAccountUrl)
  });
};
