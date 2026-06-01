# 一口腸粉會員系統設計

## 目標

完整會員系統以安全性優先：姓名、手機、生日、LINE UID、Google sub、email 等會員個資只能存在後端資料庫，不永久存放在瀏覽器 `localStorage`。

## 已實作的安全邊界

- 前台未登入或後端未設定時，只顯示安全提示，不寫入正式會員資料。
- `/api/member/*` 未設定 Supabase 時回 `503 MEMBER_BACKEND_NOT_CONFIGURED`。
- 會員登入成功後使用 `yikou_member_session` HttpOnly cookie。
- 前台不能讀取 session cookie，只能透過 API 取得遮罩資料。
- Supabase schema 啟用 RLS，anon/authenticated 直連資料表全部拒絕。
- 後端 API 使用 `SUPABASE_SERVICE_ROLE_KEY`，並自行驗證 session 與權限。
- 會員匯出與 POS/後台動作需寫 `audit_logs`。

## 後端資料表

請先執行：

```text
supabase/schema.sql
```

核心資料表：

- `members`
- `member_identities`
- `orders`
- `order_items`
- `coupons`
- `coupon_redemptions`
- `point_ledger`
- `audit_logs`

遮罩 view：

- `member_safe_profiles`

## API

```text
GET /api/member/me
PATCH /api/member/me
GET /api/member/orders
GET /api/member/coupons
POST /api/member/export
POST /api/coupons/redeem
POST /api/pos/orders/complete
POST /api/auth/logout
```

## LINE / Google 身份綁定

`member_identities` 用 `(provider, provider_subject)` 做唯一鍵：

- LINE：`provider = line`，`provider_subject = LINE user id`
- Google：`provider = google`，`provider_subject = Google sub`

同一會員未來可綁多個登入方式，但不同第三方身份不可誤綁到多個會員。

## POS 串接

POS 完成訂單呼叫：

```text
POST /api/pos/orders/complete
Authorization: Bearer <POS_API_TOKEN>
```

後端會：

1. 驗證 `POS_API_TOKEN`。
2. 寫入 `orders`。
3. 寫入 `order_items`。
4. 寫入 `point_ledger`。
5. 更新 `members.points` 與 `members.tier`。
6. 寫入 `audit_logs`。

前端不能直接修改點數、券狀態或訂單金額。

## 優惠券核銷

```text
POST /api/coupons/redeem
```

核銷必須在後端完成，並寫入 `coupon_redemptions`。前台只顯示狀態，不信任前端送來的券狀態。

## 等級規則

- `竹籠會員`：0-249 點
- `紅籠會員`：250-599 點
- `金印會員`：600 點以上

## 上線前必備環境變數

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OAUTH_STATE_SECRET=
SESSION_SECRET=
LINE_LOGIN_CHANNEL_ID=
LINE_LOGIN_CHANNEL_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
POS_API_TOKEN=
```

`SESSION_SECRET` 可作為 `OAUTH_STATE_SECRET` 的備援，但正式建議兩個都設。
