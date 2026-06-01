# 上線檢查清單

## 1. 建立 Supabase

1. 建立 Supabase project。
2. 執行 `supabase/schema.sql`。
3. 到 Project Settings 取得：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. 把兩個值設定到 Vercel Environment Variables。
5. 確認前台不使用 anon key 直連資料表；會員資料只透過 `/api/member/*` 讀寫。

## 2. 設定 Google 商家營業資訊

已確認：

```text
GOOGLE_PLACE_ID=ChIJ0wZdQgA9aTQR-dLMJWRvNEc
地址：404 台灣臺中市北區新北里一中街 132-134 號
```

需要新增：

```text
GOOGLE_PLACES_API_KEY=
```

API Key 請只開 Places API 權限，並在 Google Cloud Console 加上合理的 key restriction。

## 3. 設定 LINE 店家入口

在 LINE 官方帳號後台取得加入好友連結，填入：

```text
LINE_OFFICIAL_ACCOUNT_URL=https://lin.ee/xxxxxxx
```

## 4. 設定 LINE Login

Vercel 正式網址：

```text
https://yikou-cheungfun-line-order-v2.vercel.app
```

LINE Developers callback：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/auth/line/callback
```

Vercel 環境變數：

```text
LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=
```

## 5. 設定 Google OAuth

Google Cloud Console OAuth redirect URI：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/auth/google/callback
```

Vercel 環境變數：

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 6. 設定安全密鑰

產生長隨機字串：

```text
OAUTH_STATE_SECRET=
SESSION_SECRET=
POS_API_TOKEN=
```

`OAUTH_STATE_SECRET` 用於 OAuth state 與會員 session 簽章；若現有專案已有 `SESSION_SECRET`，API 會接受它作為備援，但正式長期建議另外設定 `OAUTH_STATE_SECRET`。  
`POS_API_TOKEN` 只給 POS/後台系統使用，不可放前端。

## 7. 上線後健康檢查

打開：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/health
```

檢查：

- `ready` 是否為 `true`
- `googleBusinessHours.configured`
- `lineOfficialAccount.configured`
- `lineLogin.configured`
- `googleLogin.configured`
- `memberDatabase.configured`
- `posIntegration.configured`

`/api/health` 不會回傳密鑰值，只會回傳缺少哪些環境變數。

## 8. 本機安全驗證

```bash
node scripts/verify-api.js
node scripts/check-env.js
```

缺少正式密鑰時 `check-env` 會回非零狀態，這是預期行為。
