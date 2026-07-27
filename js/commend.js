/* ==========================================================================
   ĐỀ XUẤT KHEN THƯỞNG — bộ phận (quản lý) đề xuất nhân sự + huy hiệu cuối tháng;
   CEO duyệt để trao huân chương. Quản lý đề xuất, CEO quyết.
   ========================================================================== */

const CM_STATUS = {
  cho_duyet: { label: "Chờ CEO duyệt", cls: "st-review" },
  da_duyet:  { label: "Đã trao",        cls: "st-done" },
  tu_choi:   { label: "Từ chối",        cls: "type-chien-dich" },
};

function approveCommend(id) {
  const c = state.commendations.find((x) => x.id === id); if (!c) return;
  const staff = byId(c.staffId);
  c.status = "da_duyet";
  if (!staff.badges.includes(c.badgeId)) staff.badges.push(c.badgeId);
  state.feed.unshift({ icon: "🏅", text: `CEO trao huân chương ${BADGES[c.badgeId].icon} ${BADGES[c.badgeId].name} cho <b>${staff.name}</b>`, time: "Vừa xong" });
  toast("Đã trao huân chương 🏅", `${staff.name} · ${BADGES[c.badgeId].name}`, true); render();
}
function rejectCommend(id) {
  const c = state.commendations.find((x) => x.id === id); if (!c) return;
  c.status = "tu_choi"; toast("Đã từ chối đề xuất", ""); render();
}

function commendRow(c, canApprove) {
  const s = CM_STATUS[c.status]; const staff = byId(c.staffId); const by = byId(c.proposedBy); const b = BADGES[c.badgeId];
  return `<div class="mission">
    <div class="mission__body">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="chip ${s.cls}">${s.label}</span>
        <b style="font-size:14px">${b.icon} ${b.name}</b>
      </div>
      <div class="mission__sub">👤 Khen: <b>${staff.name}</b> (${staff.dept}) · Do ${by ? by.name : "—"} đề xuất</div>
      <div class="mission__sub">📝 ${c.reason}</div>
    </div>
    ${canApprove && c.status === "cho_duyet" ? `<div class="mission__actions">
      <button class="btn btn--gold btn--sm" data-approvecm="${c.id}">Trao 🏅</button>
      <button class="btn btn--sm" data-rejectcm="${c.id}">Từ chối</button></div>` : ""}
  </div>`;
}

// Màn CEO: duyệt đề xuất khen thưởng cuối tháng.
function renderCommend() {
  view().innerHTML = `
    <div class="section-note">🏆 CEO duyệt đề xuất khen thưởng cuối tháng — trao huân chương cho nhân sự xuất sắc do các bộ phận đề xuất.</div>
    <div class="card">
      <div class="card__title">🏆 Danh sách đề xuất khen thưởng</div>
      ${state.commendations.length ? state.commendations.map((c) => commendRow(c, true)).join("") : `<div class="muted">Chưa có đề xuất nào.</div>`}
    </div>`;
  bindCommend();
}

// Thẻ trên Sở chỉ huy của Quản lý: đề xuất khen + xem trạng thái đề xuất của mình.
function managerCommendCard(w) {
  const mine = state.commendations.filter((c) => c.proposedBy === w.id);
  return `<div class="card">
    <div class="card__title" style="justify-content:space-between">
      <span style="display:flex;align-items:center;gap:8px">🏆 Đề xuất khen thưởng</span>
      <button class="btn btn--gold btn--sm" id="btnPropose">➕ Đề xuất khen</button>
    </div>
    ${mine.length ? mine.map((c) => commendRow(c, false)).join("") : `<div class="muted">Chưa đề xuất khen ai. Cuối tháng hãy đề xuất nhân sự xuất sắc để CEO duyệt.</div>`}
  </div>`;
}

function bindCommend() {
  document.querySelectorAll("[data-approvecm]").forEach((b) => b.onclick = () => approveCommend(b.dataset.approvecm));
  document.querySelectorAll("[data-rejectcm]").forEach((b) => b.onclick = () => rejectCommend(b.dataset.rejectcm));
  const p = $("#btnPropose"); if (p) p.onclick = openProposeModal;
}

function openProposeModal() {
  const w = me();
  const staff = state.warriors.filter((x) => x.role === "chien_sy" && x.front === w.front);
  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>🏆 Đề xuất khen thưởng</h3><button class="iconbtn" id="pmClose">×</button></div>
      <div class="modal__body">
        <div class="field"><label>Nhân sự được khen</label>
          <select id="pmStaff" class="whoami__select" style="width:100%">
            ${staff.map((s) => `<option value="${s.id}">${s.name} (${s.dept})</option>`).join("")}</select></div>
        <div class="field"><label>Huân chương đề xuất</label>
          <select id="pmBadge" class="whoami__select" style="width:100%">
            ${Object.keys(BADGES).map((k) => `<option value="${k}">${BADGES[k].icon} ${BADGES[k].name}</option>`).join("")}</select></div>
        <div class="field"><label>Lý do</label><textarea id="pmReason" rows="3" placeholder="Vì sao xứng đáng được khen"></textarea></div>
      </div>
      <div class="modal__foot"><button class="btn" id="pmCancel">Hủy</button><button class="btn btn--gold" id="pmSend">Gửi đề xuất</button></div>
    </div></div>`;
  $("#pmClose").onclick = closeModal; $("#pmCancel").onclick = closeModal;
  $("#pmSend").onclick = () => {
    const staffId = $("#pmStaff").value; if (!staffId) { toast("Chưa có nhân sự", "Front này chưa có chiến sỹ."); return; }
    const reason = $("#pmReason").value.trim(); if (!reason) { toast("Thiếu lý do", "Nhập lý do khen."); return; }
    state.commendations.push({ id: "cm" + Date.now(), staffId, badgeId: $("#pmBadge").value, reason, proposedBy: w.id, status: "cho_duyet" });
    state.feed.unshift({ icon: "🏆", text: `<b>${w.name}</b> đề xuất khen thưởng cho <b>${byId(staffId).name}</b>`, time: "Vừa xong" });
    closeModal(); toast("Đã gửi đề xuất 🏆", "Chờ CEO duyệt."); render();
  };
}
