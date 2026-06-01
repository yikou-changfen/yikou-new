# LINE / Google 會員註冊串接

## 前台入口

會員中心提供三種加入方式：

- 使用 LINE 註冊
- 使用 Google 註冊
- 手機資料補登

手機資料補登只作本次瀏覽暫存，不永久保存個資。正式會員身分應以 LINE 或 Google OAuth 綁定後端會員資料。

## API 端點

已建立安全骨架：

```text
GET /api/auth/line/start
GET /api/auth/line/callback
GET /api/auth/google/start
GET /api/auth/google/callback
POST /api/auth/logout
GET /api/member/me
PATCH /api/member/me
POST /api/member/export
GET /api/member/orders
GET /api/member/coupons
POST /api/coupons/redeem
POST /api/pos/orders/complete
```

未設定環境變數前，API 會回 `503 *_NOT_CONFIGURED`，不會交換 token，也不會保存個資。

設定完成後：

- LINE callback 會交換 LINE token、驗證 `id_token`。
- Google callback 會交換 Google token、讀取 OpenID userinfo。
- 後端會以 provider subject 寫入 `member_identities`。
- 若是新身份，建立 `members`。
- 登入成功後建立 `yikou_member_session` HttpOnly cookie。
- 前台用 `/api/member/me` 讀取遮罩會員資料。
- 前台用 `/api/member/orders` 與 `/api/member/coupons` 讀取訂單摘要與券包狀態。

## Vercel 環境變數

```text
LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OAUTH_STATE_SECRET=
SESSION_SECRET=
LINE_OFFICIAL_ACCOUNT_URL=
```

`OAUTH_STATE_SECRET` 是建議的專用密鑰。若 Vercel 既有專案已設定 `SESSION_SECRET`，目前 API 會先接受 `SESSION_SECRET` 作為 OAuth state 與會員 session 簽章備援；新專案建議兩者都設定為不同長隨機字串。

## LINE Login 流程

1. 顧客點「使用 LINE 註冊」。
2. 前端導向 `/api/auth/line/start`。
3. 後端產生 state，導向 LINE OAuth。
4. `/api/auth/line/callback` 驗證 state 並交換 token。
5. 驗證 `id_token`。
6. 以 LINE user id 寫入 `member_identities.provider = line`。
7. 若沒有會員，建立 `members`。
8. 回到官網會員中心。

Callback URL：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/auth/line/callback
```

## Google Login 流程

1. 顧客點「使用 Google 註冊」。
2. 前端導向 `/api/auth/google/start`。
3. 後端產生 state，導向 Google OAuth。
4. `/api/auth/google/callback` 驗證 state 並交換 token。
5. 驗證 `id_token`。
6. 以 Google `sub` 寫入 `member_identities.provider = google`。
7. 若沒有會員，建立 `members`。
8. 回到官網會員中心。

Callback URL：

```text
https://yikou-cheungfun-line-order-v2.vercel.app/api/auth/google/callback
```

## 一口腸粉店家 LINE

店家 LINE 與 LINE Login 是不同功能：

- LINE Login：會員登入與身份綁定。
- LINE 官方帳號：加好友、推播、客服、優惠通知。

官網已提供「加入 LINE 店家」入口，但需要正式加入好友連結：

```text
LINE_OFFICIAL_ACCOUNT_URL=https://lin.ee/xxxxxxx
```

## 安全設計

- OAuth start 會產生簽章 state。
- state 同時放在 OAuth URL 與 HttpOnly cookie。
- callback 必須比對 state 與簽章，避免 CSRF。
- 未設定 `OAUTH_STATE_SECRET` 且未設定 `SESSION_SECRET` 時，LINE/Google OAuth 不會啟用。
- 第三方登入 callback 只在環境變數完整時交換 token。
- 會員 session 使用 HMAC 簽章 HttpOnly cookie。
- 前台 `/api/member/me` 只回傳遮罩會員資料。
