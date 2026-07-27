/* ==========================================================================
   Dữ liệu mẫu (demo) — CHIẾN BINH OS
   Đây là dữ liệu giả để chạy thử vòng lặp vận hành. Bản thật sẽ nối DB/API.
   ========================================================================== */

// Quân hàm theo Quân đội: EXP (điểm quân công) đẩy cấp bậc — thuần DANH VỌNG.
// Cấp bậc là mốc cao nhất đạt được (chỉ lên, không xuống). Không ra tiền trực tiếp.
const RANKS = [
  { name: "Tân Thủ",      minExp: 0,     insignia: "○",  tier: "Tân binh" },
  { name: "Binh Nhì",     minExp: 150,   insignia: "▪",  tier: "Chiến sĩ" },
  { name: "Binh Nhất",    minExp: 350,   insignia: "▪▪", tier: "Chiến sĩ" },
  { name: "Hạ Sĩ",        minExp: 500,   insignia: "➤",  tier: "Hạ sĩ quan" },
  { name: "Trung Sĩ",     minExp: 900,   insignia: "➤➤", tier: "Hạ sĩ quan" },
  { name: "Thượng Sĩ",    minExp: 1400,  insignia: "➤➤➤",tier: "Hạ sĩ quan" },
  { name: "Thiếu Úy",     minExp: 2000,  insignia: "★",  tier: "Cấp Úy" },
  { name: "Trung Úy",     minExp: 2700,  insignia: "★★", tier: "Cấp Úy" },
  { name: "Thượng Úy",    minExp: 3500,  insignia: "★★★",tier: "Cấp Úy" },
  { name: "Đại Úy",       minExp: 4400,  insignia: "★★★★",tier: "Cấp Úy" },
  { name: "Thiếu Tá",     minExp: 5400,  insignia: "✪",  tier: "Cấp Tá" },
  { name: "Trung Tá",     minExp: 6500,  insignia: "✪✪", tier: "Cấp Tá" },
  { name: "Thượng Tá",    minExp: 7700,  insignia: "✪✪✪",tier: "Cấp Tá" },
  { name: "Đại Tá",       minExp: 9000,  insignia: "✪✪✪✪",tier: "Cấp Tá" },
  { name: "Thiếu Tướng",  minExp: 10500, insignia: "⭐",  tier: "Cấp Tướng" },
  { name: "Trung Tướng",  minExp: 12500, insignia: "⭐⭐", tier: "Cấp Tướng" },
  { name: "Thượng Tướng", minExp: 15000, insignia: "⭐⭐⭐",tier: "Cấp Tướng" },
  { name: "Đại Tướng",    minExp: 18000, insignia: "⭐⭐⭐⭐",tier: "Cấp Tướng" },
];

// Quỹ thưởng cuối kỳ: chia theo tỷ lệ EXP của từng người (demo).
const BONUS = { pool: 600000000, months: 6 };

// Huy hiệu: "tiền danh vọng", đổi ra phần thưởng
const BADGES = {
  first_blood:  { name: "Máu Lửa",        icon: "🔥", rarity: "rare",      desc: "Hoàn thành nhiệm vụ đầu tiên" },
  big_deal:     { name: "Hợp Đồng Lớn",   icon: "💼", rarity: "epic",      desc: "Ký hợp đồng giá trị cao" },
  viral:        { name: "Bùng Nổ View",   icon: "📈", rarity: "epic",      desc: "Bài đạt mốc view khủng" },
  kaizen:       { name: "Cải Tiến",       icon: "💡", rarity: "rare",      desc: "Sáng kiến giúp tổ chức tốt hơn" },
  guardian:     { name: "Hậu Phương Vững",icon: "🛡", rarity: "rare",      desc: "Không lỗi vận hành trong tháng" },
  streak:       { name: "Bất Bại 7 Ngày", icon: "⚡", rarity: "rare",      desc: "7 ngày liên tiếp hoàn thành nhiệm vụ" },
  general:      { name: "Danh Tướng",     icon: "👑", rarity: "legendary", desc: "Đứng #1 bảng xếp hạng mùa" },
};

// Phần thưởng ĐỔI BẰNG HUÂN CHƯƠNG (huân chương = "tiền" tiêu được).
// Cấp bậc/EXP KHÔNG tiêu ở đây — chỉ là danh vọng + chia quỹ cuối kỳ.
const REWARDS = [
  { name: "Nghỉ phép 1 ngày",       cost: "3 huân chương",  icon: "🌴" },
  { name: "Nghỉ phép 2 ngày",       cost: "6 huân chương",  icon: "🏖" },
  { name: "Tiền đào tạo / khóa học",cost: "4 huân chương",  icon: "📚" },
  { name: "Chương trình đào tạo VIP",cost: "Huân chương 👑",icon: "🎓" },
  { name: "Quà / hiện vật",         cost: "2 huân chương",  icon: "🎁" },
];

// MỤC TIÊU THÁNG: CEO giao KPI có trọng số (%) cho từng trưởng phòng (Tư Lệnh).
// Quản lý bẻ nhỏ mục tiêu này thành nhiệm vụ ngày cho lính.
const OBJECTIVES = [
  { ownerId: "u2", items: [ // Minh Đức — Sale
    { metric: "Doanh số tháng",  target: 2000000000, current: 1240000000, unit: "₫",    weight: 40 },
    { metric: "Hợp đồng mới",    target: 40,         current: 27,         unit: "HĐ",   weight: 30 },
    { metric: "Khách hàng mới",  target: 120,        current: 78,         unit: "KH",   weight: 30 },
  ] },
  { ownerId: "u3", items: [ // Thu Hà — Marketing
    { metric: "Tổng view nội dung", target: 500000, current: 318000, unit: "view", weight: 40 },
    { metric: "Lead tiềm năng",     target: 300,    current: 186,    unit: "lead", weight: 35 },
    { metric: "Bài / video xuất bản",target: 60,    current: 41,     unit: "bài",  weight: 25 },
  ] },
  { ownerId: "u4", items: [ // Quốc Bảo — Dev
    { metric: "Tính năng bàn giao", target: 8,  current: 5,  unit: "feature", weight: 50 },
    { metric: "Ngày không sự cố",   target: 30, current: 22, unit: "ngày",    weight: 50 },
  ] },
  { ownerId: "u9", items: [ // Ngọc Anh — CSKH
    { metric: "Ticket xử lý",   target: 400, current: 268, unit: "ticket", weight: 50 },
    { metric: "CSAT hài lòng",  target: 95,  current: 91,  unit: "%",      weight: 50 },
  ] },
  { ownerId: "u12", items: [ // Đình Phúc — Kế toán
    { metric: "Đóng sổ đúng hạn",  target: 100,       current: 80,        unit: "%", weight: 60 },
    { metric: "Công nợ thu hồi",   target: 500000000, current: 320000000, unit: "₫", weight: 40 },
  ] },
];

// Mẫu nhiệm vụ ngày để quản lý bấm giao nhanh cho lính (cố định + theo mục tiêu).
const FIXED_TASKS = [
  { title: "Viết 1 bài / đăng nội dung",         unit: "bài",    target: 1,    exp: 40 },
  { title: "Sản xuất video ngắn",                unit: "video",  target: 3,    exp: 60 },
  { title: "Đạt view nội dung",                  unit: "view",   target: 5000, exp: 50 },
  { title: "Học xong 1 kỹ năng mới",             unit: "kỹ năng",target: 1,    exp: 80 },
  { title: "Cập nhật 1 thông tin / insight mới", unit: "tin",    target: 1,    exp: 30 },
  { title: "Chăm sóc khách hàng",                unit: "khách",  target: 10,   exp: 50 },
];

// Yêu cầu hỗ trợ / nghỉ phép / đề xuất — nhân sự tạo, gắn với người hỗ trợ (target).
// to: "manager" = gửi quản lý duyệt | "staff" = nhờ đồng đội hỗ trợ.
const REQUEST_TYPES = [
  { code: "ho_tro_quan_ly", label: "Hỗ trợ từ quản lý",     icon: "🎖", to: "manager" },
  { code: "ho_tro_nhan_su", label: "Hỗ trợ từ nhân sự khác", icon: "🤝", to: "staff" },
  { code: "nghi_phep",      label: "Nghỉ phép",              icon: "🌴", to: "manager" },
  { code: "de_xuat",        label: "Đề xuất cần duyệt",      icon: "💡", to: "manager" },
];
const MAX_REQUESTS_PER_MONTH = 4; // tối đa 3-4 yêu cầu/tháng

// Đề xuất khen thưởng cuối tháng: bộ phận (quản lý) đề xuất nhân sự + huy hiệu, CEO duyệt.
const COMMENDATIONS = [
  { id: "cm1", staffId: "u5", badgeId: "big_deal", reason: "Chốt hợp đồng lớn nhất tháng cho đội Sale", proposedBy: "u2", status: "cho_duyet" },
  { id: "cm2", staffId: "u7", badgeId: "viral",    reason: "Video đạt 120K view, dẫn đầu Marketing",   proposedBy: "u3", status: "cho_duyet" },
];

// Doanh số/khách hàng cùng kỳ (tháng trước) để tính cảnh báo tăng/giảm — demo.
const PREV_PERIOD = { revenue: 1050000000, newCustomers: 64, leads: 210 };

// Án phạt mẫu (hiển thị trong hồ sơ nhân sự bị phạt).
const PENALTY_LOG_SEED = [
  { warriorId: "u6", name: "Hoàng Long", penalty: "Không hoàn thành nhiệm vụ", exp: -150, extra: "−1 ngày phép", reason: "Trễ chỉ tiêu gọi khách 2 ngày", by: "Minh Đức", time: "12/08" },
];

const SUPPORT_REQUESTS = [
  { id: "r1", type: "nghi_phep",      requesterId: "u5", targetId: "u2", content: "Xin nghỉ phép 1 ngày 20/08 (việc gia đình)", status: "da_duyet",  createdAt: "15/08" },
  { id: "r2", type: "ho_tro_quan_ly", requesterId: "u5", targetId: "u2", content: "Cần quản lý cùng đi chốt hợp đồng KH lớn", status: "cho_duyet", createdAt: "17/08" },
];

// Danh mục xử phạt: trừ EXP (kéo tụt cả danh vọng lẫn phần chia quỹ).
// severity: nhe | vua | nang | rat_nang
const PENALTIES = [
  { code: "khong_hoan_thanh", name: "Không hoàn thành nhiệm vụ", exp: -150,  extra: "−1 ngày phép",              severity: "nhe" },
  { code: "noi_xau",          name: "Nói xấu / gièm pha đồng đội", exp: -200, extra: "Thẻ cảnh cáo",             severity: "vua" },
  { code: "mat_doan_ket",     name: "Gây mất đoàn kết nội bộ",   exp: -300,  extra: "Thẻ cảnh cáo + kiểm điểm", severity: "nang" },
  { code: "bien_thu",         name: "Biển thủ / tham nhũng tổ chức", exp: -1000, extra: "Đình chỉ + xử lý kỷ luật", severity: "rat_nang" },
];

// Chiến binh (nhân sự) — <20 người
const WARRIORS = [
  { id: "u1",  name: "Anh Tuấn",   front: "hau_phuong", dept: "Tổng tư lệnh", squad: "s0", role: "tong_tu_lenh", exp: 7100, seasonPoints: 0,   badges: ["general","big_deal","kaizen"] },
  { id: "u2",  name: "Minh Đức",   front: "tien_tuyen", dept: "Sale",         squad: "s1", role: "tu_lenh",     exp: 4200, seasonPoints: 820, badges: ["big_deal","streak","first_blood"] },
  { id: "u3",  name: "Thu Hà",     front: "tien_tuyen", dept: "Marketing",    squad: "s2", role: "tu_lenh",     exp: 3900, seasonPoints: 910, badges: ["viral","kaizen","first_blood"] },
  { id: "u4",  name: "Quốc Bảo",   front: "hau_phuong", dept: "Dev",          squad: "s3", role: "tu_lenh",     exp: 3100, seasonPoints: 540, badges: ["guardian","kaizen"] },
  { id: "u5",  name: "Lan Chi",    front: "tien_tuyen", dept: "Sale",         squad: "s1", role: "chien_sy",    exp: 1850, seasonPoints: 690, badges: ["first_blood","streak"] },
  { id: "u6",  name: "Hoàng Long", front: "tien_tuyen", dept: "Sale",         squad: "s1", role: "chien_sy",    exp: 980,  seasonPoints: 430, badges: ["first_blood"] },
  { id: "u7",  name: "Mỹ Linh",    front: "tien_tuyen", dept: "Marketing",    squad: "s2", role: "chien_sy",    exp: 1420, seasonPoints: 760, badges: ["viral","first_blood"] },
  { id: "u8",  name: "Tiến Dũng",  front: "tien_tuyen", dept: "Marketing",    squad: "s2", role: "chien_sy",    exp: 620,  seasonPoints: 350, badges: ["first_blood"] },
  { id: "u9",  name: "Ngọc Anh",   front: "hau_phuong", dept: "CSKH",         squad: "s4", role: "tu_lenh",     exp: 2600, seasonPoints: 610, badges: ["guardian","streak"] },
  { id: "u10", name: "Văn Khoa",   front: "hau_phuong", dept: "Dev",          squad: "s3", role: "chien_sy",    exp: 1100, seasonPoints: 480, badges: ["first_blood","kaizen"] },
  { id: "u11", name: "Thanh Vân",  front: "hau_phuong", dept: "CSKH",         squad: "s4", role: "chien_sy",    exp: 740,  seasonPoints: 520, badges: ["first_blood"] },
  { id: "u12", name: "Đình Phúc",  front: "hau_phuong", dept: "Kế toán",      squad: "s5", role: "tu_lenh",     exp: 2100, seasonPoints: 300, badges: ["guardian"] },
];

// Cấp tài khoản đăng nhập cho MỌI nhân sự: SĐT + mật khẩu.
// ⚠️ DEMO ONLY — mật khẩu để plaintext chỉ để minh họa luồng đăng nhập.
// Bản thật PHẢI dùng backend + hash mật khẩu (bcrypt/argon2), không lưu kiểu này.
WARRIORS.forEach((w, i) => {
  w.phone = w.phone || "09010000" + String(i + 1).padStart(2, "0");
  w.password = w.password || "123456"; // mật khẩu mặc định demo — đổi khi dùng thật
  w.active = w.active !== false;         // true = đang hoạt động; false = đã ngưng (không đăng nhập được)
});

// Tiểu đội: đội trưởng + đội phó + tối đa 3 thành viên
const SQUADS = [
  { id: "s1", name: "Mãnh Hổ (Sale)",     leaderId: "u2",  deputyId: "u5",  memberIds: ["u6"] },
  { id: "s2", name: "Sấm Sét (Mkt)",      leaderId: "u3",  deputyId: "u7",  memberIds: ["u8"] },
  { id: "s3", name: "Trận Địa (Dev)",     leaderId: "u4",  deputyId: "u10", memberIds: [] },
  { id: "s4", name: "Lá Chắn (CSKH)",     leaderId: "u9",  deputyId: "u11", memberIds: [] },
  { id: "s5", name: "Kho Bạc (Kế toán)",  leaderId: "u12", deputyId: null,  memberIds: [] },
];

// Nhiệm vụ. type: chien_dich (cha) | thang (KPI khối lượng) | ngay
// status: todo | doing | review | done
const MISSIONS = [
  { id: "m1", title: "CHIẾN DỊCH Q3: Chiếm 300 khách hàng mới", type: "chien_dich", parentId: null,
    assignerId: "u1", assigneeId: "u2", target: 300, unit: "khách hàng", current: 182, exp: 2000,
    badgeReward: "general", deadline: "30/09", status: "doing" },

  { id: "m2", title: "Tháng 8: Chốt 40 hợp đồng mới", type: "thang", parentId: "m1",
    assignerId: "u2", assigneeId: "u5", target: 40, unit: "hợp đồng", current: 27, exp: 600,
    badgeReward: "big_deal", deadline: "31/08", status: "doing" },

  { id: "m3", title: "Tháng 8: 60 bài viết / video đạt tổng 500K view", type: "thang", parentId: "m1",
    assignerId: "u3", assigneeId: "u7", target: 500000, unit: "view", current: 318000, exp: 700,
    badgeReward: "viral", deadline: "31/08", status: "doing" },

  { id: "m4", title: "Hôm nay: Gọi chăm sóc 20 khách hàng cũ", type: "ngay", parentId: "m2",
    assignerId: "u2", assigneeId: "u6", target: 20, unit: "cuộc gọi", current: 0, exp: 120,
    badgeReward: null, deadline: "Hôm nay", status: "todo" },

  { id: "m5", title: "Hôm nay: Đăng 3 video ngắn kênh TikTok", type: "ngay", parentId: "m3",
    assignerId: "u3", assigneeId: "u8", target: 3, unit: "video", current: 1, exp: 100,
    badgeReward: null, deadline: "Hôm nay", status: "doing" },

  { id: "m6", title: "Tuần này: Tìm 25 khách hàng tiềm năng mới", type: "thang", parentId: "m1",
    assignerId: "u2", assigneeId: "u6", target: 25, unit: "lead", current: 25, exp: 300,
    badgeReward: "streak", deadline: "18/08", status: "review" }, // đang chờ duyệt

  { id: "m7", title: "Tháng 8: Giữ hệ thống 0 sự cố nghiêm trọng", type: "thang", parentId: null,
    assignerId: "u1", assigneeId: "u4", target: 30, unit: "ngày", current: 22, exp: 500,
    badgeReward: "guardian", deadline: "31/08", status: "doing" },

  { id: "m8", title: "Hôm nay: Xử lý toàn bộ ticket CSKH tồn đọng", type: "ngay", parentId: null,
    assignerId: "u9", assigneeId: "u11", target: 15, unit: "ticket", current: 9, exp: 110,
    badgeReward: null, deadline: "Hôm nay", status: "doing" },

  // --- Nhiệm vụ ngày cho CHIẾN SỸ: CỐ ĐỊNH (fixed) + BỔ SUNG chinh phục (bonus) ---
  // fixed=true: nhiệm vụ cố định lặp lại hằng ngày. fixed=false: nhiệm vụ ngày để chinh phục.
  { id: "d1", title: "Viết 1 bài / đăng nội dung", type: "ngay", fixed: true, icon: "✍️", parentId: null,
    assignerId: "u2", assigneeId: "u5", target: 1, unit: "bài", current: 0, exp: 40, badgeReward: null, deadline: "Hôm nay", status: "todo" },
  { id: "d2", title: "Gọi chăm sóc 20 khách hàng cũ", type: "ngay", fixed: true, icon: "📞", parentId: null,
    assignerId: "u2", assigneeId: "u5", target: 20, unit: "cuộc", current: 12, exp: 60, badgeReward: null, deadline: "Hôm nay", status: "doing" },
  { id: "d3", title: "Học 1 kỹ năng bán hàng mới", type: "ngay", fixed: true, icon: "📚", parentId: null,
    assignerId: "u2", assigneeId: "u5", target: 1, unit: "kỹ năng", current: 0, exp: 80, badgeReward: null, deadline: "Hôm nay", status: "todo" },
  { id: "b1", title: "CHINH PHỤC: Chốt thêm 1 hợp đồng khó", type: "ngay", fixed: false, icon: "🔥", parentId: "m2",
    assignerId: "u2", assigneeId: "u5", target: 1, unit: "HĐ", current: 0, exp: 150, badgeReward: "big_deal", deadline: "Hôm nay", status: "todo" },
  { id: "b2", title: "CHINH PHỤC: Tìm 5 khách hàng tiềm năng", type: "ngay", fixed: false, icon: "🎯", parentId: "m2",
    assignerId: "u2", assigneeId: "u5", target: 5, unit: "lead", current: 2, exp: 100, badgeReward: null, deadline: "Hôm nay", status: "doing" },

  { id: "d4", title: "Sản xuất 3 video ngắn", type: "ngay", fixed: true, icon: "🎬", parentId: null,
    assignerId: "u3", assigneeId: "u7", target: 3, unit: "video", current: 1, exp: 60, badgeReward: null, deadline: "Hôm nay", status: "doing" },
  { id: "d5", title: "Đạt 5.000 view nội dung", type: "ngay", fixed: true, icon: "📈", parentId: null,
    assignerId: "u3", assigneeId: "u7", target: 5000, unit: "view", current: 3200, exp: 50, badgeReward: null, deadline: "Hôm nay", status: "doing" },
  { id: "b3", title: "CHINH PHỤC: 1 video đạt 20K view", type: "ngay", fixed: false, icon: "🚀", parentId: "m3",
    assignerId: "u3", assigneeId: "u7", target: 20000, unit: "view", current: 0, exp: 180, badgeReward: "viral", deadline: "Hôm nay", status: "todo" },
];

// Nhật ký chiến công (feed)
const FEED = [
  { icon: "👑", text: "<b>Thu Hà</b> vươn lên #1 bảng xếp hạng mùa của <b>Tiền Tuyến</b>", time: "10 phút trước" },
  { icon: "🎖", text: "<b>Minh Đức</b> thăng quân hàm <b>Trung Sỹ</b> sau khi chốt hợp đồng lớn", time: "1 giờ trước" },
  { icon: "🔥", text: "<b>Lan Chi</b> hoàn thành chuỗi 7 ngày bất bại, nhận huy hiệu <b>⚡ Bất Bại</b>", time: "3 giờ trước" },
  { icon: "💡", text: "<b>Văn Khoa</b> được duyệt sáng kiến cải tiến quy trình deploy (+huy hiệu 💡)", time: "Hôm qua" },
  { icon: "🛡", text: "Tiểu đội <b>Lá Chắn (CSKH)</b> giữ vững 0 khiếu nại 2 tuần liên tiếp", time: "Hôm qua" },
];

// Mục tiêu tháng — tự đồng bộ theo lịch thật: tên = tháng/năm hiện tại,
// số ngày còn lại = ngày cuối tháng - hôm nay.
const _seasonNow = new Date();
const _seasonMonth = _seasonNow.getMonth() + 1;
const _seasonYear = _seasonNow.getFullYear();
const _seasonDaysInMonth = new Date(_seasonYear, _seasonMonth, 0).getDate();
const SEASON = {
  name: `THÁNG ${_seasonMonth}/${_seasonYear}`,
  month: _seasonMonth,
  year: _seasonYear,
  daysLeft: Math.max(0, _seasonDaysInMonth - _seasonNow.getDate()),
};
