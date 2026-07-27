/* ==========================================================================
   QUEST BOARD — bảng nhiệm vụ kiểu game cho tài khoản CHIẾN SỸ.
   3 nhóm: Nhiệm vụ THÁNG (KPI giao cứng) · CỐ ĐỊNH hằng ngày · NGÀY chinh phục.
   Dùng chung acceptMission / openReportModal / state của app.js.
   ========================================================================== */

function questSlot(m, kind) {
  const pct = Math.min(100, Math.round((m.current / m.target) * 100));
  const icon = m.icon || (m.type === "thang" ? "🎖" : "⚔️");
  const rarity = kind === "kpi" ? "q-kpi" : (m.badgeReward ? "q-epic" : "");
  const rewardTag = m.badgeReward
    ? `<div class="q-reward-tag">🏅 ${BADGES[m.badgeReward].icon} ${BADGES[m.badgeReward].name}</div>` : "";

  let action = "";
  if (m.status === "todo") {
    const cls = kind === "bonus" ? "qbtn--epic" : "qbtn--accept";
    action = `<button class="qbtn ${cls}" data-accept="${m.id}">${kind === "bonus" ? "Chinh phục ⚔" : "Nhận ⚔"}</button>`;
  } else if (m.status === "doing" && m._rejected) {
    const round = (m._round || 1) + 1;
    const rejectHint = m._rejectReason ? `<div style="color:var(--crimson);font-size:11px;margin-bottom:2px">❌ ${m._rejectReason}</div>` : "";
    action = `<div style="text-align:center">${rejectHint}<button class="qbtn qbtn--submit" data-report="${m.id}">Nộp lại (Lần ${round})</button></div>`;
  } else if (m.status === "doing") {
    action = `<button class="qbtn qbtn--submit" data-report="${m.id}">${kind === "kpi" ? "Nộp kết quả" : "Nộp"}</button>`;
  } else if (m.status === "review") {
    const round = m._round || 1;
    action = `<span class="qbadge wait">⏳ Chờ duyệt (Lần ${round})</span>`;
  } else {
    action = `<span class="qbadge ok">✔ Xong</span>`;
  }

  const meta = kind === "kpi"
    ? `Giao cứng · kết quả cuối tháng · Hạn ${m.deadline}`
    : `${fmtNum(m.current)}/${fmtNum(m.target)} ${m.unit} · Hạn ${m.deadline}`;

  return `<div class="quest ${rarity} ${m.status === "done" ? "done" : ""}">
    <div class="quest__icon">${icon}</div>
    <div class="quest__body">
      <div class="quest__title">${m.title.replace(/^(CHINH PHỤC:|Hôm nay:)\s*/, "")}</div>
      <div class="quest__meta">${meta}</div>
      <div class="quest__bar"><div class="quest__fill" style="width:${pct}%"></div></div>
      ${rewardTag}
    </div>
    <div class="quest__side">
      <div class="quest__reward">+${m.exp}<small>EXP</small></div>
      ${action}
    </div>
  </div>`;
}

function questCategory(title, desc, cls, missions, kind) {
  if (!missions.length) return "";
  return `<div class="qb-cat ${cls}"><div class="qb-cat__ic">${cls === "kpi" ? "🎖" : cls === "fixed" ? "📌" : "⚔️"}</div>
      <div><div class="qb-cat__name">${title}</div><div class="qb-cat__desc">${desc}</div></div></div>
    <div class="quest-grid">${missions.map((m) => questSlot(m, kind)).join("")}</div>`;
}

// Bảng xếp hạng mini: TOP ĐẦU (top 3) · TOP GIỮA · TOP CUỐI — để chiến sỹ đua rank.
function miniLeaderboard() {
  const sorted = [...state.warriors]
    .filter((x) => x.role !== "tong_tu_lenh")
    .sort((a, b) => b.seasonPoints - a.seasonPoints);
  const n = sorted.length;
  // "Top giữa" xoay quanh người đang xem để họ luôn thấy vị trí của mình.
  const myIdx = sorted.findIndex((x) => x.id === state.currentUserId);
  const midStart = Math.max(0, Math.min((myIdx >= 0 ? myIdx : Math.floor(n / 2)) - 1, n - 3));
  const slice = (from, count) => sorted.slice(from, from + count).map((w, i) => [from + i + 1, w]);
  const groups = [
    { cls: "top", title: "🥇 Top đầu", rows: slice(0, 3) },
    { cls: "mid", title: "⚔️ Top giữa (quanh bạn)", rows: slice(midStart, 3) },
    { cls: "bot", title: "🐢 Top cuối", rows: slice(n - 3, 3) },
  ];
  const row = ([pos, w]) => `<div class="mlb-row ${w.id === state.currentUserId ? "me" : ""}">
      <div class="mlb-pos">${pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : pos}</div>
      <div class="mlb-nm">${w.name}${w.id === state.currentUserId ? " (Bạn)" : ""}</div>
      <div class="mlb-pt">${fmtNum(w.seasonPoints)}</div></div>`;
  return `<div class="card mini-lb">
    <div class="card__title">📊 Bảng xếp hạng mùa</div>
    ${groups.map((g) => `<div class="mlb-group ${g.cls}"><div class="mlb-group__h">${g.title}</div>${g.rows.map(row).join("")}</div>`).join("")}
  </div>`;
}

function renderQuestBoard() {
  const w = me();
  const mine = state.missions.filter((m) => m.assigneeId === w.id);
  const kpi = mine.filter((m) => m.type === "thang");
  const fixed = mine.filter((m) => m.type === "ngay" && m.fixed);
  const bonus = mine.filter((m) => m.type === "ngay" && !m.fixed);
  const daily = fixed.concat(bonus);
  const done = daily.filter((m) => m.status === "done").length;
  const total = daily.length || 1;
  const ringPct = Math.round((done / total) * 100);

  view().innerHTML = `
    <div class="qb">
      <div class="qb-hero">
        <div class="qb-hero__top">
          <div style="display:flex;align-items:center;gap:16px">
            <div class="qb-ring" style="--p:${ringPct}">
              <div class="qb-ring__inner"><div><div class="qb-ring__num">${done}/${daily.length}</div><div class="qb-ring__lbl">HÔM NAY</div></div></div>
            </div>
            <div>
              <div class="qb-hero__title">NHIỆM VỤ CỦA <b>${w.name.toUpperCase()}</b></div>
              <div class="qb-hero__sub">Chinh phục nhiệm vụ hôm nay để nhận EXP, thăng quân hàm và leo bảng xếp hạng ⚔️</div>
            </div>
          </div>
          <img class="qb-hero__char" src="assets/boidoi.png" alt="Chiến binh bộ đội Cụ Hồ" />
        </div>
      </div>

      <div class="qb-layout">
        <div>
          ${questCategory("Nhiệm vụ tháng — KPI", "Chỉ tiêu giao cứng, tính trên kết quả cuối tháng", "kpi", kpi, "kpi")}
          ${questCategory("Nhiệm vụ cố định", "Lặp lại mỗi ngày — nhận & hoàn thành trước cuối ngày", "fixed", fixed, "fixed")}
          ${questCategory("Nhiệm vụ ngày — Chinh phục", "Nhiệm vụ bổ sung để bứt phá, thưởng lớn hơn", "bonus", bonus, "bonus")}
          ${!mine.length ? `<div class="card"><div class="muted">Chưa có nhiệm vụ nào. Chờ quản lý giao xuống nhé, chiến binh!</div></div>` : ""}
        </div>
        ${miniLeaderboard()}
      </div>
    </div>`;

  view().querySelectorAll("[data-accept]").forEach((b) => b.onclick = () => acceptMission(state.missions.find((m) => m.id === b.dataset.accept)));
  view().querySelectorAll("[data-report]").forEach((b) => b.onclick = () => openReportModal(state.missions.find((m) => m.id === b.dataset.report)));
}
