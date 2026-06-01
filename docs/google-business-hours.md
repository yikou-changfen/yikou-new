# Google 商家營業資訊自動追蹤

## 一口腸粉商家資料

```text
Place ID: ChIJ0wZdQgA9aTQR-dLMJWRvNEc
地址：404 台灣臺中市北區新北里一中街 132-134 號
```

`GOOGLE_PLACE_ID` 已有預設值；正式部署只需要補 `GOOGLE_PLACES_API_KEY`。

## API 端點

```text
GET /api/business-hours
```

未設定 `GOOGLE_PLACES_API_KEY` 時會回：

```json
{
  "ok": false,
  "code": "GOOGLE_BUSINESS_HOURS_NOT_CONFIGURED",
  "missing": ["GOOGLE_PLACES_API_KEY"]
}
```

設定完成後，API 會讀 Google Places Details，並回傳：

- 商家名稱
- formatted address
- 今日營業狀態
- weekday_text
- lastSyncedAt

前台首頁的「會員與店家資訊」區塊會自動呼叫 `/api/business-hours`，設定完成後不需要改 HTML。

## Vercel 環境變數

```text
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=ChIJ0wZdQgA9aTQR-dLMJWRvNEc
```

## Google Cloud 建議

- 啟用 Places API。
- API key 不要放前端，不要寫進 `index.html`。
- API key 只放 Vercel Environment Variables。
- 若使用 HTTP referrer restriction，需確認 serverless function 能正常呼叫；較穩定作法是使用 API restrictions 限制只可呼叫 Places API。

## 驗證方式

```bash
curl https://yikou-cheungfun-line-order-v2.vercel.app/api/business-hours
```

健康檢查：

```bash
curl https://yikou-cheungfun-line-order-v2.vercel.app/api/health
```

當 `checks.googleBusinessHours.configured` 為 `true`，首頁會顯示最新 Google 商家營業資訊。
