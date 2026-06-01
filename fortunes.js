/* fortunes.js - 一口腸粉首頁升級層 */
const fortunes = [
  { grade: "上上", msg: "與其等他回覆，不如等蒸氣上桌。今天你該被好好對待。", rec: "豪華海鮮腸粉" },
  { grade: "大吉", msg: "心累的解法不是睡覺，是吃點熱的，讓情緒先下班。", rec: "招牌肉蛋腸粉" },
  { grade: "吉", msg: "嘴硬可以，肚子硬不行。先補能量再談人生。", rec: "雙蛋腸粉" },
  { grade: "小吉", msg: "別把小事放大，像蔥花一樣，挑掉就好。", rec: "經典鮮蝦腸粉" },
  { grade: "中平", msg: "今天不宜硬撐，宜把需求講清楚，順便把醬淋滿。", rec: "海陸雙拼腸粉" }
];

(() => {
  const APP_ID = "yikou-homepage-upgrade";
  const STORE = "yikou:member:v1";
  const authUrls = { line: "/api/auth/line/start", google: "/api/auth/google/start" };
  const adminLinks = [
    ["後台管理", "https://yikou-cheungfun-line-order-v2.vercel.app/admin"],
    ["POS 收銀", "https://yikou-cheungfun-line-order-v2.vercel.app/admin/pos"],
    ["會員中心", "https://yikou-cheungfun-line-order-v2.vercel.app/member"]
  ];
  const menu = [
    ["鮮蝦蛋腸粉", "95", "assets/menu/web/xian-xia.webp", "蝦仁、雞蛋、青菜與醬香，是第一次來最穩的選擇。"],
    ["肉蛋腸粉", "85", "assets/menu/web/rou-dan.webp", "肉香加蛋香，口感厚實，想吃飽一點就選它。"],
    ["鮮蚵腸粉", "100", "assets/menu/web/xian-he.webp", "鮮蚵滑嫩，配上現蒸米皮，海味很直接。"],
    ["豪華雙鮮", "120", "assets/menu/web/hao-hua-shuang-xian.webp", "蝦仁與海鮮雙主角，一卷吃到招牌精華。"],
    ["海陸雙拼", "115", "assets/menu/web/hai-lu-shuang-pin.webp", "海味與肉香同時上桌，適合選擇困難時點。"],
    ["雙蛋腸粉", "80", "assets/menu/web/shuang-dan.webp", "蛋香加倍，簡單耐吃，孩子與學生都很適合。"]
  ];

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  }

  function missing(check) {
    const list = Array.isArray(check?.missing) ? check.missing : [];
    return list.length ? `缺少 ${list.join(", ")}` : "已設定";
  }

  async function getJson(path, options = {}) {
    const response = await fetch(path, {
      headers: { accept: "application/json", ...(options.headers || {}) },
      cache: "no-store",
      credentials: "same-origin",
      ...options
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  }

  function loadLocalMember() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch { return {}; }
  }

  function saveRedactedMember(form) {
    const points = Number(form.points || 0);
    const safe = {
      schemaVersion: 1,
      memberId: form.memberId || `YK-M-${Date.now()}`,
      points,
      tier: points >= 600 ? "金印會員" : points >= 250 ? "紅籠會員" : "竹籠會員",
      taste: form.taste || "鮮蝦蛋腸粉",
      orders: Array.isArray(form.orders) ? form.orders : [],
      coupons: [{ id: "welcome", title: "新會員迎賓券", detail: "任一腸粉折 10 元", status: "可使用" }],
      privacyMode: "local-redacted",
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORE, JSON.stringify(safe));
    return safe;
  }

  function downloadJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderShell() {
    document.documentElement.lang = "zh-TW";
    document.title = "一口腸粉｜中國風品牌官網｜LINE / Google 會員";
    document.body.innerHTML = `
      <div id="${APP_ID}">
        <header class="topbar">
          <a class="brand" href="#top" aria-label="一口腸粉首頁"><img src="assets/brand/logo.png" alt="一口腸粉"><span>一口腸粉</span></a>
          <nav><a href="#menu">菜單</a><a href="#member">會員</a><a href="#hours">營業資訊</a><a href="#links">後台</a></nav>
        </header>
        <main id="top">
          <section class="hero">
            <div class="hero-copy">
              <p class="eyebrow">台中一中街｜中國風現蒸廣東腸粉</p>
              <h1>一口腸粉</h1>
              <p class="lead">朱紅、墨黑、金印與宣紙底色，重新整理成能點餐、能入會、能接 LINE / Google 的品牌官網。</p>
              <div class="hero-actions"><a class="btn red" href="#member">加入會員</a><a class="btn ink" href="#menu">看菜單</a><a class="btn jade" data-line-store href="#">加入 LINE 店家</a></div>
              <div class="seal-row"><span>現點現蒸</span><span>會員集點</span><span>Google 商家同步</span></div>
            </div>
            <div class="hero-media"><img src="assets/menu/web/cover.webp" alt="一口腸粉現蒸餐點"><div class="seal">一口<br>入魂</div></div>
          </section>

          <section class="status-band" id="hours">
            <article><b>LINE 會員</b><span id="lineStatus">檢查中</span></article>
            <article><b>Google 會員</b><span id="googleStatus">檢查中</span></article>
            <article><b>營業資訊</b><span id="hoursStatus">讀取 Google 商家中</span></article>
          </section>

          <section class="section story">
            <p class="eyebrow">品牌定位</p>
            <h2>中國風，不做古板；小吃攤，也能有品牌記憶點。</h2>
            <p>首頁第一屏讓人記住品牌，菜單負責轉換，會員中心負責回訪，後端 API 負責把 LINE Login、Google Login、Google 商家營業資訊與 POS 串起來。</p>
          </section>

          <section class="section" id="menu">
            <div class="section-head"><p class="eyebrow">招牌菜單</p><h2>現蒸腸粉</h2></div>
            <div class="menu-grid">${menu.map(item => `<article class="dish"><img src="${item[2]}" alt="${item[0]}" loading="lazy"><div><h3>${item[0]}</h3><p>${item[3]}</p><b>$${item[1]}</b></div></article>`).join("")}</div>
          </section>

          <section class="section member" id="member">
            <div class="section-head"><p class="eyebrow">安全會員系統</p><h2>LINE / Google 註冊會員</h2><p>會員資料優先安全。正式個資只進後端資料庫；資料庫未設定前，前台只保留遮罩後低敏資料。</p></div>
            <div class="member-layout">
              <form id="memberForm" class="panel" autocomplete="off">
                <label>姓名<input id="memberName" name="name" placeholder="本次瀏覽暫存，不進 localStorage"></label>
                <label>手機<input id="memberPhone" name="phone" placeholder="只用於畫面遮罩顯示"></label>
                <label>生日<input id="memberBirthday" name="birthday" type="date"></label>
                <label>偏好口味<select id="memberTaste"><option>鮮蝦蛋腸粉</option><option>肉蛋腸粉</option><option>海陸雙拼</option><option>雙蛋腸粉</option></select></label>
                <button class="btn red" type="submit">建立安全本機會員</button>
                <p class="note">姓名、手機、生日、LINE UID 不會永久寫入瀏覽器。正式會員資料需等 Supabase 啟用。</p>
              </form>
              <aside class="panel member-card">
                <b id="memberTier">竹籠會員</b><span id="memberPoints">0 點</span><p id="memberSummary">尚未登入正式會員</p>
                <div class="auth-row"><a class="auth line" href="${authUrls.line}">LINE 註冊 / 登入</a><a class="auth google" href="${authUrls.google}">Google 註冊 / 登入</a></div>
                <div class="member-actions"><button class="link-btn" id="exportBtn" type="button">匯出遮罩會員資料</button><button class="link-btn" id="logoutBtn" type="button">登出會員</button></div>
              </aside>
            </div>
            <div class="member-data-grid">
              <article class="panel"><h3>訂單紀錄</h3><div id="ordersList" class="mini-list">等待會員資料庫設定。</div></article>
              <article class="panel"><h3>優惠券包</h3><div id="couponsList" class="mini-list">等待會員資料庫設定。</div></article>
            </div>
          </section>

          <section class="section integrations">
            <div class="section-head"><p class="eyebrow">串接狀態</p><h2>Google API / LINE API 帶入</h2></div>
            <div class="integration-grid">
              <article><b>Google 商家營業資訊</b><p id="googleBusinessText">等待環境變數 GOOGLE_PLACES_API_KEY。</p></article>
              <article><b>LINE 店家官方帳號</b><p id="lineOfficialText">等待 LINE_OFFICIAL_ACCOUNT_URL。</p></article>
              <article><b>會員資料庫</b><p id="memberDbText">等待 SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY。</p></article>
            </div>
          </section>
        </main>
        <footer id="links"><div>${adminLinks.map(([text, href]) => `<a href="${href}">${text}</a>`).join("")}</div><p>一口腸粉｜404 台灣臺中市北區新北里一中街 132-134 號</p></footer>
        <div class="toast" id="toast" role="status" aria-live="polite"></div>
      </div>
    `;
  }

  function renderStyle() {
    const style = document.createElement("style");
    style.id = "yikou-upgrade-style";
    style.textContent = `
      body{margin:0;background:#fff8ed;color:#2f1d15;font-family:'Noto Sans TC','Microsoft JhengHei',sans-serif;text-align:left}#${APP_ID}{min-height:100vh;background:linear-gradient(90deg,rgba(215,53,42,.045) 0 1px,transparent 1px 48px),linear-gradient(0deg,rgba(24,138,90,.035) 0 1px,transparent 1px 48px),#fff8ed}#${APP_ID} *{box-sizing:border-box}a{color:inherit}.topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:14px clamp(16px,4vw,52px);background:rgba(255,248,237,.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(92,58,45,.16)}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:900}.brand img{width:42px;height:42px;border-radius:50%}.topbar nav{display:flex;gap:18px;font-weight:800}.topbar nav a{text-decoration:none}.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:36px;align-items:center;padding:clamp(34px,7vw,86px) clamp(16px,5vw,72px) 44px}.eyebrow{margin:0 0 10px;color:#9f211b;font-weight:900}.hero h1{margin:0;font-family:'Noto Serif TC',serif;font-size:clamp(56px,12vw,138px);line-height:.92;color:#9f211b}.lead{font-size:clamp(18px,2vw,24px);line-height:1.8;max-width:720px}.hero-actions,.auth-row,.member-actions{display:flex;flex-wrap:wrap;gap:12px}.btn,.auth,.link-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border:0;border-radius:999px;text-decoration:none;font-weight:900;cursor:pointer}.red{background:#d7352a;color:#fff}.ink{background:#2f1d15;color:#fff}.jade,.line{background:#06c755;color:#fff}.google{background:#1f1f1f;color:#fff}.hero-media{position:relative}.hero-media img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:24px;box-shadow:0 22px 60px rgba(70,38,20,.2)}.seal{position:absolute;right:18px;bottom:18px;background:#9f211b;color:#ffe1a1;border:3px solid #ffe1a1;padding:18px;border-radius:18px;font-weight:900;font-size:24px;text-align:center}.seal-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.seal-row span{border:1px solid rgba(92,58,45,.18);border-radius:999px;padding:8px 12px;background:#fff}.status-band{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 clamp(16px,5vw,72px) 36px}.status-band article,.panel,.integration-grid article,.dish{background:rgba(255,255,255,.86);border:1px solid rgba(92,58,45,.16);border-radius:16px;box-shadow:0 14px 34px rgba(70,38,20,.1)}.status-band article{padding:18px}.status-band b,.status-band span{display:block}.section{padding:44px clamp(16px,5vw,72px)}.story{background:#2f1d15;color:#fff}.story .eyebrow{color:#f3b53f}.story p{max-width:900px;line-height:1.9}.section h2{font-family:'Noto Serif TC',serif;font-size:clamp(28px,4vw,48px);margin:0 0 12px}.section-head p{max-width:860px;line-height:1.8}.menu-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.dish{overflow:hidden}.dish img{width:100%;aspect-ratio:4/3;object-fit:cover}.dish div{padding:16px}.dish h3{margin:0 0 8px;font-size:22px}.dish p{line-height:1.7;color:#6d5648}.dish b{color:#9f211b;font-size:22px}.member-layout,.member-data-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:16px}.member-data-grid{grid-template-columns:repeat(2,minmax(0,1fr));margin-top:16px}.panel{padding:20px}.panel label{display:grid;gap:8px;margin-bottom:12px;font-weight:800}.panel input,.panel select{width:100%;min-height:44px;border:1px solid rgba(92,58,45,.22);border-radius:12px;padding:0 12px;font:inherit;background:#fff}.note{font-size:14px;color:#806a5e;line-height:1.7}.member-card b{display:block;font-size:34px;color:#9f211b}.member-card span{font-size:22px;font-weight:900}.mini-list{display:grid;gap:10px;color:#6d5648;line-height:1.65}.mini-list .item{padding:10px;border-radius:12px;background:#fff8ed;border:1px solid rgba(92,58,45,.14)}.integration-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.integration-grid article{padding:18px}.integration-grid p{line-height:1.75;color:#6d5648}footer{padding:28px clamp(16px,5vw,72px);background:#2f1d15;color:#fff}footer div{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px}footer a{color:#ffe1a1}.toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#2f1d15;color:#fff;border-radius:999px;padding:12px 18px;font-weight:900;opacity:0;pointer-events:none;transition:.2s}.toast.show{opacity:1}@media(max-width:850px){.topbar{align-items:flex-start;gap:12px;flex-direction:column}.hero,.member-layout,.member-data-grid{grid-template-columns:1fr}.menu-grid,.status-band,.integration-grid{grid-template-columns:1fr}.hero h1{font-size:64px}}
    `;
    document.head.appendChild(style);
  }

  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function renderMemberState(saved) {
    const tier = document.getElementById("memberTier");
    const points = document.getElementById("memberPoints");
    const summary = document.getElementById("memberSummary");
    if (saved.tier) tier.textContent = saved.tier;
    points.textContent = `${Number(saved.points || 0)} 點`;
    summary.textContent = saved.memberId ? `${saved.memberId}｜本機遮罩模式` : "尚未登入正式會員";
  }

  function wireMember() {
    renderMemberState(loadLocalMember());
    document.getElementById("memberForm")?.addEventListener("submit", event => {
      event.preventDefault();
      const current = loadLocalMember();
      const safe = saveRedactedMember({ taste: document.getElementById("memberTaste")?.value, points: current.points || 0, memberId: current.memberId, orders: current.orders });
      renderMemberState(safe);
      toast("已建立安全本機會員，個資未永久保存");
    });
    document.getElementById("exportBtn")?.addEventListener("click", exportMemberData);
    document.getElementById("logoutBtn")?.addEventListener("click", logoutMember);
  }

  function renderList(targetId, items, emptyText, formatter) {
    const target = document.getElementById(targetId);
    if (!target) return;
    if (!Array.isArray(items) || items.length === 0) {
      target.textContent = emptyText;
      return;
    }
    target.innerHTML = items.map(item => `<div class="item">${formatter(item)}</div>`).join("");
  }

  async function hydrateMemberData() {
    const me = await getJson("/api/member/me").catch(error => ({ ok: false, data: { message: error.message } }));
    if (me.ok && me.data?.member) {
      document.getElementById("memberSummary").textContent = "已登入正式會員";
      document.getElementById("memberTier").textContent = me.data.member.tier || "竹籠會員";
      document.getElementById("memberPoints").textContent = `${Number(me.data.member.points || 0)} 點`;
    }

    const orders = await getJson("/api/member/orders").catch(() => null);
    if (orders?.ok) {
      renderList("ordersList", orders.data?.orders || [], "目前沒有訂單紀錄", order => `${escapeHtml(order.title || order.id || "訂單")}<br>${escapeHtml(order.date || order.createdAt || "")}｜${escapeHtml(order.items || "")}｜$${escapeHtml(order.total || order.totalAmount || 0)}`);
    } else {
      document.getElementById("ordersList").textContent = orders?.data?.message || missing({ missing: orders?.data?.missing || ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] });
    }

    const coupons = await getJson("/api/member/coupons").catch(() => null);
    if (coupons?.ok) {
      renderList("couponsList", coupons.data?.coupons || [], "目前沒有可用優惠券", coupon => `${escapeHtml(coupon.title || "優惠券")}<br>${escapeHtml(coupon.detail || "")}｜${escapeHtml(coupon.status || "available")}`);
    } else {
      document.getElementById("couponsList").textContent = coupons?.data?.message || missing({ missing: coupons?.data?.missing || ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] });
    }
  }

  async function exportMemberData() {
    const server = await getJson("/api/member/export", { method: "POST" }).catch(() => null);
    if (server?.ok) {
      downloadJson("yikou-member-server-export.json", server.data);
      toast("已從後端匯出遮罩會員資料");
      return;
    }
    downloadJson("yikou-member-redacted.json", { exportedAt: new Date().toISOString(), privacyMode: "redacted-client-export", member: loadLocalMember(), serverExport: server?.data || null });
    toast("後端會員尚未設定，已匯出本機遮罩資料");
  }

  async function logoutMember() {
    await getJson("/api/auth/logout", { method: "POST" }).catch(() => null);
    localStorage.removeItem(STORE);
    renderMemberState({});
    document.getElementById("ordersList").textContent = "已登出，等待會員登入。";
    document.getElementById("couponsList").textContent = "已登出，等待會員登入。";
    toast("已清除會員 session 與本機遮罩資料");
  }

  async function hydrate() {
    const health = await getJson("/api/health").catch(() => null);
    const checks = health?.data?.checks || {};
    document.getElementById("lineStatus").textContent = checks.lineLogin?.configured ? "已連接" : missing(checks.lineLogin);
    document.getElementById("googleStatus").textContent = checks.googleLogin?.configured ? "已連接" : missing(checks.googleLogin);
    document.getElementById("memberDbText").textContent = checks.memberDatabase?.configured ? "Supabase 會員資料庫已設定" : missing(checks.memberDatabase);

    const config = await getJson("/api/public-config").catch(() => null);
    const lineUrl = config?.data?.lineOfficialAccountUrl || "";
    document.getElementById("lineOfficialText").textContent = lineUrl ? "LINE 店家官方帳號已設定" : "尚缺 LINE_OFFICIAL_ACCOUNT_URL，需由店家後台提供 lin.ee 或 page.line.me 連結。";
    document.querySelectorAll("[data-line-store]").forEach(link => {
      if (lineUrl) link.href = lineUrl;
      else link.addEventListener("click", event => { event.preventDefault(); toast("尚未設定一口腸粉 LINE 官方帳號連結"); });
    });

    const hours = await getJson("/api/business-hours").catch(() => null);
    if (hours?.ok && hours.data?.todayText) {
      document.getElementById("hoursStatus").textContent = hours.data.todayText;
      document.getElementById("googleBusinessText").textContent = hours.data.todayText;
    } else {
      const msg = hours?.data?.missing?.length ? `缺少 ${hours.data.missing.join(", ")}` : "尚未設定 Google Places API Key";
      document.getElementById("hoursStatus").textContent = msg;
      document.getElementById("googleBusinessText").textContent = `${msg}；設定後會自動追蹤一口腸粉 Google 商家營業資訊。`;
    }
    hydrateMemberData();
  }

  ready(() => {
    if (document.getElementById(APP_ID)) return;
    renderShell();
    renderStyle();
    wireMember();
    hydrate();
  });
})();
