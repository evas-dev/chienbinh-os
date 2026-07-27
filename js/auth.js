/* ==========================================================================
   Đăng nhập — mỗi nhân sự 1 tài khoản: SĐT + mật khẩu.
   ⚠️ DEMO: xác thực ngay trên client, KHÔNG an toàn cho thật.
   Bản thật: gọi API backend, mật khẩu hash, phát JWT/session.
   ========================================================================== */

async function doLogin(phone, password) {
  const p = (phone || "").trim();
  const err = $("#loginErr");
  const btn = $("#btnLogin");
  if (btn) { btn.disabled = true; btn.textContent = "Đang xác thực…"; }

  // Supabase auth: email = <sđt>@chienbinh.local
  const { error } = await window._sb.auth.signInWithPassword({
    email: p + "@chienbinh.local",
    password,
  });

  if (btn) { btn.disabled = false; btn.textContent = "Vào trận ⚔"; }

  if (error) {
    if (err) err.textContent = "Sai số điện thoại hoặc mật khẩu, chiến binh!";
    return;
  }

  const warrior = state.warriors.find((w) => w.phone === p);
  if (!warrior || warrior.active === false) {
    await window._sb.auth.signOut();
    if (err) err.textContent = "Tài khoản không tồn tại hoặc đã bị ngưng.";
    return;
  }

  state.currentUserId = warrior.id;
  state.tab = "home";
  enterApp();
  toast("⚔ Nhập ngũ!", `Chào ${warrior.name} — ${ROLE_LABEL[warrior.role]}`, true);
}

async function logout() {
  if (window._sb) await window._sb.auth.signOut();
  state.currentUserId = null;
  renderLogin();
}

function enterApp() {
  renderAuthArea();
  render();
}

function renderAuthArea() {
  const w = me();
  const el = $("#authArea");
  el.innerHTML = `
    <span class="whoami__label">Đang đăng nhập</span>
    <div style="display:flex;align-items:center;gap:10px">
      <button class="btn btn--sm" id="btnBell" title="Thông báo chung">🔔 ${state.feed.length}</button>
      <b style="font-size:13px">${w.name}</b>
      <button class="btn btn--sm" id="btnLogout">Đăng xuất</button>
    </div>`;
  $("#btnLogout").onclick = logout;
  $("#btnBell").onclick = () => { state.tab = "feed"; render(); };
}

function renderLogin() {
  $("#tabs").innerHTML = "";
  $("#authArea").innerHTML = "";
  $("#view").innerHTML = `
    <div class="login-wrap">
      <div class="card login-card">
        <div style="text-align:center;margin-bottom:18px">
          <div class="avatar" style="margin:0 auto 12px;background:linear-gradient(160deg,var(--crimson),var(--crimson-deep));color:#fff">⚔</div>
          <div class="hero__name" style="font-size:22px">ĐĂNG NHẬP CHIẾN TRƯỜNG</div>
          <div class="muted">Nhập số điện thoại &amp; mật khẩu để vào trận</div>
        </div>
        <div class="field"><label>Số điện thoại</label>
          <input id="loginPhone" inputmode="tel" placeholder="VD: 0901000001" /></div>
        <div class="field"><label>Mật khẩu</label>
          <input id="loginPass" type="password" placeholder="Mật khẩu" /></div>
        <div id="loginErr" style="color:#ff8877;font-size:13px;min-height:18px;margin:4px 0"></div>
        <button class="btn btn--gold" id="btnLogin" style="width:100%">Vào trận ⚔</button>

      </div>
    </div>`;

  const submit = () => doLogin($("#loginPhone").value, $("#loginPass").value);
  $("#btnLogin").onclick = submit;
  $("#loginPass").addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  $("#loginPhone").focus();
}
