/* ==========================================================================
   Màn Xử phạt — Tổng Tư Lệnh / Tư Lệnh áp phạt, trừ EXP + ghi sổ.
   Phạt kéo tụt cả danh vọng lẫn phần chia quỹ → có sức răn đe thật.
   ========================================================================== */

const SEVERITY = {
  nhe:      { label: "Nhẹ",      color: "#8fc0f5" },
  vua:      { label: "Vừa",      color: "var(--gold-soft)" },
  nang:     { label: "Nặng",     color: "#f0a093" },
  rat_nang: { label: "Rất nặng", color: "#ff6b5a" },
};

function applyPenalty(warriorId, code, reason) {
  const w = byId(warriorId);
  const p = PENALTIES.find((x) => x.code === code);
  if (!w || !p) return;
  w.exp = Math.max(0, w.exp + p.exp); // p.exp âm
  state.penaltyLog = state.penaltyLog || [];
  state.penaltyLog.unshift({ warriorId: w.id, name: w.name, penalty: p.name, exp: p.exp, extra: p.extra, reason, by: me().name, time: "Vừa xong" });
  state.feed.unshift({ icon: "⚖️", text: `<b>${w.name}</b> bị xử phạt: ${p.name} (${p.exp} EXP)`, time: "Vừa xong" });
  toast("⚖️ Đã xử phạt", `${w.name}: ${p.exp} EXP · ${p.extra}`);
  render();
}

// Hồ sơ kỷ luật của 1 nhân sự — hiện trong Sở chỉ huy (hồ sơ) của người đó.
function penaltyRecordCard(uid) {
  const list = (state.penaltyLog || []).filter((l) => l.warriorId === uid);
  const body = list.length ? list.map((l) => `<div class="mission">
      <div class="mission__body">
        <div class="mission__title">${l.penalty} <span style="color:#ff8877">(${l.exp} EXP)</span></div>
        <div class="mission__sub">⚠ ${l.extra} · Lý do: ${l.reason || "—"}</div>
        <div class="mission__sub">Người phạt: ${l.by} · ${l.time}</div>
      </div></div>`).join("")
    : `<div class="muted">Chưa có vi phạm nào — hồ sơ kỷ luật sạch 🛡</div>`;
  return `<div class="card">
    <div class="card__title" style="justify-content:space-between">
      <span style="display:flex;align-items:center;gap:8px">⚖️ Hồ sơ kỷ luật</span>
      ${list.length ? `<span class="chip type-chien-dich">${list.length} án phạt</span>` : ""}
    </div>${body}</div>`;
}

function renderPenalty() {
  const w = me();
  const canPunish = w.role === "tong_tu_lenh" || w.role === "tu_lenh";
  const log = state.penaltyLog || [];

  const catalog = PENALTIES.map((p) => {
    const s = SEVERITY[p.severity];
    return `<div class="mission">
      <div class="mission__body">
        <div class="mission__title">${p.name}</div>
        <div class="mission__foot">
          <span style="color:${s.color};font-weight:700">● ${s.label}</span>
          <span class="mission__reward" style="color:#ff8877">${p.exp} EXP</span>
          <span>⚠ ${p.extra}</span>
        </div>
      </div>
    </div>`;
  }).join("");

  const targets = state.warriors.filter((x) => x.role !== "tong_tu_lenh");
  const form = canPunish ? `
    <div class="card" style="margin-bottom:16px">
      <div class="card__title">⚖️ Áp phạt (chịu trách nhiệm: ${w.name})</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <div class="field" style="flex:1;min-width:160px"><label>Chiến binh vi phạm</label>
          <select id="pnWho" class="whoami__select" style="width:100%">
            ${targets.map((t) => `<option value="${t.id}">${t.name} (${t.dept})</option>`).join("")}</select></div>
        <div class="field" style="flex:1;min-width:160px"><label>Hình thức</label>
          <select id="pnCode" class="whoami__select" style="width:100%">
            ${PENALTIES.map((p) => `<option value="${p.code}">${p.name} (${p.exp} EXP)</option>`).join("")}</select></div>
      </div>
      <div class="field"><label>Lý do / bằng chứng</label><input id="pnReason" placeholder="Mô tả ngắn gọn vi phạm" /></div>
      <button class="btn btn--crimson" id="pnApply">Ra quyết định phạt ⚖️</button>
    </div>` : `<div class="section-note">Chỉ <b>Tổng Tư Lệnh</b> và <b>Tư Lệnh</b> mới có quyền áp phạt. Đổi vai ở góc phải để thử.</div>`;

  const logHtml = log.length ? log.map((l) => `<div class="feed-item">
      <div class="feed-dot">⚖️</div>
      <div><div class="feed-text"><b>${l.name}</b> — ${l.penalty} <span style="color:#ff8877">(${l.exp} EXP)</span></div>
        <div class="feed-time">${l.extra} · Lý do: ${l.reason || "—"} · Người phạt: ${l.by} · ${l.time}</div></div>
    </div>`).join("") : `<div class="muted">Chưa có án phạt nào. Giữ vững kỷ luật chiến trường 🛡</div>`;

  view().innerHTML = `
    ${form}
    <div class="grid cols-2">
      <div class="card"><div class="card__title">📕 Danh mục xử phạt</div>${catalog}</div>
      <div class="card"><div class="card__title">🗂 Sổ ghi án phạt</div>${logHtml}</div>
    </div>`;

  if (canPunish) {
    $("#pnApply").onclick = () => applyPenalty($("#pnWho").value, $("#pnCode").value, $("#pnReason").value.trim());
  }
}
