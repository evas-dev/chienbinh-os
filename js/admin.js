/* ==========================================================================
   QUẢN TRỊ NHÂN SỰ (CEO) — danh sách tài khoản, tạo mới, NGƯNG / KÍCH HOẠT.
   Như app quản lý nhân sự bình thường. Tài khoản ngưng thì không đăng nhập được.
   Mặc định lọc theo phòng đang chạy pilot (Marketing).
   ========================================================================== */

function suspendUser(id) {
  const w = byId(id);
  if (!w || w.role === "tong_tu_lenh" || id === state.currentUserId) { toast("Không thể ngưng", "Không ngưng CEO hoặc chính mình."); return; }
  w.active = false;
  state.feed.unshift({ icon: "🚫", text: `Ngưng tài khoản <b>${w.name}</b> (${w.dept})`, time: "Vừa xong" });
  toast("Đã ngưng tài khoản", `${w.name} không thể đăng nhập.`); render();
}
function reactivateUser(id) {
  const w = byId(id); if (!w) return;
  w.active = true;
  state.feed.unshift({ icon: "✅", text: `Kích hoạt lại tài khoản <b>${w.name}</b>`, time: "Vừa xong" });
  toast("Đã kích hoạt lại", `${w.name} đăng nhập được.`); render();
}

function renderAdmin() {
  const depts = [...new Set(state.warriors.map((w) => w.dept))];
  if (state.adminDept === undefined) state.adminDept = "Marketing"; // pilot MKT
  const scope = state.adminDept;
  const list = state.warriors.filter((w) => scope === "__all__" || w.dept === scope);
  const activeCount = list.filter((w) => w.active !== false).length;

  const rows = list.map((w) => {
    const on = w.active !== false;
    const isSelf = w.id === state.currentUserId;
    const isCeo = w.role === "tong_tu_lenh";
    const action = isCeo || isSelf
      ? `<span class="muted" style="font-size:12px">${isCeo ? "CEO" : "Bạn"}</span>`
      : on
        ? `<button class="btn btn--sm" data-suspend="${w.id}">Ngưng</button>`
        : `<button class="btn btn--gold btn--sm" data-reactivate="${w.id}">Kích hoạt</button>`;
    return `<div class="admin-row ${on ? "" : "off"}">
      <div class="avatar" style="width:38px;height:38px;font-size:15px;border-radius:9px">${initials(w.name)}</div>
      <div class="admin-info">
        <div class="admin-name">${w.name} ${isSelf ? "<span class='muted'>· Bạn</span>" : ""}</div>
        <div class="admin-sub">${ROLE_LABEL[w.role]} · ${w.dept} · 📱 ${w.phone}</div>
      </div>
      <span class="chip ${on ? "st-done" : "type-chien-dich"}">${on ? "Đang hoạt động" : "Đã ngưng"}</span>
      <div class="admin-act">${action}</div>
    </div>`;
  }).join("");

  view().innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">
      <div><div class="hero__name" style="font-size:22px">👤 Quản trị nhân sự</div>
        <div class="muted">Đang chạy pilot: <b>${scope === "__all__" ? "Toàn công ty" : scope}</b> · ${activeCount}/${list.length} tài khoản hoạt động</div></div>
      <button class="btn btn--gold" id="btnCreateUser2">➕ Tạo tài khoản</button>
    </div>

    <div class="subtabs" style="flex-wrap:wrap">
      <button class="subtab ${scope === "Marketing" ? "is-active" : ""}" data-dept="Marketing">Marketing</button>
      <button class="subtab ${scope === "Sale" ? "is-active" : ""}" data-dept="Sale">Sale</button>
      ${depts.filter((d) => d !== "Marketing" && d !== "Sale" && d !== "Tổng tư lệnh").map((d) => `<button class="subtab ${scope === d ? "is-active" : ""}" data-dept="${d}">${d}</button>`).join("")}
      <button class="subtab ${scope === "__all__" ? "is-active" : ""}" data-dept="__all__">Tất cả</button>
    </div>

    <div class="card">${rows || `<div class="muted">Chưa có nhân sự ở phòng này.</div>`}</div>`;

  $("#btnCreateUser2").onclick = openCreateUserModal;
  view().querySelectorAll("[data-dept]").forEach((b) => b.onclick = () => { state.adminDept = b.dataset.dept; render(); });
  view().querySelectorAll("[data-suspend]").forEach((b) => b.onclick = () => suspendUser(b.dataset.suspend));
  view().querySelectorAll("[data-reactivate]").forEach((b) => b.onclick = () => reactivateUser(b.dataset.reactivate));
}
