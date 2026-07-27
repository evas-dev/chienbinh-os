/* ==========================================================================
   YÊU CẦU HỖ TRỢ — nhân sự xin hỗ trợ (quản lý / đồng đội), nghỉ phép,
   hoặc đề xuất cần duyệt. Gắn với "người hỗ trợ" (target). Tối đa 4/tháng.
   ========================================================================== */

const REQ_STATUS = {
  cho_duyet: { label: "Chờ duyệt", cls: "st-review" },
  da_duyet:  { label: "Đã duyệt",  cls: "st-done" },
  tu_choi:   { label: "Từ chối",   cls: "type-chien-dich" },
};

function reqTypeOf(code) { return REQUEST_TYPES.find((t) => t.code === code); }
function myRequests(uid) { return state.requests.filter((r) => r.requesterId === uid); }
function incomingRequests(uid) { return state.requests.filter((r) => r.targetId === uid); }

function approveRequest(id) {
  const r = state.requests.find((x) => x.id === id); if (!r) return;
  r.status = "da_duyet";
  state.feed.unshift({ icon: "✅", text: `<b>${me().name}</b> đã duyệt «${reqTypeOf(r.type).label}» của <b>${byId(r.requesterId).name}</b>`, time: "Vừa xong" });
  toast("Đã duyệt ✅", `${reqTypeOf(r.type).label} · ${byId(r.requesterId).name}`); render();
}
function rejectRequest(id) {
  const r = state.requests.find((x) => x.id === id); if (!r) return;
  r.status = "tu_choi";
  state.feed.unshift({ icon: "⛔", text: `<b>${me().name}</b> từ chối yêu cầu của <b>${byId(r.requesterId).name}</b>`, time: "Vừa xong" });
  toast("Đã từ chối", `${byId(r.requesterId).name}`); render();
}

// Thẻ "Yêu cầu cần tôi duyệt" — hiện ở màn người được gửi tới (quản lý/đồng đội).
function incomingRequestsCard(w, showEmpty) {
  const list = incomingRequests(w.id);
  if (!list.length && !showEmpty) return "";
  const pending = list.filter((r) => r.status === "cho_duyet").length;
  const rows = list.length ? list.map((r) => {
    const t = reqTypeOf(r.type); const s = REQ_STATUS[r.status]; const from = byId(r.requesterId);
    const canAct = r.status === "cho_duyet";
    return `<div class="mission">
      <div class="mission__body">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="chip ${s.cls}">${s.label}</span><b style="font-size:14px">${t.icon} ${t.label}</b>
        </div>
        <div class="mission__sub">👤 Từ: <b>${from ? from.name : "—"}</b> (${from ? ROLE_LABEL[from.role] : ""}) · Ngày ${r.createdAt}</div>
        <div class="mission__sub">📝 ${r.content}</div>
      </div>
      ${canAct ? `<div class="mission__actions">
        <button class="btn btn--crimson btn--sm" data-approvereq="${r.id}">Duyệt ✅</button>
        <button class="btn btn--sm" data-rejectreq="${r.id}">Từ chối</button></div>` : ""}
    </div>`;
  }).join("") : `<div class="muted">Chưa có yêu cầu nào gửi tới bạn.</div>`;
  return `<div class="card">
    <div class="card__title" style="justify-content:space-between">
      <span style="display:flex;align-items:center;gap:8px">📨 Yêu cầu cần tôi duyệt</span>
      ${pending ? `<span class="chip st-review">${pending} chờ duyệt</span>` : ""}
    </div>${rows}</div>`;
}

// Danh sách người có thể là "người hỗ trợ" theo loại yêu cầu
function supportTargets(w, type) {
  const t = reqTypeOf(type);
  if (t && t.to === "staff") return state.warriors.filter((x) => x.id !== w.id && x.role === "chien_sy");
  // gửi quản lý: các Tư Lệnh + Tổng Tư Lệnh (mặc định là đội trưởng của mình)
  return state.warriors.filter((x) => x.role === "tu_lenh" || x.role === "tong_tu_lenh");
}
function defaultTarget(w) {
  const squad = SQUADS.find((s) => s.leaderId === w.id || s.deputyId === w.id || s.memberIds.includes(w.id));
  return squad ? squad.leaderId : "u1";
}

// Thẻ hiển thị trong Sở chỉ huy
function supportRequestCard(w) {
  const list = myRequests(w.id);
  const used = list.length;
  const left = Math.max(0, MAX_REQUESTS_PER_MONTH - used);

  const rows = list.length ? list.map((r) => {
    const t = reqTypeOf(r.type); const s = REQ_STATUS[r.status];
    const target = byId(r.targetId);
    const canCancel = r.status === "cho_duyet";
    return `<div class="mission">
      <div class="mission__body">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span class="chip ${s.cls}">${s.label}</span>
          <b style="font-size:14px">${t.icon} ${t.label}</b>
        </div>
        <div class="mission__sub">👤 Người hỗ trợ: <b>${target ? target.name : "—"}</b> (${target ? ROLE_LABEL[target.role] : ""}) · Ngày ${r.createdAt}</div>
        <div class="mission__sub">📝 ${r.content}</div>
      </div>
      ${canCancel ? `<div class="mission__actions"><button class="btn btn--sm" data-cancelreq="${r.id}">Hủy</button></div>` : ""}
    </div>`;
  }).join("") : `<div class="muted">Chưa có yêu cầu nào trong tháng.</div>`;

  const typeBtns = REQUEST_TYPES.map((t) =>
    `<button class="btn btn--sm req-type" data-reqtype="${t.code}" ${left <= 0 ? "disabled" : ""}>${t.icon} ${t.label}</button>`).join("");

  return `<div class="card">
    <div class="card__title" style="justify-content:space-between">
      <span style="display:flex;align-items:center;gap:8px">🤝 Yêu cầu hỗ trợ</span>
      <span class="chip type-thang">Còn ${left}/${MAX_REQUESTS_PER_MONTH} tháng này</span>
    </div>
    <div class="muted" style="margin-bottom:8px">Chọn loại yêu cầu để tạo (tối đa ${MAX_REQUESTS_PER_MONTH}/tháng):</div>
    <div class="req-types">${typeBtns}</div>
    ${left <= 0 ? `<div class="hint" style="margin:8px 0">Đã dùng hết quota ${MAX_REQUESTS_PER_MONTH} yêu cầu tháng này.</div>` : ""}
    <div class="card__title" style="margin-top:16px">🗂 Yêu cầu của tôi</div>
    ${rows}
  </div>`;
}

function bindSupportRequests() {
  document.querySelectorAll("[data-reqtype]").forEach((b) => {
    if (!b.disabled) b.onclick = () => openRequestModal(b.dataset.reqtype);
  });
  document.querySelectorAll("[data-approvereq]").forEach((b) => b.onclick = () => approveRequest(b.dataset.approvereq));
  document.querySelectorAll("[data-rejectreq]").forEach((b) => b.onclick = () => rejectRequest(b.dataset.rejectreq));
  document.querySelectorAll("[data-cancelreq]").forEach((b) => b.onclick = () => {
    state.requests = state.requests.filter((r) => r.id !== b.dataset.cancelreq);
    toast("Đã hủy yêu cầu", "Yêu cầu được gỡ khỏi danh sách."); render();
  });
}

function openRequestModal(presetType) {
  const w = me();
  const initType = presetType || REQUEST_TYPES[0].code;
  const renderTargets = (type) => supportTargets(w, type)
    .map((t) => `<option value="${t.id}" ${t.id === defaultTarget(w) ? "selected" : ""}>${t.name} — ${ROLE_LABEL[t.role]} (${t.dept})</option>`).join("");

  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>🤝 Tạo yêu cầu hỗ trợ</h3><button class="iconbtn" id="rqClose">×</button></div>
      <div class="modal__body">
        <div class="field"><label>Loại yêu cầu</label>
          <select id="rqType" class="whoami__select" style="width:100%">
            ${REQUEST_TYPES.map((t) => `<option value="${t.code}" ${t.code === initType ? "selected" : ""}>${t.icon} ${t.label}</option>`).join("")}</select></div>
        <div class="field"><label>Người hỗ trợ / người duyệt</label>
          <select id="rqTarget" class="whoami__select" style="width:100%">${renderTargets(initType)}</select></div>
        <div class="field"><label>Nội dung</label>
          <textarea id="rqContent" rows="3" placeholder="Mô tả cần hỗ trợ gì / lý do nghỉ / nội dung đề xuất"></textarea></div>
        <div class="hint">Yêu cầu sẽ gửi tới người hỗ trợ và ở trạng thái <b>chờ duyệt</b>. Tối đa ${MAX_REQUESTS_PER_MONTH} yêu cầu/tháng.</div>
      </div>
      <div class="modal__foot"><button class="btn" id="rqCancel">Hủy</button><button class="btn btn--gold" id="rqSend">Gửi yêu cầu ⚔</button></div>
    </div></div>`;

  // đổi loại -> cập nhật danh sách người hỗ trợ
  $("#rqType").onchange = (e) => { $("#rqTarget").innerHTML = renderTargets(e.target.value); };
  $("#rqClose").onclick = closeModal; $("#rqCancel").onclick = closeModal;
  $("#rqSend").onclick = () => {
    if (myRequests(w.id).length >= MAX_REQUESTS_PER_MONTH) { toast("Hết quota", "Đã dùng hết yêu cầu tháng này."); return; }
    const content = $("#rqContent").value.trim();
    if (!content) { toast("Thiếu nội dung", "Nhập nội dung yêu cầu đã."); return; }
    const type = $("#rqType").value; const targetId = $("#rqTarget").value;
    state.requests.push({ id: "r" + Date.now(), type, requesterId: w.id, targetId, content, status: "cho_duyet", createdAt: "Hôm nay" });
    state.feed.unshift({ icon: reqTypeOf(type).icon, text: `<b>${w.name}</b> gửi yêu cầu «${reqTypeOf(type).label}» tới <b>${byId(targetId).name}</b>`, time: "Vừa xong" });
    closeModal(); toast("Đã gửi yêu cầu 🤝", `Chờ ${byId(targetId).name} duyệt.`); render();
  };
}
