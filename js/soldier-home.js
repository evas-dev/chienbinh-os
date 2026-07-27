/* ==========================================================================
   SỞ CHỈ HUY của CHIẾN SỸ — tổng quan: thẻ chiến binh (character có đầu là
   nhân sự) + Mục tiêu tháng gộp vào + kho huân chương.
   ========================================================================== */

// Thẻ chiến binh: giáp trụ + đầu là avatar nhân sự (bản thật thay bằng ảnh).
function warriorPortrait(w) {
  const ini = initials(w.name);
  return `<svg class="warrior-fig" viewBox="0 0 200 232" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chiến binh ${w.name}">
    <defs>
      <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a4658"/><stop offset="1" stop-color="#1c2431"/></linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0d489"/><stop offset="1" stop-color="#c78f22"/></linearGradient>
      <radialGradient id="head" cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stop-color="#2a3444"/><stop offset="1" stop-color="#161c26"/></radialGradient>
    </defs>
    <!-- pauldrons -->
    <ellipse cx="44" cy="158" rx="40" ry="30" fill="url(#steel)" stroke="url(#gold)" stroke-width="2.5"/>
    <ellipse cx="156" cy="158" rx="40" ry="30" fill="url(#steel)" stroke="url(#gold)" stroke-width="2.5"/>
    <!-- chestplate -->
    <path d="M58,132 Q100,120 142,132 L154,224 Q100,240 46,224 Z" fill="url(#steel)" stroke="url(#gold)" stroke-width="3"/>
    <path d="M100,138 L100,224" stroke="url(#gold)" stroke-width="2" opacity=".6"/>
    <!-- chest emblem (ngôi sao) -->
    <path d="M100 168 l6 12 13 2 -9.5 9 2.5 13 -12 -6.5 -12 6.5 2.5 -13 -9.5 -9 13 -2 Z" fill="url(#gold)"/>
    <!-- neck -->
    <rect x="86" y="104" width="28" height="34" rx="6" fill="#222c3a"/>
    <!-- helmet crest (chóp mũ) -->
    <path d="M100,18 Q112,30 100,44 Q88,30 100,18 Z" fill="url(#gold)"/>
    <!-- head (đầu = nhân sự) -->
    <circle cx="100" cy="80" r="42" fill="url(#head)" stroke="url(#gold)" stroke-width="3.5"/>
    <text x="100" y="95" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="700" font-size="40" fill="#f0d489">${ini}</text>
    <!-- vành mũ giáp -->
    <path d="M58,72 A42,42 0 0,1 142,72" fill="none" stroke="url(#gold)" stroke-width="3" opacity=".55"/>
  </svg>`;
}

function renderSoldierHome() {
  const w = me();
  const r = rankOf(w.exp);
  const p = expProgress(w.exp);

  // Mục tiêu tháng gộp vào tổng quan: KPI của chính mình + mục tiêu của quản lý.
  const myKpi = state.missions.filter((m) => m.assigneeId === w.id && m.type === "thang");
  const squad = SQUADS.find((s) => s.leaderId === w.id || s.deputyId === w.id || s.memberIds.includes(w.id));
  const leader = squad ? byId(squad.leaderId) : null;
  const leaderObj = leader ? objOf(leader.id) : null;

  const kpiHtml = myKpi.length ? myKpi.map((m) => {
    const pct = Math.min(100, Math.round((m.current / m.target) * 100));
    return `<div style="padding:8px 0;border-bottom:1px solid var(--line-soft)">
      <div style="display:flex;justify-content:space-between;gap:10px"><b style="font-size:14px">${m.title.replace(/^Tháng \d+:\s*/, "")}</b><span class="mission__reward">+${m.exp} EXP</span></div>
      <div class="mission__prog"><div class="mission__progfill" style="width:${pct}%"></div></div>
      <div class="mission__foot"><span>${fmtNum(m.current)}/${fmtNum(m.target)} ${m.unit} (${pct}%)</span></div>
    </div>`;
  }).join("") : `<div class="muted">Chưa có KPI tháng.</div>`;

  const leaderHtml = leaderObj
    ? `<div style="margin-top:14px"><div class="muted" style="margin-bottom:6px">Mục tiêu của quản lý (${leader.name}) — bạn đang góp phần vào:</div>
        <div class="exp"><div class="exp__top"><span>Tiến độ mục tiêu đội</span><span>${weightedProgress(leaderObj.items)}%</span></div>
        <div class="exp__bar"><div class="exp__fill" style="width:${weightedProgress(leaderObj.items)}%"></div></div></div></div>`
    : "";

  const badgeHtml = Object.keys(BADGES).map((bid) => {
    const owned = w.badges.includes(bid); const b = BADGES[bid];
    return `<div class="badge r-${b.rarity} ${owned ? "" : "locked"}" title="${b.desc}"><span class="badge__ic">${b.icon}</span>${b.name}</div>`;
  }).join("");

  view().innerHTML = `
    <div class="grid cols-2">
      <div class="warrior-card">
        ${warriorPortrait(w)}
        <div class="hero__name">${w.name}</div>
        <div class="hero__meta"><span class="front-tag ${w.front === "hau_phuong" ? "hau" : "tien"}">${FRONT_LABEL[w.front]}</span> · ${w.dept}</div>
        <div class="warrior-rank">${r.insignia} ${r.name}</div>
        <div class="exp" style="width:100%;margin-top:14px">
          <div class="exp__top"><span>EXP: ${fmtNum(w.exp)}</span><span>Còn ${fmtNum(p.span - p.into)} → ${p.nextName}</span></div>
          <div class="exp__bar"><div class="exp__fill" style="width:${p.pct}%"></div></div>
        </div>
        <div class="tiles" style="width:100%">
          <div class="tile"><div class="tile__num">${w.badges.length}</div><div class="tile__lbl">HUÂN CHƯƠNG</div></div>
          <div class="tile"><div class="tile__num">${fmtNum(w.seasonPoints)}</div><div class="tile__lbl">ĐIỂM MÙA</div></div>
          <div class="tile"><div class="tile__num">${state.missions.filter((m) => m.assigneeId === w.id && m.status === "done").length}</div><div class="tile__lbl">ĐÃ XONG</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">🧭 Mục tiêu tháng</div>
        ${kpiHtml}
        ${leaderHtml}
        <div class="card__title" style="margin-top:18px">🧠 Lời khuyên</div>
        <div class="muted">Còn ${fmtNum(p.span - p.into)} EXP là lên ${p.nextName}. Vào “Bảng nhiệm vụ” chinh phục nhiệm vụ ngày để giữ chuỗi bất bại ⚡.</div>
      </div>
    </div>

    <div class="grid cols-2" style="margin-top:16px">
      ${supportRequestCard(w)}
      <div class="card">
        <div class="card__title">🏅 Kho huân chương (đổi ra tiền đào tạo / phần thưởng)</div>
        <div class="badgewrap">${badgeHtml}</div>
      </div>
    </div>

    ${incomingRequestsCard(w, false) ? `<div style="margin-top:16px">${incomingRequestsCard(w, false)}</div>` : ""}

    <div style="margin-top:16px">${penaltyRecordCard(w.id)}</div>`;

  bindSupportRequests();
}
