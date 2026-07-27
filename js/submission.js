/* ==========================================================================
   SUBMISSION — nộp kết quả & quản lý duyệt — CHIẾN BINH OS
   ========================================================================== */

const CONTENT_TYPES = [
  { key: "video",    label: "Video",        unit: "video", num: true  },
  { key: "view",     label: "Số view",      unit: "view",  num: true  },
  { key: "lead",     label: "Số lead",      unit: "lead",  num: true  },
  { key: "bai_viet", label: "Bài viết",     unit: "bài",   num: true  },
  { key: "bai_web",  label: "Bài web/SEO",  unit: "bài",   num: true  },
  { key: "khac",     label: "Nội dung khác",unit: "",      num: false },
];

// ─── Tiện ích log ─────────────────────────────────────────────────────────
async function logEvent(eventType, payload) {
  if (!window._sb) return;
  const w = me();
  window._sb.from("system_log").insert({
    event_type: eventType, actor_phone: w?.phone, actor_name: w?.name, payload
  }).then(({ error }) => { if (error) console.warn("[syslog]", error); });
}

async function addExpEntry(phone, name, delta, reason, refId) {
  if (!window._sb) return;
  window._sb.from("exp_log").insert({ phone, warrior_name: name, delta, reason, ref_id: refId })
    .then(({ error }) => { if (error) console.warn("[exp_log]", error); });
}

// ─── Employee: mở form nộp kết quả ────────────────────────────────────────
function openSubmitModal(mission) {
  const myPhone = me().phone;
  const assigner = byId(mission.assignerId);
  const ctRows = CONTENT_TYPES.map(ct => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line-soft)">
      <label style="min-width:130px;font-weight:500;cursor:pointer">
        <input type="checkbox" id="ct_${ct.key}" style="margin-right:6px">${ct.label}
      </label>
      <input id="ctv_${ct.key}" ${ct.num ? 'type="number" min="0"' : 'type="text"'}
        placeholder="${ct.unit || ct.label}" style="flex:1;padding:4px 8px" />
    </div>`).join("");

  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>📋 Nộp kết quả nhiệm vụ</h3><button class="iconbtn" id="subClose">×</button></div>
      <div class="modal__body">
        <div class="muted" style="margin-bottom:12px">${mission.title}</div>
        <div class="hint" style="margin-bottom:10px">✔ Tích loại nội dung đã thực hiện và điền số liệu:</div>
        ${ctRows}
        <div class="field" style="margin-top:10px">
          <label>Ghi chú / bằng chứng (tùy chọn)</label>
          <textarea id="subNote" rows="2" placeholder="Link, mã KH, số hóa đơn..."></textarea>
        </div>
      </div>
      <div class="modal__foot">
        <button class="btn" id="subCancel">Hủy</button>
        <button class="btn btn--gold" id="subSubmit">Nộp cho quản lý ⚔</button>
      </div>
    </div></div>`;

  $("#subClose").onclick = closeModal;
  $("#subCancel").onclick = closeModal;
  $("#subSubmit").onclick = async () => {
    const content = {};
    let hasData = false;
    CONTENT_TYPES.forEach(ct => {
      const box = document.getElementById("ct_" + ct.key);
      if (box && box.checked) {
        const val = document.getElementById("ctv_" + ct.key).value;
        if (val) { content[ct.key] = ct.num ? Number(val) : val; hasData = true; }
      }
    });
    const note = $("#subNote").value.trim();
    if (note) content.note = note;
    if (!hasData && !note) { toast("Thiếu thông tin", "Tích ít nhất 1 loại nội dung."); return; }

    const btn = $("#subSubmit"); btn.disabled = true; btn.textContent = "Đang gửi…";
    let round = 1;
    if (window._sb) {
      const { data } = await window._sb.from("submissions")
        .select("id").eq("mission_ref", mission.id).eq("submitter_phone", myPhone);
      round = (data?.length || 0) + 1;
    }

    const row = { mission_ref: mission.id, mission_title: mission.title,
      submitter_phone: myPhone, assigner_phone: assigner?.phone || "", round, content };

    if (window._sb) {
      const { error } = await window._sb.from("submissions").insert(row);
      if (error) {
        toast("Lỗi gửi", "Không gửi được. Thử lại sau."); btn.disabled = false;
        btn.textContent = "Nộp cho quản lý ⚔"; return;
      }
    }

    mission.status = "review"; mission._round = round; mission._rejected = false;
    state.feed.unshift({ icon: "🧾", text: `<b>${me().name}</b> nộp kết quả «${mission.title}» (Lần ${round}) — chờ duyệt`, time: "Vừa xong" });
    logEvent("mission_submit", { mission_ref: mission.id, round, content });
    closeModal();
    toast("Đã nộp kết quả 🧾", `Lần ${round} · Chờ ${assigner?.name || "quản lý"} duyệt.`);
    render();
  };
}

// ─── Manager: tải submissions chờ duyệt ────────────────────────────────────
async function loadPendingSubmissions() {
  if (!window._sb) return [];
  const { data } = await window._sb.from("submissions").select("*")
    .eq("assigner_phone", me().phone).eq("status", "cho_duyet")
    .order("created_at", { ascending: false });
  return data || [];
}

async function loadRecentReviewed() {
  if (!window._sb) return [];
  const { data } = await window._sb.from("submissions").select("*")
    .eq("assigner_phone", me().phone).neq("status", "cho_duyet")
    .order("reviewed_at", { ascending: false }).limit(15);
  return data || [];
}

// ─── Manager: duyệt ────────────────────────────────────────────────────────
async function approveSubmission(sub) {
  const submitter = state.warriors.find(w => w.phone === sub.submitter_phone);
  if (!submitter) { toast("Lỗi", "Không tìm thấy nhân sự."); return; }

  if (window._sb) await window._sb.from("submissions")
    .update({ status: "da_duyet", reviewed_at: new Date().toISOString() }).eq("id", sub.id);

  const mission = state.missions.find(m => m.id === sub.mission_ref);
  const expDelta = (mission?.type === "ngay") ? 40 : (mission?.exp || 40);
  const before = rankIndexOf(submitter.exp);
  submitter.exp += expDelta;
  submitter.seasonPoints += Math.round(expDelta * 0.6);
  const after = rankIndexOf(submitter.exp);
  if (mission) { mission.status = "done"; mission.current = mission.target; }
  _applyKpiUpdate(sub);

  addExpEntry(submitter.phone, submitter.name, expDelta, `Duyệt: ${sub.mission_title}`, sub.id);
  logEvent("submission_approve", { sub_id: sub.id, submitter: sub.submitter_phone, exp: expDelta });
  state.feed.unshift({ icon: "✅", text: `<b>${submitter.name}</b> được duyệt «${sub.mission_title}» (+${expDelta} EXP)`, time: "Vừa xong" });
  toast("Đã duyệt ✅", `${submitter.name} +${expDelta} EXP`, true);

  if (after > before) {
    state.feed.unshift({ icon: "🎖", text: `<b>${submitter.name}</b> thăng <b>${RANKS[after].name}</b>!`, time: "Vừa xong" });
    setTimeout(() => toast("🎖 THĂNG QUÂN HÀM", `${submitter.name} → ${RANKS[after].name}`, true), 600);
  }
  state.tab = "missions"; render();
}

function _applyKpiUpdate(sub) {
  const s = state.warriors.find(w => w.phone === sub.submitter_phone);
  if (!s) return;
  const c = sub.content;
  const obj = state.objectives.find(o => o.ownerId === s.id);
  if (!obj) return;
  obj.items.forEach(it => {
    const m = it.metric.toLowerCase();
    if (c.lead   && m.includes("khách hàng")) it.current = Math.min(it.target, it.current + c.lead);
    if (c.view   && m.includes("view"))       it.current = Math.min(it.target, it.current + c.view);
    if (c.video  && m.includes("video"))      it.current = Math.min(it.target, it.current + c.video);
    if (c.bai_viet && m.includes("bài"))      it.current = Math.min(it.target, it.current + c.bai_viet);
  });
}

// ─── Manager: từ chối ──────────────────────────────────────────────────────
function openRejectModal(sub) {
  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>❌ Từ chối kết quả</h3><button class="iconbtn" id="rjClose">×</button></div>
      <div class="modal__body">
        <div class="muted" style="margin-bottom:8px">${sub.mission_title}</div>
        <div class="field"><label>Lý do từ chối (bắt buộc)</label>
          <textarea id="rjReason" rows="3" placeholder="VD: Chưa đủ bằng chứng, cần bổ sung link..."></textarea>
        </div>
      </div>
      <div class="modal__foot">
        <button class="btn" id="rjCancel">Hủy</button>
        <button class="btn btn--crimson" id="rjSend">Gửi từ chối</button>
      </div>
    </div></div>`;
  $("#rjClose").onclick = closeModal; $("#rjCancel").onclick = closeModal;
  $("#rjSend").onclick = async () => {
    const reason = $("#rjReason").value.trim();
    if (!reason) { toast("Thiếu lý do", "Phải nhập lý do từ chối."); return; }
    if (window._sb) await window._sb.from("submissions")
      .update({ status: "tu_choi", reject_reason: reason, reviewed_at: new Date().toISOString() }).eq("id", sub.id);
    const mission = state.missions.find(m => m.id === sub.mission_ref);
    if (mission) { mission.status = "doing"; mission._rejected = true; mission._rejectReason = reason; }
    logEvent("submission_reject", { sub_id: sub.id, reason, submitter: sub.submitter_phone });
    state.feed.unshift({ icon: "❌", text: `Kết quả «${sub.mission_title}» bị từ chối: ${reason}`, time: "Vừa xong" });
    closeModal(); toast("Đã từ chối", "Nhân sự sẽ thấy lý do và nộp lại.");
    state.tab = "missions"; render();
  };
}

// ─── Render bảng duyệt cho quản lý ─────────────────────────────────────────
function _linkify(text) {
  return String(text).replace(/https?:\/\/[^\s<>"]+/g,
    url => `<a href="${url}" target="_blank" rel="noopener" style="color:var(--gold-soft);word-break:break-all">${url}</a>`);
}

function subContentSummary(content) {
  const parts = CONTENT_TYPES
    .filter(ct => content[ct.key] !== undefined)
    .map(ct => `${ct.label}: <b>${_linkify(String(content[ct.key]))}</b>`);
  if (content.note) parts.push(`Ghi chú: ${_linkify(content.note)}`);
  return parts.join(" · ") || "(không có dữ liệu)";
}

function _subKey(sub) { return `sub_${sub.id}`; }

function renderSubmissionCard(sub, mode) {
  // mode: "pending" | "reviewed"
  const submitter = state.warriors.find(w => w.phone === sub.submitter_phone);
  const name = submitter ? submitter.name : sub.submitter_phone;
  const isPending = mode === "pending";
  const isApproved = sub.status === "da_duyet";
  const statusBadge = isPending
    ? `<span class="chip st-review">⏳ Chờ duyệt · Lần ${sub.round}</span>`
    : isApproved
      ? `<span class="chip st-done">✅ Đã duyệt</span>`
      : `<span class="chip type-chien-dich">❌ Từ chối</span>`;
  const rejectNote = sub.reject_reason
    ? `<div style="color:var(--crimson);font-size:12px;margin-top:4px">Lý do: ${sub.reject_reason}</div>` : "";
  const subJson = JSON.stringify(sub).replace(/'/g, "&#39;");
  let actions = "";
  if (isPending) {
    actions = `
      <button class="btn btn--gold btn--sm" data-approve-sub="${sub.id}">Duyệt ✅</button>
      <button class="btn btn--sm" style="margin-left:6px" data-reject-sub='${subJson}'>Từ chối</button>`;
  } else if (isApproved) {
    actions = `<button class="btn btn--sm" style="font-size:11px;margin-top:4px" data-revert-sub='${subJson}'>Đổi sang từ chối</button>`;
  }
  return `<div class="mission" style="padding:12px">
    <div class="mission__body">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px">
        ${statusBadge} <b>${sub.mission_title}</b>
      </div>
      <div class="mission__sub">Nhân sự: <b>${name}</b> · ${new Date(sub.created_at).toLocaleDateString("vi-VN")}</div>
      <div class="mission__sub" style="margin-top:2px">${subContentSummary(sub.content)}</div>
      ${rejectNote}
    </div>
    <div class="mission__actions" style="flex-direction:column;gap:4px">${actions}</div>
  </div>`;
}

// Manager đổi từ "đã duyệt" → "từ chối" (revert EXP)
function openRevertRejectModal(sub) {
  $("#modalRoot").innerHTML = `
    <div class="modal-mask"><div class="modal">
      <div class="modal__head"><h3>🔄 Đổi thành từ chối</h3><button class="iconbtn" id="rvClose">×</button></div>
      <div class="modal__body">
        <div class="hint" style="margin-bottom:10px">⚠️ Kết quả này đã được duyệt. Chuyển sang từ chối sẽ <b>thu hồi EXP</b> đã cộng và ghi log lại.</div>
        <div class="muted" style="margin-bottom:8px">${sub.mission_title}</div>
        <div class="field"><label>Lý do điều chỉnh (bắt buộc)</label>
          <textarea id="rvReason" rows="3" placeholder="VD: Kết quả không đạt yêu cầu sau khi kiểm tra lại..."></textarea>
        </div>
      </div>
      <div class="modal__foot">
        <button class="btn" id="rvCancel">Hủy</button>
        <button class="btn btn--crimson" id="rvSend">Xác nhận thu hồi</button>
      </div>
    </div></div>`;
  $("#rvClose").onclick = closeModal; $("#rvCancel").onclick = closeModal;
  $("#rvSend").onclick = async () => {
    const reason = $("#rvReason").value.trim();
    if (!reason) { toast("Thiếu lý do", "Phải nhập lý do điều chỉnh."); return; }

    if (window._sb) await window._sb.from("submissions")
      .update({ status: "tu_choi", reject_reason: reason, reviewed_at: new Date().toISOString() }).eq("id", sub.id);

    // Revert EXP
    const submitter = state.warriors.find(w => w.phone === sub.submitter_phone);
    if (submitter) {
      const mission = state.missions.find(m => m.id === sub.mission_ref);
      const expDelta = (mission?.type === "ngay") ? 40 : (mission?.exp || 40);
      submitter.exp = Math.max(0, submitter.exp - expDelta);
      submitter.seasonPoints = Math.max(0, submitter.seasonPoints - Math.round(expDelta * 0.6));
      if (mission && mission.status === "done") { mission.status = "doing"; }
      addExpEntry(submitter.phone, submitter.name, -expDelta, `Thu hồi duyệt: ${sub.mission_title} — ${reason}`, sub.id);
    }
    logEvent("submission_revert_reject", { sub_id: sub.id, reason, submitter: sub.submitter_phone });
    state.feed.unshift({ icon: "🔄", text: `Kết quả «${sub.mission_title}» bị thu hồi: ${reason}`, time: "Vừa xong" });
    closeModal();
    toast("Đã thu hồi", "EXP đã hoàn lại, nhân sự sẽ thấy lý do.", false);
    state.tab = "missions"; render();
  };
}

async function loadMyApprovedSubmissions() {
  if (!window._sb) return [];
  const { data } = await window._sb.from("submissions").select("*")
    .eq("submitter_phone", me().phone).eq("status", "da_duyet")
    .order("reviewed_at", { ascending: false }).limit(20);
  return data || [];
}

async function renderReviewPanel(container) {
  container.innerHTML = `<div class="muted" style="padding:12px">Đang tải...</div>`;
  const [pending, recent] = await Promise.all([loadPendingSubmissions(), loadRecentReviewed()]);
  state._pendingSubs = pending;
  state._recentSubs = recent;
  container.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div class="card__title">🛡 Chờ anh/chị duyệt (${pending.length})</div>
      ${pending.length ? pending.map(s => renderSubmissionCard(s, "pending")).join("") : `<div class="muted">Không có kết quả nào chờ duyệt.</div>`}
    </div>
    <div class="card" style="margin-bottom:16px">
      <div class="card__title">📋 Kết quả đã xử lý</div>
      ${recent.length ? recent.map(s => renderSubmissionCard(s, "reviewed")).join("") : `<div class="muted">Chưa có kết quả nào.</div>`}
    </div>`;

  container.querySelectorAll("[data-approve-sub]").forEach(btn => {
    btn.onclick = () => {
      const sub = (state._pendingSubs || []).find(s => s.id === btn.dataset.approveSub);
      if (sub) approveSubmission(sub);
    };
  });
  container.querySelectorAll("[data-reject-sub]").forEach(btn => {
    btn.onclick = () => { try { openRejectModal(JSON.parse(btn.dataset.rejectSub)); } catch(e) { console.error(e); } };
  });
  container.querySelectorAll("[data-revert-sub]").forEach(btn => {
    btn.onclick = () => { try { openRevertRejectModal(JSON.parse(btn.dataset.revertSub)); } catch(e) { console.error(e); } };
  });
}
