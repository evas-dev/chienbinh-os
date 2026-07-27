/* ==========================================================================
   SỞ CHỈ HUY của CEO — báo cáo tổng quan công ty: tổng hợp KPI cuối của quản lý
   (% trọng số giao/đạt/vượt), doanh số, khách hàng, chỉ số tài chính, cảnh báo
   so cùng kỳ. + Tạo tài khoản nhân sự theo phòng ban/vị trí.
   ========================================================================== */

function metricByName(name) {
  for (const o of state.objectives) for (const it of o.items) if (it.metric.includes(name)) return it;
  return null;
}
function weightedRaw(items) { // không giới hạn 100% -> để nhận biết "vượt"
  const tw = items.reduce((s, it) => s + it.weight, 0) || 1;
  return Math.round(items.reduce((s, it) => s + (it.current / it.target) * it.weight, 0) / tw * 100);
}
function vnd(n) { return Math.round(n).toLocaleString("vi-VN") + "₫"; }
function deltaTag(cur, prev) {
  const d = prev ? Math.round(((cur - prev) / prev) * 100) : 0;
  const up = d >= 0;
  return `<span style="color:${up ? "#9ce0b4" : "#ff8877"};font-weight:700">${up ? "▲" : "▼"} ${Math.abs(d)}%</span>`;
}

function deptStatus(raw) {
  if (raw >= 100) return { t: "Vượt/Đạt", c: "st-done" };
  if (raw >= 80) return { t: "Sắp đạt", c: "st-doing" };
  if (raw >= 60) return { t: "Đang chạy", c: "type-thang" };
  return { t: "Chậm tiến độ", c: "type-chien-dich" };
}

function renderCeoHome() {
  const doanhSo = metricByName("Doanh số");
  const khMoi = metricByName("Khách hàng mới");
  const lead = metricByName("Lead");
  const congNo = metricByName("Công nợ");
  const csat = metricByName("CSAT");

  const completion = Math.round(state.objectives.reduce((s, o) => s + weightedProgress(o.items), 0) / (state.objectives.length || 1));

  // Cảnh báo
  const alerts = [];
  if (doanhSo) alerts.push({ ok: doanhSo.current >= PREV_PERIOD.revenue, text: `Doanh số ${vnd(doanhSo.current)} so cùng kỳ ${deltaTag(doanhSo.current, PREV_PERIOD.revenue)}` });
  if (khMoi) alerts.push({ ok: khMoi.current >= PREV_PERIOD.newCustomers, text: `Khách hàng mới ${fmtNum(khMoi.current)} so cùng kỳ ${deltaTag(khMoi.current, PREV_PERIOD.newCustomers)}` });
  state.objectives.forEach((o) => {
    const raw = weightedRaw(o.items);
    if (raw < 60) alerts.push({ ok: false, text: `⚠ ${byId(o.ownerId).name} (${byId(o.ownerId).dept}) chậm tiến độ — mới ${raw}% trọng số` });
  });
  const warnCount = alerts.filter((a) => !a.ok).length;

  const deptRows = state.objectives.map((o) => {
    const w = byId(o.ownerId); const raw = weightedRaw(o.items); const cap = Math.min(100, raw); const st = deptStatus(raw);
    return `<div style="padding:10px 0;border-bottom:1px solid var(--line-soft)">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <b style="font-size:14px">${w.name} · ${w.dept}</b>
        <span class="chip ${st.c}">${st.t} · ${raw}%</span>
      </div>
      <div class="mission__prog"><div class="mission__progfill" style="width:${cap}%"></div></div>
    </div>`;
  }).join("");

  const kpiRowSmall = (label, m) => m ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--line-soft)">
    <span class="muted">${label}</span><b>${m.unit === "₫" ? vnd(m.current) : fmtNum(m.current) + " " + m.unit} / ${m.unit === "₫" ? vnd(m.target) : fmtNum(m.target)}</b></div>` : "";

  view().innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:16px">
      <div><div class="hero__name" style="font-size:24px">📊 BÁO CÁO TỔNG QUAN CÔNG TY</div>
        <div class="muted">Tổng hợp KPI cuối của cấp quản lý · Mục tiêu ${SEASON.name}</div></div>
      <button class="btn btn--gold" id="btnCreateUser">➕ Tạo tài khoản nhân sự</button>
    </div>

    <div class="tiles" style="grid-template-columns:repeat(4,1fr)">
      <div class="tile"><div class="tile__num" style="font-size:18px">${doanhSo ? vnd(doanhSo.current) : "—"}</div><div class="tile__lbl">DOANH SỐ ${doanhSo ? "(" + Math.round(doanhSo.current / doanhSo.target * 100) + "%)" : ""}</div></div>
      <div class="tile"><div class="tile__num">${khMoi ? fmtNum(khMoi.current) : "—"}</div><div class="tile__lbl">KHÁCH HÀNG MỚI</div></div>
      <div class="tile"><div class="tile__num">${completion}%</div><div class="tile__lbl">HOÀN THÀNH MỤC TIÊU CTY</div></div>
      <div class="tile"><div class="tile__num" style="color:${warnCount ? "#ff8877" : "#9ce0b4"}">${warnCount}</div><div class="tile__lbl">CẢNH BÁO</div></div>
    </div>

    <div class="grid cols-2" style="margin-top:16px">
      <div class="card">
        <div class="card__title">🎖 Tiến độ trọng số theo phòng ban (giao / đạt / vượt)</div>
        ${deptRows}
      </div>
      <div>
        <div class="card">
          <div class="card__title">📈 Chỉ số khách hàng & tài chính</div>
          ${kpiRowSmall("Doanh số tháng", doanhSo)}
          ${kpiRowSmall("Khách hàng mới", khMoi)}
          ${kpiRowSmall("Lead tiềm năng", lead)}
          ${kpiRowSmall("Công nợ thu hồi", congNo)}
          ${kpiRowSmall("CSAT hài lòng", csat)}
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card__title">🚨 Cảnh báo so với cùng kỳ / cùng quý</div>
          ${alerts.map((a) => `<div class="feed-item"><div class="feed-dot">${a.ok ? "✅" : "⚠️"}</div><div class="feed-text">${a.text}</div></div>`).join("")}
        </div>
      </div>
    </div>`;

  $("#btnCreateUser").onclick = openCreateUserModal;
}

// CEO tạo tài khoản nhân sự theo phòng ban / vị trí
function openCreateUserModal() {
  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>➕ Tạo tài khoản nhân sự</h3><button class="iconbtn" id="cuClose">×</button></div>
      <div class="modal__body">
        <div class="field"><label>Họ tên</label><input id="cuName" placeholder="VD: Trần Văn A" /></div>
        <div style="display:flex;gap:10px">
          <div class="field" style="flex:1"><label>Số điện thoại (đăng nhập)</label><input id="cuPhone" placeholder="09xxxxxxxx" /></div>
          <div class="field" style="flex:1"><label>Mật khẩu</label><input id="cuPass" value="123456" /></div>
        </div>
        <div class="field"><label>Phòng ban</label>
          <select id="cuDept" class="whoami__select" style="width:100%">
            <option value="Marketing">Marketing (Tiền tuyến)</option>
            <option value="Sale">Sale (Tiền tuyến)</option>
            <option value="Dev">Dev (Hậu phương)</option>
            <option value="CSKH">CSKH (Hậu phương)</option>
            <option value="Kế toán">Kế toán (Hậu phương)</option>
            <option value="HR">HR (Hậu phương)</option>
          </select>
        </div>
        <div class="field"><label>Cấp bậc hệ thống</label>
          <select id="cuRole" class="whoami__select" style="width:100%">
            <option value="chien_sy">Chiến sỹ (nhân viên)</option>
            <option value="tu_lenh">Tư lệnh (quản lý/trưởng phòng)</option></select></div>
        <div class="field"><label>Tiểu đội (tùy chọn)</label>
          <select id="cuSquad" class="whoami__select" style="width:100%">
            <option value="">— Chưa gán —</option>
            ${SQUADS.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}</select></div>
      </div>
      <div class="modal__foot"><button class="btn" id="cuCancel">Hủy</button><button class="btn btn--gold" id="cuSave">Tạo tài khoản ⚔</button></div>
    </div></div>`;
  $("#cuClose").onclick = closeModal; $("#cuCancel").onclick = closeModal;
  $("#cuSave").onclick = () => {
    const name = $("#cuName").value.trim(); const phone = $("#cuPhone").value.trim();
    if (!name || !phone) { toast("Thiếu thông tin", "Cần họ tên và số điện thoại."); return; }
    if (state.warriors.some((w) => w.phone === phone)) { toast("Trùng SĐT", "Số điện thoại này đã có tài khoản."); return; }
    const id = "u" + Date.now().toString().slice(-6);
    const dept = $("#cuDept").value;
    const front = ["Marketing", "Sale"].includes(dept) ? "tien_tuyen" : "hau_phuong";
    state.warriors.push({
      id, name, front, dept,
      squad: $("#cuSquad").value, role: $("#cuRole").value, exp: 0, seasonPoints: 0, badges: [],
      phone, password: $("#cuPass").value || "123456", active: true,
    });
    state.feed.unshift({ icon: "🆕", text: `CEO tạo tài khoản cho <b>${name}</b> (${$("#cuDept").value || "—"})`, time: "Vừa xong" });
    closeModal(); toast("Đã tạo tài khoản 🆕", `${name} · SĐT ${phone} · MK ${$("#cuPass").value || "123456"}`, true); render();
  };
}
