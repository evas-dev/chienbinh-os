/* ==========================================================================
   Màn MỤC TIÊU THÁNG — CEO giao KPI trọng số cho trưởng phòng;
   Quản lý xem mục tiêu của mình + bẻ nhỏ thành nhiệm vụ ngày cho lính.
   ========================================================================== */

function objOf(ownerId) { return state.objectives.find((o) => o.ownerId === ownerId); }

// Tiến độ tổng có trọng số: Σ(min(current/target,1) × weight) / Σweight
function weightedProgress(items) {
  const totalW = items.reduce((s, it) => s + it.weight, 0) || 1;
  const got = items.reduce((s, it) => s + Math.min(it.current / it.target, 1) * it.weight, 0);
  return Math.round((got / totalW) * 100);
}

function fmtTargetVal(v, unit) {
  if (unit === "₫") return Math.round(v).toLocaleString("vi-VN") + "₫";
  return fmtNum(v) + " " + unit;
}

function kpiRow(it) {
  const pct = Math.min(100, Math.round((it.current / it.target) * 100));
  return `<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
      <b style="font-size:14px">${it.metric}</b>
      <span class="chip type-thang">Trọng số ${it.weight}%</span>
    </div>
    <div class="mission__prog"><div class="mission__progfill" style="width:${pct}%"></div></div>
    <div class="mission__foot"><span>${fmtTargetVal(it.current, it.unit)} / ${fmtTargetVal(it.target, it.unit)}</span><span class="mission__reward">${pct}%</span></div>
  </div>`;
}

function objectiveCard(o, showActions) {
  const owner = byId(o.ownerId);
  const overall = weightedProgress(o.items);
  return `<div class="card">
    <div class="card__title">🎯 ${owner.name} · ${owner.dept}</div>
    <div class="exp"><div class="exp__top"><span>Hoàn thành mục tiêu (có trọng số)</span><span>${overall}%</span></div>
      <div class="exp__bar"><div class="exp__fill" style="width:${overall}%"></div></div></div>
    <div style="margin-top:8px">${o.items.map(kpiRow).join("")}</div>
    ${showActions ? `<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn btn--gold btn--sm" data-assign="${o.ownerId}">➕ Giao thêm KPI</button></div>` : ""}
  </div>`;
}

function renderObjectives() {
  const w = me();

  if (w.role === "tong_tu_lenh") {
    view().innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        <div class="section-note" style="margin:0;flex:1;min-width:240px">👑 <b>Cấp CEO:</b> giao mục tiêu KPI cho trưởng phòng, hoặc <b>giao việc thẳng cho nhân sự</b> không qua quản lý.</div>
        <button class="btn btn--gold" id="btnAssignStaff">➕ Giao việc trực tiếp cho nhân sự</button>
      </div>
      <div class="grid cols-2">${state.objectives.map((o) => objectiveCard(o, true)).join("")}</div>`;
    view().querySelectorAll("[data-assign]").forEach((b) => b.onclick = () => openAssignObjectiveModal(b.dataset.assign));
    $("#btnAssignStaff").onclick = () => openCreateMissionModal(true);
    return;
  }

  if (w.role === "tu_lenh") {
    const o = objOf(w.id);
    view().innerHTML = `
      <div class="section-note">🎖 <b>Cấp Quản lý:</b> đây là mục tiêu CEO giao cho anh/chị. Bấm “Bẻ thành nhiệm vụ ngày” để giao chỉ tiêu cụ thể cho lính.</div>
      ${o ? objectiveCard(o, false) : `<div class="card"><div class="muted">Chưa được CEO giao mục tiêu nào.</div></div>`}
      <div class="card" style="margin-top:16px">
        <div class="card__title">⚡ Bẻ mục tiêu thành nhiệm vụ ngày</div>
        <div class="muted" style="margin-bottom:12px">Chọn mẫu nhiệm vụ để giao nhanh cho lính, hoặc tạo tùy chỉnh.</div>
        <div class="badgewrap">
          ${FIXED_TASKS.map((t, i) => `<button class="btn btn--sm" data-fixed="${i}">＋ ${t.title} (${fmtNum(t.target)} ${t.unit})</button>`).join("")}
          <button class="btn btn--gold btn--sm" id="objCustom">➕ Nhiệm vụ tùy chỉnh</button>
        </div>
      </div>`;
    view().querySelectorAll("[data-fixed]").forEach((b) => b.onclick = () => openFixedTaskModal(FIXED_TASKS[Number(b.dataset.fixed)]));
    const c = $("#objCustom"); if (c) c.onclick = openCreateMissionModal;
    return;
  }

  // Chiến sỹ: chỉ xem mục tiêu của quản lý trực tiếp (đội trưởng)
  const squad = SQUADS.find((s) => s.leaderId === w.id || s.deputyId === w.id || s.memberIds.includes(w.id));
  const leader = squad ? byId(squad.leaderId) : null;
  const o = leader ? objOf(leader.id) : null;
  view().innerHTML = `
    <div class="section-note">⚔️ <b>Cấp Chiến sỹ:</b> đây là mục tiêu của quản lý trực tiếp — nhiệm vụ ngày của bạn góp phần hoàn thành nó.</div>
    ${o ? objectiveCard(o, false) : `<div class="card"><div class="muted">Đội chưa có mục tiêu.</div></div>`}`;
}

// CEO giao thêm 1 KPI cho trưởng phòng
function openAssignObjectiveModal(ownerId) {
  const owner = byId(ownerId);
  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>➕ Giao KPI cho ${owner.name}</h3><button class="iconbtn" id="aoClose">×</button></div>
      <div class="modal__body">
        <div class="field"><label>Tên chỉ tiêu</label><input id="aoMetric" placeholder="VD: Doanh số tháng" /></div>
        <div style="display:flex;gap:10px">
          <div class="field" style="flex:1"><label>Con số mục tiêu</label><input id="aoTarget" type="number" value="100" /></div>
          <div class="field" style="flex:1"><label>Đơn vị</label><input id="aoUnit" value="KH" /></div>
          <div class="field" style="flex:1"><label>Trọng số (%)</label><input id="aoWeight" type="number" value="20" /></div>
        </div>
        <div class="hint">Trọng số phản ánh mức độ quan trọng của KPI trong tổng thành tích tháng.</div>
      </div>
      <div class="modal__foot"><button class="btn" id="aoCancel">Hủy</button><button class="btn btn--gold" id="aoSave">Giao KPI ⚔</button></div>
    </div></div>`;
  $("#aoClose").onclick = closeModal; $("#aoCancel").onclick = closeModal;
  $("#aoSave").onclick = () => {
    const metric = $("#aoMetric").value.trim();
    if (!metric) { toast("Thiếu tên KPI", "Nhập tên chỉ tiêu đã."); return; }
    let o = objOf(ownerId);
    if (!o) { o = { ownerId, items: [] }; state.objectives.push(o); }
    o.items.push({ metric, target: Number($("#aoTarget").value) || 1, current: 0, unit: $("#aoUnit").value.trim() || "đv", weight: Number($("#aoWeight").value) || 10 });
    state.feed.unshift({ icon: "🎯", text: `CEO giao KPI «${metric}» cho <b>${owner.name}</b>`, time: "Vừa xong" });
    closeModal(); toast("Đã giao KPI 🎯", `${owner.name}: ${metric}`); render();
  };
}

// Quản lý giao nhanh 1 nhiệm vụ ngày mẫu cho lính
function openFixedTaskModal(tpl) {
  const w = me();
  const soldiers = state.warriors.filter((x) => x.role === "chien_sy" && x.front === w.front);
  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>⚡ Giao nhiệm vụ ngày</h3><button class="iconbtn" id="ftClose">×</button></div>
      <div class="modal__body">
        <div class="field"><label>Nhiệm vụ</label><input id="ftTitle" value="Hôm nay: ${tpl.title}" /></div>
        <div style="display:flex;gap:10px">
          <div class="field" style="flex:1"><label>Chỉ tiêu</label><input id="ftTarget" type="number" value="${tpl.target}" /></div>
          <div class="field" style="flex:1"><label>Đơn vị</label><input id="ftUnit" value="${tpl.unit}" /></div>
          <div class="field" style="flex:1"><label>EXP</label><input id="ftExp" type="number" value="${tpl.exp}" /></div>
        </div>
        <div class="field"><label>Giao cho</label>
          <select id="ftWho" class="whoami__select" style="width:100%">
            ${soldiers.map((s) => `<option value="${s.id}">${s.name} (${s.dept})</option>`).join("")}</select></div>
      </div>
      <div class="modal__foot"><button class="btn" id="ftCancel">Hủy</button><button class="btn btn--gold" id="ftSave">Giao ⚔</button></div>
    </div></div>`;
  $("#ftClose").onclick = closeModal; $("#ftCancel").onclick = closeModal;
  $("#ftSave").onclick = () => {
    const assigneeId = $("#ftWho").value;
    if (!assigneeId) { toast("Chưa có lính", "Front này chưa có chiến sỹ để giao."); return; }
    state.missions.push({ id: "m" + Date.now(), title: $("#ftTitle").value.trim(), type: "ngay", parentId: null,
      assignerId: w.id, assigneeId, target: Number($("#ftTarget").value) || 1, unit: $("#ftUnit").value.trim(),
      current: 0, exp: Number($("#ftExp").value) || 40, badgeReward: null, deadline: "Hôm nay", status: "todo" });
    state.feed.unshift({ icon: "⚡", text: `<b>${w.name}</b> giao nhiệm vụ ngày cho <b>${byId(assigneeId).name}</b>`, time: "Vừa xong" });
    closeModal(); toast("Đã giao ⚔", `${byId(assigneeId).name} có nhiệm vụ ngày mới.`); render();
  };
}
