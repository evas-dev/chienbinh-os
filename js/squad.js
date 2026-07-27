/* ==========================================================================
   Màn Tiểu đội — cơ cấu Hậu Phương / Tiền Tuyến, mỗi tiểu đội gồm
   1 đội trưởng + 1 đội phó + tối đa 3 thành viên. Điểm đội = tổng EXP.
   ========================================================================== */

function squadCard(s) {
  const leader = byId(s.leaderId);
  const deputy = s.deputyId ? byId(s.deputyId) : null;
  const members = s.memberIds.map(byId);
  const all = [leader, deputy, ...members].filter(Boolean);
  const totalExp = all.reduce((sum, m) => sum + m.exp, 0);

  const person = (p, tag) => `<div class="lb-row" style="margin-bottom:7px">
    <div class="avatar" style="width:40px;height:40px;font-size:16px;border-radius:10px">${initials(p.name)}</div>
    <div><div class="lb-name" style="font-size:14px">${p.name} ${tag ? `<span class="chip st-doing">${tag}</span>` : ""}</div>
      <div class="lb-sub">${p.dept} · ${rankOf(p.exp).name}</div></div>
    <div class="lb-pts" style="font-size:15px">${fmtNum(p.exp)}<small>EXP</small></div>
  </div>`;

  return `<div class="card">
    <div class="card__title">🛡 ${s.name}</div>
    ${person(leader, "Đội trưởng")}
    ${deputy ? person(deputy, "Đội phó") : ""}
    ${members.map((m) => person(m, "")).join("")}
    <div class="tiles" style="margin-top:12px">
      <div class="tile"><div class="tile__num">${all.length}/5</div><div class="tile__lbl">QUÂN SỐ</div></div>
      <div class="tile"><div class="tile__num">${fmtNum(totalExp)}</div><div class="tile__lbl">TỔNG EXP</div></div>
      <div class="tile"><div class="tile__num">${fmtNum(Math.round(totalExp / all.length))}</div><div class="tile__lbl">TB / NGƯỜI</div></div>
    </div>
  </div>`;
}

function renderSquad() {
  const fronts = [
    ["tien_tuyen", "⚔️ TIỀN TUYẾN — Marketing · Sale"],
    ["hau_phuong", "🛡 HẬU PHƯƠNG — Kế toán · Dev · CSKH"],
  ];
  const blocks = fronts.map(([f, label]) => {
    const squads = SQUADS.filter((s) => byId(s.leaderId).front === f);
    return `<h2 style="font-family:var(--f-display);letter-spacing:1px;margin:6px 0 12px;color:var(--gold-soft)">${label}</h2>
      <div class="grid cols-2">${squads.map(squadCard).join("")}</div>`;
  }).join('<div style="height:20px"></div>');

  view().innerHTML = `
    <div class="section-note">Cơ cấu tổ đội: 1 <b>tiểu đội trưởng</b> + 1 <b>tiểu đội phó</b> + tối đa 3 thành viên. Điểm đội gộp từ EXP thành viên → thi đua ở <b>Bảng xếp hạng · Cấp 2</b>, tạo áp lực đồng đội (chống mất đoàn kết).</div>
    ${blocks}`;
}
