# 一口腸粉官網上線交接清單

本專案目標是把一口腸粉官網整理成中國風品牌首頁，並完成安全會員系統、LINE / Google 會員註冊、LINE 店家連結、Google 商家營業資訊帶入。

## 線上網址

- 官網：https://yikou-cheungfun-line-order-v2.vercel.app/
- 串接設定檢查：https://yikou-cheungfun-line-order-v2.vercel.app/setup.html
- 健康檢查 API：https://yikou-cheungfun-line-order-v2.vercel.app/api/health
- 後台管理：https://yikou-cheungfun-line-order-v2.vercel.app/admin
- POS 收銀：https://yikou-cheungfun-line-order-v2.vercel.app/admin/pos
- 會員中心：https://yikou-cheungfun-line-order-v2.vercel.app/member

## 目前已完成

- 中國風品牌首頁：菜單、品牌故事、營業資訊、會員入口。
- 安全會員前端：正式後端未設定前，不永久保存姓名、手機、生日、LINE UID 等個資。
- 會員 API 骨架：`/api/member/me`、`/api/member/orders`、`/api/member/coupons`、`/api/member/export`。
- OAuth API 骨架：`/api/auth/line/start`、`/api/auth/line/callback`、`/api/auth/google/start`、`/api/auth/google/callback`。
- Google 商家營業資訊 API：`/api/business-hours`，已使用一口腸粉 Place ID。
- Supabase 安全 schema：RLS、遮罩 view、會員 identities、訂單、優惠券、點數與 audit log。
- POS 訂單完成 API：`POST /api/pos/orders/complete`，需 `POS_API_TOKEN`。
- 設定檢查頁：會讀 `/api/health` 並列出缺少的環境變數。

## 目前仍缺的 Vercel 環境變數

以下是正式啟用前一定要補上的 secret。不要寫進前端檔案或公開 repo。

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_PLACES_API_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
LINE_OFFICIAL_ACCOUNT_URL
POS_API_TOKEN
```

目前已確認：

```text
GOOGLE_PLACE_ID=ChIJ0wZdQgA9aTQR-dLMJWRvNEc
```

可以先複製 `env.production.example` 成 `.env.production.local`，填入正式值後執行：

```bash
npm run check:env:file
```

確認通過後，再把 `.env.production.local` 內的 key/value 逐項貼到 Vercel Project Settings > Environment Variables。`.env.production.local` 不可以 commit 到 GitHub。

## 安全原則

- 會員個資只存在後端資料庫，不寫入 localStorage。
- 前端只保存遮罩後、低敏、可丟棄的會員狀態。
- OAuth state 使用簽章，避免 CSRF。
- Session 使用 HttpOnly cookie，避免前端 JS 讀取 token。
- Supabase 使用 service role 僅限 serverless API 端，不能暴露到瀏覽器。
- 會員資料匯出只能回傳遮罩資料，並要留下 audit log。
- POS 串接必須使用 bearer token，不接受無驗證寫入。

## LINE Login 設定

LINE Developers callback URL：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/auth/line/callback
```

Vercel 環境變數：

```text
LINE_LOGIN_CHANNEL_ID
LINE_LOGIN_CHANNEL_SECRET
```

LINE 店家官方帳號連結：

```text
LINE_OFFICIAL_ACCOUNT_URL=https://lin.ee/xxxxxxx
```

## Google Login 設定

Google Cloud OAuth redirect URI：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/auth/google/callback
```

Vercel 環境變數：

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

## Google 商家營業資訊設定

Google Places API 需啟用並限制網域或 server key 使用範圍。

```text
GOOGLE_PLACE_ID=ChIJ0wZdQgA9aTQR-dLMJWRvNEc
GOOGLE_PLACES_API_KEY=<server side key>
```

設定完成後，`/api/business-hours` 應回 200，首頁營業資訊會自動顯示 Google 商家資料。

## Supabase 會員資料庫設定

1. 建立 Supabase project。
2. 執行 `supabase/schema.sql`。
3. 到 Supabase Project Settings 取得：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

4. 將兩個值加入 Vercel Production / Preview / Development 環境。
5. 重新部署後確認 `/api/health` 的 `memberDatabase.configured` 為 `true`。

## 驗證順序

1. 打開 `/setup.html`，確認缺少環境變數清單。
2. 打開 `/api/health`，確認 `ready` 狀態。
3. 設定 Supabase 後，驗證會員 API 不再回 `MEMBER_BACKEND_NOT_CONFIGURED`。
4. 設定 LINE Login 後，點 LINE 註冊，完成 callback 並寫入會員 identities。
5. 設定 Google Login 後，點 Google 註冊，完成 callback 並寫入會員 identities。
6. 設定 Google Places 後，驗證 `/api/business-hours` 回傳今日營業資訊。
7. 設定 POS token 後，用測試訂單呼叫 `/api/pos/orders/complete`，確認訂單、點數、優惠券流程。
8. 跑 production smoke test，確認所有線上端點狀態。

## 本機驗證

```bash
npm run verify
npm run check:env
npm run check:env:file
npm run smoke:production
```

`smoke:production` 預設檢查：

```text
https://yikou-cheungfun-line-order-v2.vercel.app
```

若要檢查其他 Vercel preview 網址：

```bash
PRODUCTION_URL=https://your-preview.vercel.app npm run smoke:production
```

如果只是預覽靜態頁：

```bash
python -m http.server 4173
```

再開：

```text
http://127.0.0.1:4173/
```
