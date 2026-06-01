const { methodNotAllowed, sendJson } = require("./_member-utils");

function normalizePlaceResource(placeId) {
  if (!placeId) return "";
  return placeId.startsWith("places/") ? placeId : `places/${placeId}`;
}

function formatHours(place) {
  const current = place.currentOpeningHours || {};
  const regular = place.regularOpeningHours || {};
  return {
    ok: true,
    source: "google-places",
    fetchedAt: new Date().toISOString(),
    placeId: place.id || "",
    name: place.displayName?.text || "一口腸粉",
    businessStatus: place.businessStatus || "",
    openNow: Boolean(current.openNow),
    currentWeek: current.weekdayDescriptions || [],
    regularWeek: regular.weekdayDescriptions || [],
    nextOpenTime: current.nextOpenTime || "",
    nextCloseTime: current.nextCloseTime || "",
    googleMapsUri: place.googleMapsUri || "",
    nationalPhoneNumber: place.nationalPhoneNumber || ""
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "GET") {
    methodNotAllowed(response, ["GET"]);
    return;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeResource = normalizePlaceResource(process.env.GOOGLE_PLACE_ID || "ChIJ0wZdQgA9aTQR-dLMJWRvNEc");

  if (!apiKey || !placeResource) {
    sendJson(response, 503, {
      ok: false,
      code: "GOOGLE_BUSINESS_HOURS_NOT_CONFIGURED",
      message: "尚未設定 Google Places API Key 或一口腸粉 Google Place ID。",
      missing: [
        ...(!apiKey ? ["GOOGLE_PLACES_API_KEY"] : []),
        ...(!placeResource ? ["GOOGLE_PLACE_ID"] : [])
      ]
    });
    return;
  }

  try {
    const url = new URL(`https://places.googleapis.com/v1/${placeResource}`);
    url.searchParams.set("languageCode", "zh-TW");
    url.searchParams.set("regionCode", "TW");

    const googleResponse = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "id",
          "displayName",
          "businessStatus",
          "currentOpeningHours",
          "regularOpeningHours",
          "googleMapsUri",
          "nationalPhoneNumber"
        ].join(",")
      }
    });

    if (!googleResponse.ok) {
      sendJson(response, googleResponse.status, {
        ok: false,
        code: "GOOGLE_PLACES_REQUEST_FAILED",
        message: "無法取得 Google 商家營業資訊。",
        status: googleResponse.status
      });
      return;
    }

    const place = await googleResponse.json();
    response.setHeader("cache-control", "s-maxage=3600, stale-while-revalidate=86400");
    sendJson(response, 200, formatHours(place));
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      code: "BUSINESS_HOURS_UNAVAILABLE",
      message: "營業資訊同步暫時失敗。",
      detail: error.message
    });
  }
};
