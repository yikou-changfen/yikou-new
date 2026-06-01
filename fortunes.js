/* fortunes.js - 靈籤資料庫 (已下架吻仔魚，共 80 條) */
const fortunes = [
  // --- 1~10 ---
  { grade:"上上", msg:"與其等他回覆，不如等蒸氣上桌。今天你該被好好對待。", rec:"豪華海鮮腸粉（把自己當 VIP）" },
  { grade:"大吉", msg:"心累的解法不是睡覺，是吃點熱的，讓情緒先下班。", rec:"招牌肉蛋腸粉（穩定回血）" },
  { grade:"吉",   msg:"嘴硬可以，肚子硬不行。先補能量再談人生。", rec:"雙蛋腸粉（蛋白質先到位）" },
  { grade:"小吉", msg:"別把小事放大，像蔥花一樣，挑掉就好。", rec:"經典鮮蝦腸粉（清爽不煩）" },
  { grade:"中平", msg:"今天不宜硬撐，宜：把需求講清楚，順便把醬淋滿。", rec:"招牌肉蛋腸粉（基本需求要顧好）" },
  { grade:"上上", msg:"你會遇到貴人，但先遇到腸粉。兩個都別錯過。", rec:"海陸雙拼腸粉（一次兩個願望）" },
  { grade:"大吉", msg:"前任是歷史，腸粉是現貨。今天要做現實派。", rec:"招牌肉蛋腸粉（回購冠軍）" },
  { grade:"吉",   msg:"社交可以慢，但吃飯不能冷。你值得熱騰騰的確定感。", rec:"鮮蚵腸粉（海味爆汁）" },
  { grade:"小吉", msg:"今天不缺愛，缺的是一點點甜和一點點辣。", rec:"黃金玉米鮮蝦腸粉（甜中帶勁）" },
  { grade:"中平", msg:"你不是選擇障礙，你是想要全部。這很合理。", rec:"海陸雙拼腸粉（選兩個最省腦）" },

  // --- 11~20 ---
  { grade:"上上", msg:"運氣會晚到，但你不要晚吃。晚了就冷了。", rec:"豪華海鮮腸粉（趁熱吃最爽）" },
  { grade:"大吉", msg:"今天適合做決定：誰不回你就不回，先回自己胃。", rec:"經典鮮蝦腸粉（Q 彈有底氣）" },
  { grade:"吉",   msg:"把心事蒸一下，就會變柔軟。像腸粉皮一樣。", rec:"雙蛋腸粉（滑嫩療癒）" },
  { grade:"小吉", msg:"不要怕尷尬，怕的是你餓到脾氣上線。", rec:"黃金玉米鮮蝦腸粉（甜甜壓怒氣）" },
  { grade:"中平", msg:"今天不宜跟人較真，宜：跟腸粉合作。", rec:"招牌肉蛋腸粉（踏實派勝利）" },
  { grade:"上上", msg:"你會發現：很多煩惱都是空腹製造的。", rec:"海陸雙拼腸粉（直接封印空腹）" },
  { grade:"大吉", msg:"工作再難也要吃飯。你是人，不是 KPI。", rec:"招牌肉蛋腸粉（社畜救星）" },
  { grade:"吉",   msg:"今天的你適合加辣：讓情緒有出口，味蕾有爆點。", rec:"鮮蚵腸粉（加辣更香）" },
  { grade:"小吉", msg:"你的心情像微波加熱：需要再多 30 秒。", rec:"雙蛋腸粉（簡單加熱最快）" },
  { grade:"中平", msg:"別一直檢討自己，先檢查有沒有吃飽。", rec:"黃金玉米鮮蝦腸粉（甜甜安慰）" },

  // --- 21~30 ---
  { grade:"上上", msg:"你今天很旺：旺到連醬汁都想黏著你。", rec:"雙蛋腸粉（黏上加黏）" },
  { grade:"大吉", msg:"你不是難搞，你只是標準高。吃也一樣。", rec:"豪華海鮮腸粉（高標準就選它）" },
  { grade:"吉",   msg:"適合收斂情緒、擴張食慾。這叫資源配置。", rec:"海陸雙拼腸粉（資源最大化）" },
  { grade:"小吉", msg:"別再想他了，你需要的是一點海的味道。", rec:"鮮蚵腸粉（海味醒腦）" },
  { grade:"中平", msg:"今天不要問為什麼，先問：要不要加蛋。", rec:"雙蛋腸粉（問題直接解決）" },
  { grade:"上上", msg:"好事會發生，但你要先讓自己舒服。", rec:"招牌肉蛋腸粉（舒服的基本盤）" },
  { grade:"大吉", msg:"你今天的幸運不是桃花，是「吃到剛蒸好」。", rec:"經典鮮蝦腸粉（現剝現蒸）" },
  { grade:"吉",   msg:"生活很吵，吃點海味讓腦子安靜。", rec:"鮮蚵腸粉（海味降噪）" },
  { grade:"小吉", msg:"今天適合當個溫柔的人，至少對自己的胃溫柔。", rec:"黃金玉米鮮蝦腸粉（溫柔甜）" },
  { grade:"中平", msg:"你可以低潮，但不可以低血糖。", rec:"招牌肉蛋腸粉（快補能量）" },

  // --- 31~40 ---
  { grade:"上上", msg:"別怕改變，蒸氣一上來，世界就軟了。", rec:"雙蛋腸粉（軟得剛剛好）" },
  { grade:"大吉", msg:"今天適合放過自己：放過情緒、放過體重、放過前任。", rec:"豪華海鮮腸粉（犒賞放過自己）" },
  { grade:"吉",   msg:"你會把事情做成，只要先把肚子做滿。", rec:"海陸雙拼腸粉（飽了就能打仗）" },
  { grade:"小吉", msg:"別跟運氣硬碰硬，跟醬汁合作才有戲。", rec:"招牌肉蛋腸粉（醬香很會演）" },
  { grade:"中平", msg:"心情像 Wi-Fi：訊號差的時候先別怪世界。", rec:"招牌肉蛋腸粉（重連人生）" },
  { grade:"上上", msg:"今天你會被看見：不是被前任看見，是被美食看見。", rec:"鮮蚵腸粉（限量就是光）" },
  { grade:"大吉", msg:"你不需要被理解，你需要被餵飽。", rec:"海陸雙拼腸粉（直接滿足）" },
  { grade:"吉",   msg:"適合把腦袋交給蒸氣，讓思緒先散熱。", rec:"經典鮮蝦腸粉（清甜解壓）" },
  { grade:"小吉", msg:"今天不宜熬夜，宜：早點把快樂吃掉。", rec:"黃金玉米鮮蝦腸粉（快樂甜口）" },
  { grade:"中平", msg:"少想一點、吃多一點，焦慮就會小聲。", rec:"雙蛋腸粉（小聲模式）" },

  // --- 41~50 ---
  { grade:"上上", msg:"你要的不是答案，是「熱的確定感」。", rec:"招牌肉蛋腸粉（穩）" },
  { grade:"大吉", msg:"你今天很有魅力：尤其是點餐的時候。", rec:"豪華海鮮腸粉（魅力放大器）" },
  { grade:"吉",   msg:"別拖延了，再拖腸粉也不會自己出現。", rec:"海陸雙拼腸粉（行動派首選）" },
  { grade:"小吉", msg:"如果生活欺騙了你，就用一卷腸粉安慰胃。", rec:"雙蛋腸粉（滑嫩安慰）" },
  { grade:"中平", msg:"今天不宜衝動購物，但可以衝動加蛋。", rec:"雙蛋腸粉（投資回報高）" },
  { grade:"上上", msg:"你會突然想通：很多人不值得，你值得吃好。", rec:"豪華海鮮腸粉（把值得落地）" },
  { grade:"大吉", msg:"今日適合「斷捨離」：刪對話框、留胃容量。", rec:"經典鮮蝦腸粉（留給對的）" },
  { grade:"吉",   msg:"人生太苦就加點醬，太吵就加點海味。", rec:"鮮蚵腸粉（海味鎮場）" },
  { grade:"小吉", msg:"別低頭，雙下巴會出來；別難過，醬汁會變鹹。", rec:"黃金玉米鮮蝦腸粉（甜能解憂）" },
  { grade:"中平", msg:"你不是沒效率，你是缺一點熱量跟狠勁。", rec:"海陸雙拼腸粉（狠一點）" },

  // --- 51~60 ---
  { grade:"上上", msg:"你今天會順：路順、人順、排隊也順。", rec:"招牌肉蛋腸粉（順到你心裡）" },
  { grade:"大吉", msg:"貴人會出現，但你要先在這裡站穩。", rec:"鮮蚵腸粉（限量才是王道）" },
  { grade:"吉",   msg:"焦慮不是你問題，是你餓了。", rec:"海陸雙拼腸粉（一次治好）" },
  { grade:"小吉", msg:"今天適合裝傻：像蛋液一樣，隨遇而安。", rec:"雙蛋腸粉（軟爛也能贏）" },
  { grade:"中平", msg:"你可以沒動力，但你不能沒午餐。", rec:"招牌肉蛋腸粉（先撐住）" },
  { grade:"上上", msg:"今天運勢帶財：不一定進你口袋，但一定進你嘴裡。", rec:"豪華海鮮腸粉（財氣入口）" },
  { grade:"大吉", msg:"股票跌沒關係，腸粉品質不會跌。", rec:"豪華海鮮腸粉（對沖人生）" },
  { grade:"吉",   msg:"今天適合談合作：跟腸粉合作最穩。", rec:"海陸雙拼腸粉（合作雙贏）" },
  { grade:"小吉", msg:"錢沒不見，只是變成你喜歡的味道。", rec:"黃金玉米鮮蝦腸粉（甜甜投資）" },
  { grade:"中平", msg:"今天不宜亂花錢，但花在肚子上不算亂。", rec:"招牌肉蛋腸粉（精打細算）" },

  // --- 61~70 ---
  { grade:"上上", msg:"你今天適合做大事：例如把那盤吃乾淨。", rec:"海陸雙拼腸粉（大事成就）" },
  { grade:"大吉", msg:"你不是胖，你是福氣太滿。今天允許自己福氣上線。", rec:"雙蛋腸粉（圓滿加倍）" },
  { grade:"吉",   msg:"蒸的料理沒有罪惡感，只有成就感。", rec:"經典鮮蝦腸粉（清爽無負擔）" },
  { grade:"小吉", msg:"減肥是策略，吃飽是底線。", rec:"招牌肉蛋腸粉（有底線的快樂）" },
  { grade:"中平", msg:"今天不宜自我苛責，宜：把自己照顧好。", rec:"鮮蚵腸粉（海味補能量）" },
  { grade:"上上", msg:"考試像蒸氣：看不到，但會把你推上去。", rec:"招牌肉蛋腸粉（基本功穩）" },
  { grade:"大吉", msg:"腦容量不足？先用澱粉擴充，再用海味加速。", rec:"海陸雙拼腸粉（擴充記憶體）" },
  { grade:"吉",   msg:"今天適合把焦點放在可控的事：例如你要吃哪個。", rec:"經典鮮蝦腸粉（可控且好吃）" },
  { grade:"小吉", msg:"報告寫不出來不是你笨，是你餓。", rec:"黃金玉米鮮蝦腸粉（甜甜補腦）" },
  { grade:"中平", msg:"All Pass 是信仰，吃飽是實力。", rec:"雙蛋腸粉（實力派）" },

  // --- 71~80 ---
  { grade:"上上", msg:"你今天很紅：紅到適合加辣，順便紅出圈。", rec:"鮮蚵腸粉（加辣更對味）" },
  { grade:"大吉", msg:"今天你的直覺很準：準到知道該吃海鮮。", rec:"豪華海鮮腸粉（直覺獎勵）" },
  { grade:"吉",   msg:"別再滑手機了，手機不會蒸腸粉。", rec:"海陸雙拼腸粉（立刻解決）" },
  { grade:"小吉", msg:"你今天的幸運色是醬油色，記得淋對地方。", rec:"招牌肉蛋腸粉（醬香最穩）" },
  { grade:"中平", msg:"今天不會大好也不會大壞，但會很好吃。", rec:"經典鮮蝦腸粉（穩穩鮮）" },
  { grade:"上上", msg:"你正在變強：不是情緒變硬，是心態變穩。", rec:"招牌肉蛋腸粉（穩就是強）" },
  { grade:"大吉", msg:"今天適合把話說清楚，也把胃填清楚。", rec:"海陸雙拼腸粉（清楚又滿足）" },
  { grade:"吉",   msg:"你會遇到一個讓你安心的人——先從一卷讓你安心的開始。", rec:"雙蛋腸粉（安心感）" },
  { grade:"小吉", msg:"心裡卡卡的？那是你需要一點 Q 彈。", rec:"經典鮮蝦腸粉（Q 彈解卡）" },
  { grade:"中平", msg:"今天不要硬撐到最後，先把自己顧好。", rec:"鮮蚵腸粉（海味補血）" }
];

(() => {
  const panelId = "yikou-api-bridge";
  if (document.getElementById(panelId)) return;

  const styleId = "yikou-api-bridge-style";
  const css = `
    #${panelId} {
      max-width: 1120px;
      margin: 32px auto;
      padding: 24px;
      border: 1px solid rgba(132, 35, 23, 0.18);
      border-radius: 18px;
      background: #fffaf2;
      color: #351d17;
      box-shadow: 0 18px 45px rgba(64, 27, 15, 0.12);
      font-family: inherit;
    }
    #${panelId} .bridge-kicker {
      color: #9a2f22;
      font-weight: 700;
      letter-spacing: 0;
      margin: 0 0 6px;
    }
    #${panelId} h2 {
      margin: 0 0 10px;
      font-size: clamp(24px, 3vw, 34px);
      line-height: 1.2;
    }
    #${panelId} p {
      margin: 0;
      line-height: 1.8;
    }
    #${panelId} .bridge-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 18px;
    }
    #${panelId} .bridge-card {
      min-height: 132px;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(132, 35, 23, 0.14);
      background: #fff;
    }
    #${panelId} .bridge-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
      font-weight: 800;
    }
    #${panelId} .bridge-pill {
      flex: 0 0 auto;
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      color: #fff;
      background: #8f8f8f;
    }
    #${panelId} .bridge-pill.ok { background: #128c49; }
    #${panelId} .bridge-pill.warn { background: #9a2f22; }
    #${panelId} .bridge-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    #${panelId} .bridge-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 16px;
      border-radius: 999px;
      color: #fff;
      background: #9a2f22;
      text-decoration: none;
      font-weight: 800;
    }
    #${panelId} .bridge-btn.line { background: #06c755; }
    #${panelId} .bridge-btn.google { background: #1f1f1f; }
    #${panelId} .bridge-btn.secondary { background: #6f4a2f; }
    #${panelId} .bridge-note {
      margin-top: 14px;
      color: #6e5549;
      font-size: 14px;
    }
    @media (max-width: 760px) {
      #${panelId} { margin: 22px 14px; padding: 18px; border-radius: 14px; }
      #${panelId} .bridge-grid { grid-template-columns: 1fr; }
      #${panelId} .bridge-btn { width: 100%; }
    }
  `;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]));
  }

  async function getJson(path) {
    const response = await fetch(path, { credentials: "same-origin" });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  }

  function missingText(check) {
    const missing = Array.isArray(check?.missing) ? check.missing : [];
    return missing.length ? `缺少 ${missing.join(", ")}` : "已設定";
  }

  ready(async () => {
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = css;
      document.head.appendChild(style);
    }

    const section = document.createElement("section");
    section.id = panelId;
    section.innerHTML = `
      <p class="bridge-kicker">會員與店家資訊</p>
      <h2>LINE / Google 會員登入與 Google 商家營業資訊</h2>
      <p>正式站已接上安全 API 檢查。會員資料會等 Supabase 後端密鑰設定完成後才開放正式寫入，避免資料外洩。</p>
      <div class="bridge-grid" aria-live="polite">
        <div class="bridge-card" id="bridge-line"><div class="bridge-title">LINE 會員 <span class="bridge-pill">檢查中</span></div><p>正在檢查 LINE Login 與會員資料庫。</p></div>
        <div class="bridge-card" id="bridge-google"><div class="bridge-title">Google 會員 <span class="bridge-pill">檢查中</span></div><p>正在檢查 Google OAuth 與會員資料庫。</p></div>
        <div class="bridge-card" id="bridge-hours"><div class="bridge-title">營業資訊 <span class="bridge-pill">檢查中</span></div><p>正在讀取 Google 商家營業時間。</p></div>
      </div>
      <div class="bridge-actions">
        <a class="bridge-btn line" href="/api/auth/line/start">使用 LINE 註冊 / 登入</a>
        <a class="bridge-btn google" href="/api/auth/google/start">使用 Google 註冊 / 登入</a>
        <a class="bridge-btn secondary" id="bridge-line-official" href="#" aria-disabled="true">加入 LINE 店家</a>
      </div>
      <p class="bridge-note" id="bridge-note">設定完成後，此區會自動顯示最新 Google 商家營業資訊。</p>
    `;

    const anchor = document.querySelector("footer") || document.body.lastElementChild;
    if (anchor?.parentNode) {
      anchor.parentNode.insertBefore(section, anchor);
    } else {
      document.body.appendChild(section);
    }

    const lineCard = section.querySelector("#bridge-line");
    const googleCard = section.querySelector("#bridge-google");
    const hoursCard = section.querySelector("#bridge-hours");
    const officialLink = section.querySelector("#bridge-line-official");
    const note = section.querySelector("#bridge-note");

    try {
      const health = await getJson("/api/health");
      const checks = health.data?.checks || {};
      const lineReady = Boolean(checks.lineLogin?.configured);
      const googleReady = Boolean(checks.googleLogin?.configured);
      lineCard.innerHTML = `<div class="bridge-title">LINE 會員 <span class="bridge-pill ${lineReady ? "ok" : "warn"}">${lineReady ? "已連接" : "待設定"}</span></div><p>${escapeHtml(missingText(checks.lineLogin))}</p>`;
      googleCard.innerHTML = `<div class="bridge-title">Google 會員 <span class="bridge-pill ${googleReady ? "ok" : "warn"}">${googleReady ? "已連接" : "待設定"}</span></div><p>${escapeHtml(missingText(checks.googleLogin))}</p>`;
      if (!health.data?.ready) {
        note.textContent = "目前網站 API 已上線，但部分正式密鑰尚未設定完成；未完成前會員資料不會寫入正式資料庫。";
      }
    } catch (error) {
      lineCard.innerHTML = `<div class="bridge-title">LINE 會員 <span class="bridge-pill warn">檢查失敗</span></div><p>暫時無法讀取 API 狀態。</p>`;
      googleCard.innerHTML = `<div class="bridge-title">Google 會員 <span class="bridge-pill warn">檢查失敗</span></div><p>暫時無法讀取 API 狀態。</p>`;
    }

    try {
      const config = await getJson("/api/public-config");
      const url = config.data?.lineOfficialAccountUrl;
      if (url) {
        officialLink.href = url;
        officialLink.removeAttribute("aria-disabled");
      } else {
        officialLink.addEventListener("click", (event) => event.preventDefault());
      }
    } catch (error) {
      officialLink.addEventListener("click", (event) => event.preventDefault());
    }

    try {
      const hours = await getJson("/api/business-hours");
      if (hours.ok && hours.data?.todayText) {
        hoursCard.innerHTML = `<div class="bridge-title">營業資訊 <span class="bridge-pill ok">已同步</span></div><p>${escapeHtml(hours.data.todayText)}</p>`;
      } else {
        const missing = Array.isArray(hours.data?.missing) ? hours.data.missing.join(", ") : "GOOGLE_PLACES_API_KEY";
        hoursCard.innerHTML = `<div class="bridge-title">營業資訊 <span class="bridge-pill warn">待設定</span></div><p>缺少 ${escapeHtml(missing)}，設定後會自動追蹤一口腸粉 Google 商家營業資訊。</p>`;
      }
    } catch (error) {
      hoursCard.innerHTML = `<div class="bridge-title">營業資訊 <span class="bridge-pill warn">檢查失敗</span></div><p>暫時無法讀取 Google 商家營業資訊。</p>`;
    }
  });
})();
