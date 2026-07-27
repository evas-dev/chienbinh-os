/* ==========================================================================
   Luồng TẠO nhiệm vụ — Tổng Tư Lệnh mở chiến dịch giao Tư Lệnh;
   Tư Lệnh chia nhiệm vụ con giao Chiến Sỹ. (dùng chung state/helper của app.js)
   ========================================================================== */

// forceStaff = true: giao thẳng công việc/KPI cho 1 nhân sự (dùng cho CEO giao trực tiếp).
function openCreateMissionModal(forceStaff) {
  const w = me();
  const isTong = w.role === "tong_tu_lenh" && !forceStaff;
  // Người nhận: giao trực tiếp -> mọi chiến sỹ; Tổng TL -> Tư Lệnh; Tư Lệnh -> lính đội mình.
  const targets = forceStaff
    ? state.warriors.filter((x) => x.role === "chien_sy")
    : (isTong ? state.warriors.filter((x) => x.role === "tu_lenh")
      : state.warriors.filter((x) => x.role === "chien_sy" && (x.squad === w.squad || sameFront(x, w))));
  // Chiến dịch cha để liên kết (CEO thấy tất cả).
  const campaigns = state.missions.filter((m) => m.type === "chien_dich" && (w.role === "tong_tu_lenh" || m.assigneeId === w.id));

  const typeOptions = isTong
    ? `<option value="chien_dich">Chiến dịch lớn (giao Tư Lệnh)</option>`
    : `<option value="thang">Nhiệm vụ tháng (KPI khối lượng)</option><option value="ngay">Nhiệm vụ ngày</option>`;
  const title = isTong ? "Mở chiến dịch" : forceStaff ? "Giao việc trực tiếp cho nhân sự" : "Tạo nhiệm vụ cho lính";

  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>➕ ${title}</h3>
        <button class="iconbtn" id="cmClose">×</button></div>
      <div class="modal__body">
        <div class="field"><label>Tên nhiệm vụ</label>
          <input id="cmTitle" placeholder="${isTong ? "VD: CHIẾN DỊCH Q4: Chiếm 500 khách hàng" : "VD: Tháng 8: Chốt 15 hợp đồng"}" /></div>
        <div class="field"><label>Loại</label>
          <select id="cmType" class="whoami__select" style="width:100%">${typeOptions}</select></div>
        ${!isTong ? `<div class="field"><label>Thuộc chiến dịch (cha)</label>
          <select id="cmParent" class="whoami__select" style="width:100%">
            <option value="">— Không gắn —</option>
            ${campaigns.map((c) => `<option value="${c.id}">${c.title}</option>`).join("")}
          </select></div>` : ""}
        <div class="field"><label>Giao cho</label>
          <select id="cmAssignee" class="whoami__select" style="width:100%">
            ${targets.map((t) => `<option value="${t.id}">${t.name} — ${ROLE_LABEL[t.role]} (${t.dept})</option>`).join("")}
          </select></div>
        <div style="display:flex;gap:10px">
          <div class="field" style="flex:1"><label>Chỉ tiêu</label><input id="cmTarget" type="number" value="10" /></div>
          <div class="field" style="flex:1"><label>Đơn vị</label><input id="cmUnit" value="khách hàng" /></div>
          <div class="field" style="flex:1"><label>EXP thưởng</label><input id="cmExp" type="number" value="300" /></div>
        </div>
        <div class="field"><label>Hạn</label><input id="cmDeadline" value="31/08" /></div>
      </div>
      <div class="modal__foot">
        <button class="btn" id="cmCancel">Hủy</button>
        <button class="btn btn--gold" id="cmSubmit">Bàn giao ⚔</button>
      </div>
    </div></div>`;

  $("#cmClose").onclick = closeModal;
  $("#cmCancel").onclick = closeModal;
  $("#cmSubmit").onclick = () => {
    const title = $("#cmTitle").value.trim();
    if (!title) { toast("Thiếu tên", "Nhập tên nhiệm vụ đã, chỉ huy."); return; }
    const type = $("#cmType").value;
    const assigneeId = $("#cmAssignee").value;
    const m = {
      id: "m" + Date.now(), title, type,
      parentId: !isTong ? ($("#cmParent") && $("#cmParent").value) || null : null,
      assignerId: w.id, assigneeId,
      target: Number($("#cmTarget").value) || 1, unit: $("#cmUnit").value.trim() || "đơn vị",
      current: 0, exp: Number($("#cmExp").value) || 100, badgeReward: null,
      deadline: $("#cmDeadline").value.trim() || "—", status: "todo",
    };
    state.missions.push(m);
    state.feed.unshift({ icon: "📜", text: `<b>${w.name}</b> ${isTong ? "mở chiến dịch" : "bàn giao nhiệm vụ"} «${title}» cho <b>${byId(assigneeId).name}</b>`, time: "Vừa xong" });
    closeModal();
    toast("Đã bàn giao ⚔", `${byId(assigneeId).name} có nhiệm vụ mới.`);
    render();
  };
}

function sameFront(a, b) { return a.front === b.front; }
