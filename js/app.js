/* ==========================================================================
   CHIẾN BINH OS — logic & render (demo, vanilla JS, không backend)
   ========================================================================== */

const ROLE_LABEL = { tong_tu_lenh: "Tổng Tư Lệnh", tu_lenh: "Tư Lệnh", chien_sy: "Chiến Sỹ" };
const FRONT_LABEL = { hau_phuong: "Hậu Phương", tien_tuyen: "Tiền Tuyến" };
const TYPE_LABEL = { chien_dich: "Chiến dịch", thang: "Nhiệm vụ tháng", ngay: "Nhiệm vụ ngày" };

// State (bản làm việc, có thể thay đổi trong phiên demo)
const state = {
  currentUserId: null,          // null = chưa đăng nhập → hiện màn đăng nhập
  tab: "home",
  lbScope: "ca_nhan",
  warriors: WARRIORS.map((w) => ({ ...w, badges: [...w.badges] })),
  missions: MISSIONS.map((m) => ({ ...m })),
  feed: FEED.map((f) => ({ ...f })),
  objectives: OBJECTIVES.map((o) => ({ ownerId: o.ownerId, items: o.items.map((it) => ({ ...it })) })),
  requests: SUPPORT_REQUESTS.map((r) => ({ ...r })),
  commendations: COMMENDATIONS.map((c) => ({ ...c })),
  penaltyLog: PENALTY_LOG_SEED.map((p) => ({ ...p })),
  bonusPool: BONUS.pool,
  bonusMonths: BONUS.months,
};

// Menu theo cấp: CEO thấy toàn bộ; Quản lý thấy đội mình; Nhân sự thấy mình.
const ALL_ROLES = ["tong_tu_lenh", "tu_lenh", "chien_sy"];
const MGMT = ["tong_tu_lenh", "tu_lenh"]; // cấp quản lý trở lên
const CEO_ONLY = ["tong_tu_lenh"];        // chỉ CEO
// Chiến sỹ: Sở chỉ huy · Bảng nhiệm vụ · Quân hàm & Huân chương · Nhật ký.
// Quản lý: thêm Mục tiêu tháng · Bảng xếp hạng (toàn công ty) · Xử phạt (KHÔNG Tiểu đội/Quỹ thưởng).
// CEO: đầy đủ (thêm Tiểu đội + Quỹ thưởng).
const TABS = [
  { key: "home",       label: "🎖 Sở chỉ huy",           roles: ALL_ROLES },
  { key: "admin",      label: "👤 Quản trị nhân sự",      roles: CEO_ONLY },
  { key: "objectives", label: "🧭 Mục tiêu tháng",        roles: MGMT },
  { key: "commend",    label: "🏆 Đề xuất khen",          roles: CEO_ONLY },
  { key: "missions",   label: "🎯 Bảng nhiệm vụ",         roles: ALL_ROLES },
  { key: "squad",      label: "🛡 Tiểu đội",              roles: CEO_ONLY },
  { key: "ranks",      label: "📊 Bảng xếp hạng",         roles: MGMT },
  { key: "bonus",      label: "💰 Quỹ thưởng",            roles: CEO_ONLY },
  { key: "penalty",    label: "⚖️ Xử phạt",               roles: MGMT },
  { key: "ladder",     label: "🏅 Quân hàm & Huân chương",roles: ALL_ROLES },
  { key: "feed",       label: "📣 Nhật ký chiến công",    roles: ALL_ROLES },
  { key: "guide",      label: "📖 Cẩm nang",              roles: CEO_ONLY },
];

/* ------------------------------ Helpers --------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const byId = (id) => state.warriors.find((w) => w.id === id);
const fmtNum = (n) => n.toLocaleString("vi-VN");
const initials = (name) => name.trim().split(/\s+/).slice(-1)[0][0].toUpperCase();
const me = () => byId(state.currentUserId);

function rankIndexOf(exp) {
  let idx = 0;
  for (let i = 0; i < RANKS.length; i++) if (exp >= RANKS[i].minExp) idx = i;
  return idx;
}
function rankOf(exp) { return RANKS[rankIndexOf(exp)]; }
function expProgress(exp) {
  const i = rankIndexOf(exp);
  const cur = RANKS[i].minExp;
  const next = RANKS[i + 1] ? RANKS[i + 1].minExp : cur;
  if (!RANKS[i + 1]) return { pct: 100, into: exp - cur, span: exp - cur, nextName: "Đỉnh cao" };
  return { pct: Math.round(((exp - cur) / (next - cur)) * 100), into: exp - cur, span: next - cur, nextName: RANKS[i + 1].name };
}

/* ------------------------------ Toast ----------------------------------- */
function toast(title, desc, gold = false) {
  const el = document.createElement("div");
  el.className = "toast" + (gold ? " gold" : "");
  el.innerHTML = `<div class="toast__t">${title}</div><div class="toast__d">${desc}</div>`;
  $("#toastRoot").appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; }, 3200);
  setTimeout(() => el.remove(), 3700);
}

/* ------------------------------ Modal ----------------------------------- */
function closeModal() { $("#modalRoot").innerHTML = ""; }
function openReportModal(mission) {
  const root = $("#modalRoot");
  root.innerHTML = `
    <div class="modal-mask">
      <div class="modal">
        <div class="modal__head">
          <h3>📋 Nộp báo cáo kết quả</h3>
          <button class="iconbtn" id="mClose">×</button>
        </div>
        <div class="modal__body">
          <div class="muted">${mission.title}</div>
          <div class="field">
            <label>Bằng chứng hoàn thành (mã KH, số hóa đơn, link bài đạt view, danh sách KH mới, số học viên Zoom…)</label>
            <textarea id="proof" rows="4" placeholder="VD: KH#1043, HĐ-2208-17, https://tiktok.com/... đạt 42K view"></textarea>
          </div>
          <div class="field">
            <label>Khối lượng đạt được (${mission.unit})</label>
            <input id="qty" type="number" value="${mission.target}" />
          </div>
          <div class="hint">🛡 Báo cáo sẽ chuyển sang trạng thái <b>chờ duyệt</b>. Người duyệt xác nhận thì EXP &amp; huy hiệu mới được cộng (chống khai khống).</div>
        </div>
        <div class="modal__foot">
          <button class="btn" id="mCancel">Hủy</button>
          <button class="btn btn--gold" id="mSubmit">Nộp báo cáo ⚔</button>
        </div>
      </div>
    </div>`;
  $("#mClose").onclick = closeModal;
  $("#mCancel").onclick = closeModal;
  $("#mSubmit").onclick = () => {
    const proof = $("#proof").value.trim();
    if (!proof) { toast("Thiếu bằng chứng", "Chiến binh phải nộp bằng chứng thật."); return; }
    mission.current = Number($("#qty").value) || mission.current;
    mission.status = "review";
    mission._proof = proof;
    // Thông báo chung: có kết quả / đơn hàng / khách hàng mới gửi lên
    state.feed.unshift({ icon: "🧾", text: `<b>${me().name}</b> gửi kết quả mới «${mission.title}» (${proof}) — chờ duyệt`, time: "Vừa xong" });
    closeModal();
    toast("Đã nộp báo cáo 🧾", "Kết quả đã lên bảng tin, chờ duyệt.");
    render();
  };
}

/* ------------------------------ Actions --------------------------------- */
function acceptMission(m) { m.status = "doing"; toast("Nhận nhiệm vụ", "Ra trận thôi, chiến binh!"); render(); }

function approveMission(m) {
  const w = byId(m.assigneeId);
  m.status = "done";
  const before = rankIndexOf(w.exp);
  w.exp += m.exp;
  w.seasonPoints += Math.round(m.exp * 0.6);
  let badgeMsg = "";
  if (m.badgeReward && !w.badges.includes(m.badgeReward)) {
    w.badges.push(m.badgeReward);
    badgeMsg = ` + huy hiệu ${BADGES[m.badgeReward].icon} ${BADGES[m.badgeReward].name}`;
  }
  const after = rankIndexOf(w.exp);
  state.feed.unshift({ icon: "✅", text: `<b>${w.name}</b> hoàn thành «${m.title}» (+${m.exp} EXP${badgeMsg})`, time: "Vừa xong" });
  toast("Đã duyệt ✅", `${w.name} +${m.exp} EXP${badgeMsg}`, true);
  if (after > before) {
    state.feed.unshift({ icon: "🎖", text: `<b>${w.name}</b> thăng quân hàm <b>${RANKS[after].name}</b>!`, time: "Vừa xong" });
    setTimeout(() => toast("🎖 THĂNG QUÂN HÀM", `${w.name} → ${RANKS[after].name}`, true), 600);
  }
  render();
}

/* ------------------------------ Views ----------------------------------- */
function view() { return $("#view"); }

function renderHome() {
  const w = me();
  if (w.role === "chien_sy") return renderSoldierHome(); // tổng quan kiểu chiến binh
  if (w.role === "tong_tu_lenh") return renderCeoHome(); // CEO: báo cáo tổng quan công ty
  const r = rankOf(w.exp);
  const p = expProgress(w.exp);
  const myMissions = state.missions.filter((m) => m.assigneeId === w.id);
  const todayList = myMissions.filter((m) => m.type === "ngay");
  const badgeHtml = Object.keys(BADGES).map((bid) => {
    const owned = w.badges.includes(bid);
    const b = BADGES[bid];
    return `<div class="badge r-${b.rarity} ${owned ? "" : "locked"}" title="${b.desc}">
      <span class="badge__ic">${b.icon}</span>${b.name}</div>`;
  }).join("");

  view().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <div class="hero">
          <div class="avatar">${initials(w.name)}</div>
          <div>
            <div class="hero__name">${w.name}</div>
            <div class="hero__meta">
              <span class="front-tag ${w.front === "hau_phuong" ? "hau" : "tien"}">${FRONT_LABEL[w.front]}</span>
              · ${w.dept} · ${ROLE_LABEL[w.role]}
            </div>
            <div class="rankchip">${r.insignia} ${r.name}</div>
          </div>
        </div>
        <div class="exp">
          <div class="exp__top"><span>EXP: ${fmtNum(w.exp)}</span><span>Còn ${fmtNum(p.span - p.into)} → ${p.nextName}</span></div>
          <div class="exp__bar"><div class="exp__fill" id="expFill"></div></div>
        </div>
        <div class="tiles">
          <div class="tile"><div class="tile__num">${w.badges.length}</div><div class="tile__lbl">HUÂN CHƯƠNG</div></div>
          <div class="tile"><div class="tile__num">${fmtNum(w.seasonPoints)}</div><div class="tile__lbl">ĐIỂM MÙA</div></div>
          <div class="tile"><div class="tile__num">${myMissions.filter((m) => m.status === "done").length}/${myMissions.length}</div><div class="tile__lbl">NHIỆM VỤ</div></div>
        </div>
      </div>

      <div class="card">
        <div class="card__title">🎯 Nhiệm vụ hôm nay</div>
        ${todayList.length ? todayList.map(miniMission).join("") : `<div class="muted">Hôm nay chưa có nhiệm vụ ngày. Vào “Bảng nhiệm vụ” nhận thêm.</div>`}
        <div class="card__title" style="margin-top:18px">🧠 Lời khuyên cho anh/chị</div>
        <div class="muted">${adviceFor(w)}</div>
      </div>
    </div>

    ${incomingRequestsCard(w, true) ? `<div style="margin-top:16px">${incomingRequestsCard(w, true)}</div>` : ""}

    <div style="margin-top:16px">${managerCommendCard(w)}</div>

    <div class="grid cols-2" style="margin-top:16px">
      <div class="card">
        <div class="card__title">🏅 Kho huân chương (đổi ra tiền đào tạo / phần thưởng)</div>
        <div class="badgewrap">${badgeHtml}</div>
      </div>
      ${penaltyRecordCard(w.id)}
    </div>`;

  bindSupportRequests();
  bindCommend();
  requestAnimationFrame(() => { $("#expFill").style.width = p.pct + "%"; });
}

function miniMission(m) {
  const pct = Math.min(100, Math.round((m.current / m.target) * 100));
  return `<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)">
    <div style="display:flex;justify-content:space-between;gap:10px">
      <b style="font-size:14px">${m.title.replace(/^Hôm nay:\s*/, "")}</b>
      <span class="chip st-${statusKey(m.status)}">${statusLabel(m.status)}</span>
    </div>
    <div class="mission__prog"><div class="mission__progfill" style="width:${pct}%"></div></div>
    <div class="mission__foot"><span>${fmtNum(m.current)}/${fmtNum(m.target)} ${m.unit}</span><span class="mission__reward">+${m.exp} EXP</span></div>
  </div>`;
}

function statusKey(s) { return { todo: "todo", doing: "doing", review: "review", done: "done" }[s]; }
function statusLabel(s) { return { todo: "Chưa nhận", doing: "Đang làm", review: "Chờ duyệt", done: "Hoàn thành" }[s]; }

function adviceFor(w) {
  const p = expProgress(w.exp);
  if (w.role === "tong_tu_lenh") return "Anh là Tổng Tư Lệnh: hãy mở chiến dịch lớn và bàn giao cho các Tư Lệnh, rồi theo dõi bảng xếp hạng mặt trận.";
  if (w.role === "tu_lenh") return `Anh/chị là Tư Lệnh: còn báo cáo của lính đang chờ duyệt — vào “Bảng nhiệm vụ” xác nhận để đội được cộng điểm. Cách top mùa không xa!`;
  return `Còn ${p.span - p.into} EXP nữa là lên ${p.nextName}. Ưu tiên nhiệm vụ ngày để giữ chuỗi bất bại ⚡.`;
}

function renderMissions() {
  const w = me();
  if (w.role === "chien_sy") return renderQuestBoard(); // Chiến sỹ: quest board kiểu game
  const iAmApprover = w.role === "tu_lenh" || w.role === "tong_tu_lenh";
  // Nhiệm vụ của tôi
  const mine = state.missions.filter((m) => m.assigneeId === w.id);
  // Nhiệm vụ cần tôi duyệt (tôi là người giao và đang chờ duyệt)
  const toApprove = state.missions.filter((m) => m.assignerId === w.id && m.status === "review");

  view().innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:14px">
      <div class="section-note" style="margin:0;flex:1;min-width:240px">💡 Luồng: <b>Tổng Tư Lệnh</b> mở chiến dịch → giao <b>Tư Lệnh</b> → Tư Lệnh chia nhỏ cho <b>Chiến Sỹ</b> → Chiến Sỹ nộp báo cáo → Tư Lệnh duyệt. Đổi vai ở góc phải để thử.</div>
      ${iAmApprover ? `<button class="btn btn--gold" id="btnCreate">➕ ${w.role === "tong_tu_lenh" ? "Mở chiến dịch" : "Tạo nhiệm vụ"}</button>` : ""}
    </div>

    ${iAmApprover ? `<div class="card" style="margin-bottom:16px">
      <div class="card__title">🛡 Chờ anh/chị duyệt (${toApprove.length})</div>
      ${toApprove.length ? toApprove.map((m) => missionCard(m, "approve")).join("") : `<div class="muted">Không có báo cáo nào chờ duyệt.</div>`}
    </div>` : ""}

    <div class="card">
      <div class="card__title">🎯 Nhiệm vụ của tôi (${mine.length})</div>
      ${mine.length ? mine.map((m) => missionCard(m, "self")).join("") : `<div class="muted">Chưa có nhiệm vụ nào được giao.</div>`}
    </div>`;

  // gắn sự kiện
  const btnCreate = $("#btnCreate"); if (btnCreate) btnCreate.onclick = openCreateMissionModal;
  view().querySelectorAll("[data-accept]").forEach((b) => b.onclick = () => acceptMission(state.missions.find((m) => m.id === b.dataset.accept)));
  view().querySelectorAll("[data-report]").forEach((b) => b.onclick = () => openReportModal(state.missions.find((m) => m.id === b.dataset.report)));
  view().querySelectorAll("[data-approve]").forEach((b) => b.onclick = () => approveMission(state.missions.find((m) => m.id === b.dataset.approve)));
}

function missionCard(m, mode) {
  const pct = Math.min(100, Math.round((m.current / m.target) * 100));
  const assignee = byId(m.assigneeId);
  const badge = m.badgeReward ? `${BADGES[m.badgeReward].icon} ${BADGES[m.badgeReward].name}` : "—";
  let actions = "";
  if (mode === "self") {
    if (m.status === "todo") actions = `<button class="btn btn--gold btn--sm" data-accept="${m.id}">Nhận ⚔</button>`;
    else if (m.status === "doing") actions = `<button class="btn btn--gold btn--sm" data-report="${m.id}">Nộp báo cáo</button>`;
    else if (m.status === "review") actions = `<span class="chip st-review">Chờ duyệt</span>`;
    else actions = `<span class="chip st-done">✔ Xong</span>`;
  } else if (mode === "approve") {
    actions = `<button class="btn btn--crimson btn--sm" data-approve="${m.id}">Duyệt ✅</button>`;
  }
  const proof = m._proof ? `<div class="mission__sub">📎 Bằng chứng: ${m._proof}</div>` : "";
  return `<div class="mission">
    <div class="mission__body">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="chip type-${m.type.replace(/_/g, "-")}">${TYPE_LABEL[m.type]}</span>
        <span class="chip st-${statusKey(m.status)}">${statusLabel(m.status)}</span>
        <div class="mission__title">${m.title}</div>
      </div>
      <div class="mission__sub">Người nhận: <b>${assignee ? assignee.name : "—"}</b> · Người giao: ${byId(m.assignerId).name} · Hạn: ${m.deadline}</div>
      ${proof}
      <div class="mission__prog"><div class="mission__progfill" style="width:${pct}%"></div></div>
      <div class="mission__foot">
        <span>${fmtNum(m.current)}/${fmtNum(m.target)} ${m.unit} (${pct}%)</span>
        <span class="mission__reward">+${m.exp} EXP</span>
        <span>🏅 ${badge}</span>
      </div>
    </div>
    <div class="mission__actions">${actions}</div>
  </div>`;
}

function renderRanks() {
  const scopes = [
    ["ca_nhan", "Cấp 1 · Cá nhân"],
    ["tieu_doi", "Cấp 2 · Tiểu đội"],
    ["mat_tran", "Cấp 3 · Mặt trận"],
  ];
  let rows = "";
  if (state.lbScope === "ca_nhan") {
    const sorted = [...state.warriors].filter((w) => w.role !== "tong_tu_lenh").sort((a, b) => b.seasonPoints - a.seasonPoints);
    rows = sorted.map((w, i) => lbRow(i + 1, w.name, `${FRONT_LABEL[w.front]} · ${w.dept} · ${rankOf(w.exp).name}`, w.seasonPoints, w.id === state.currentUserId)).join("");
  } else if (state.lbScope === "tieu_doi") {
    const data = SQUADS.map((s) => {
      const members = [s.leaderId, s.deputyId, ...s.memberIds].filter(Boolean).map(byId);
      const pts = members.reduce((sum, m) => sum + m.seasonPoints, 0);
      return { name: s.name, sub: `${members.length} chiến binh · ĐT: ${byId(s.leaderId).name}`, pts };
    }).sort((a, b) => b.pts - a.pts);
    rows = data.map((d, i) => lbRow(i + 1, d.name, d.sub, d.pts, false)).join("");
  } else {
    const fronts = ["tien_tuyen", "hau_phuong"].map((f) => {
      const members = state.warriors.filter((w) => w.front === f);
      const pts = members.reduce((s, m) => s + m.seasonPoints, 0);
      return { name: FRONT_LABEL[f], sub: `${members.length} chiến binh`, pts, mine: me().front === f };
    }).sort((a, b) => b.pts - a.pts);
    rows = fronts.map((d, i) => lbRow(i + 1, d.name, d.sub, d.pts, d.mine)).join("");
  }

  view().innerHTML = `
    <div class="subtabs">${scopes.map(([k, l]) => `<button class="subtab ${state.lbScope === k ? "is-active" : ""}" data-scope="${k}">${l}</button>`).join("")}</div>
    <div class="section-note">🔁 <b>Điểm mùa</b> reset mỗi chiến dịch để ai cũng có cơ hội lật ngược. <b>EXP/Quân hàm</b> tích lũy trọn đời, không reset.</div>
    <div class="card">${rows}</div>`;

  view().querySelectorAll("[data-scope]").forEach((b) => b.onclick = () => { state.lbScope = b.dataset.scope; render(); });
}

function lbRow(rank, name, sub, pts, isMe) {
  const topCls = rank <= 3 ? ` top${rank}` : "";
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
  return `<div class="lb-row${topCls}${isMe ? " me" : ""}">
    <div class="lb-rank">${medal}</div>
    <div><div class="lb-name">${name}${isMe ? " · <span style='color:var(--gold-soft)'>Bạn</span>" : ""}</div><div class="lb-sub">${sub}</div></div>
    <div class="lb-pts">${fmtNum(pts)}<small>ĐIỂM MÙA</small></div>
  </div>`;
}

function renderLadder() {
  const w = me();
  const curIdx = rankIndexOf(w.exp);
  const steps = RANKS.map((r, i) => {
    const cls = i === curIdx ? "current" : i < curIdx ? "passed" : "";
    const tag = i === curIdx ? `<span class="chip st-doing">Đang ở đây</span>` : i < curIdx ? `<span class="chip st-done">Đã qua</span>` : "";
    return `<div class="ladder-step ${cls}">
      <div class="ladder-ins">${r.insignia}</div>
      <div><div class="ladder-name">${r.name}</div><div class="muted">${fmtNum(r.minExp)} EXP</div></div>
      <div class="ladder-exp">${tag}</div>
    </div>`;
  }).reverse().join("");

  const rewardHtml = REWARDS.map((r) => `<div class="badge"><span class="badge__ic">${r.icon}</span>${r.name} <span class="muted" style="margin-left:4px">· ${r.cost}</span></div>`).join("");
  const badgeHtml = Object.values(BADGES).map((b) => `<div class="badge r-${b.rarity}" title="${b.desc}"><span class="badge__ic">${b.icon}</span>${b.name}</div>`).join("");

  view().innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <div class="card__title">🎖 Thang quân hàm</div>
        <div class="ladder">${steps}</div>
      </div>
      <div>
        <div class="card">
          <div class="card__title">🎖 Hệ thống huân chương</div>
          <div class="badgewrap">${badgeHtml}</div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card__title">🎁 Đổi huân chương lấy thưởng</div>
          <div class="badgewrap">${rewardHtml}</div>
          <div class="hint" style="margin-top:12px"><b>Cấp bậc</b> = danh vọng (không tiêu được). <b>Huân chương</b> = đổi tiền đào tạo/quà/nghỉ phép. <b>EXP</b> = chia quỹ thưởng lớn cuối kỳ.</div>
        </div>
      </div>
    </div>`;
}

function renderBonus() {
  // Chia quỹ theo tỷ lệ EXP (điểm quân công). Không tính Tổng Tư Lệnh.
  const people = state.warriors.filter((w) => w.role !== "tong_tu_lenh");
  const totalExp = people.reduce((s, w) => s + w.exp, 0);
  const pool = state.bonusPool;
  const fmtVnd = (n) => Math.round(n).toLocaleString("vi-VN") + "₫";

  const rows = [...people].sort((a, b) => b.exp - a.exp).map((w) => {
    const pctNum = totalExp ? (w.exp / totalExp) * 100 : 0;
    const money = totalExp ? (w.exp / totalExp) * pool : 0;
    const isMe = w.id === state.currentUserId;
    return `<div class="lb-row${isMe ? " me" : ""}">
      <div class="lb-rank" style="font-size:14px">${rankOf(w.exp).insignia}</div>
      <div><div class="lb-name">${w.name}${isMe ? " · <span style='color:var(--gold-soft)'>Bạn</span>" : ""}</div>
        <div class="lb-sub">${FRONT_LABEL[w.front]} · ${w.dept} · ${rankOf(w.exp).name} · ${fmtNum(w.exp)} EXP</div></div>
      <div class="lb-pts">${fmtVnd(money)}<small>${pctNum.toFixed(1)}% QUỸ</small></div>
    </div>`;
  }).join("");

  view().innerHTML = `
    <div class="section-note">💰 Công thức: <b>Thưởng mỗi người = (EXP người đó ÷ Tổng EXP toàn đội) × Quỹ</b>. EXP tích trong kỳ ${state.bonusMonths} tháng; cấp bậc là danh vọng riêng, không ảnh hưởng số tiền.</div>
    <div class="grid cols-2">
      <div class="card">
        <div class="card__title">⚙️ Thiết lập quỹ (Tổng Tư Lệnh)</div>
        <div class="field"><label>Tổng quỹ thưởng cả kỳ (₫)</label>
          <input id="poolInput" type="number" step="10000000" value="${pool}" /></div>
        <div class="field"><label>Chu kỳ chia</label>
          <div class="subtabs">
            <button class="subtab ${state.bonusMonths === 3 ? "is-active" : ""}" data-months="3">3 tháng</button>
            <button class="subtab ${state.bonusMonths === 6 ? "is-active" : ""}" data-months="6">6 tháng</button>
          </div></div>
        <div class="tiles">
          <div class="tile"><div class="tile__num">${fmtNum(totalExp)}</div><div class="tile__lbl">TỔNG EXP</div></div>
          <div class="tile"><div class="tile__num">${people.length}</div><div class="tile__lbl">CHIẾN BINH</div></div>
          <div class="tile"><div class="tile__num" style="font-size:16px">${fmtVnd(pool)}</div><div class="tile__lbl">QUỸ</div></div>
        </div>
        <div class="hint" style="margin-top:12px">Đổi tổng quỹ hoặc chu kỳ → bảng chia bên phải tự tính lại theo thời gian thực.</div>
      </div>
      <div class="card">
        <div class="card__title">🏆 Bảng chia thưởng cuối kỳ (${state.bonusMonths} tháng)</div>
        ${rows}
      </div>
    </div>`;

  // Dùng 'change' (khi rời ô / Enter) để tránh giật khi gõ số lớn.
  $("#poolInput").onchange = (e) => { state.bonusPool = Number(e.target.value) || 0; render(); };
  view().querySelectorAll("[data-months]").forEach((b) => b.onclick = () => { state.bonusMonths = Number(b.dataset.months); render(); });
}

function renderFeed() {
  view().innerHTML = `
    <div class="card">
      <div class="card__title">📣 Nhật ký chiến công</div>
      ${state.feed.map((f) => `<div class="feed-item">
        <div class="feed-dot">${f.icon}</div>
        <div><div class="feed-text">${f.text}</div><div class="feed-time">${f.time}</div></div>
      </div>`).join("")}
    </div>`;
}

/* ------------------------------ Router ---------------------------------- */
function render() {
  const allowed = TABS.filter((t) => t.roles.includes(me().role)).map((t) => t.key);
  if (!allowed.includes(state.tab)) state.tab = "home";
  renderTabs(allowed);
  renderAuthArea(); // làm mới tên + số thông báo (chuông)
  const map = { home: renderHome, admin: renderAdmin, objectives: renderObjectives, commend: renderCommend, missions: renderMissions, squad: renderSquad, ranks: renderRanks, bonus: renderBonus, penalty: renderPenalty, ladder: renderLadder, feed: renderFeed, guide: renderGuide };
  (map[state.tab] || renderHome)();
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("is-active", t.dataset.tab === state.tab));
}

function renderTabs(allowed) {
  const nav = $("#tabs");
  nav.innerHTML = TABS.filter((t) => allowed.includes(t.key))
    .map((t) => `<button class="tab ${t.key === state.tab ? "is-active" : ""}" data-tab="${t.key}">${t.label}</button>`).join("");
  nav.querySelectorAll(".tab").forEach((b) => b.onclick = () => { state.tab = b.dataset.tab; render(); });
}

function setupSeason() {
  $("#seasonName").textContent = SEASON.name;
  $("#seasonDays").textContent = `còn ${SEASON.daysLeft} ngày`;
}

// boot() vẫn giữ để gọi khi không có session
function boot() {
  setupSeason();
  renderLogin();
}
// Không gọi boot() ở đây — init.js (module) sẽ gọi sau khi Supabase sẵn sàng
