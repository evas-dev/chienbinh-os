#!/bin/bash
# Kiểm thử các luồng chính của API giai đoạn 1
API="http://127.0.0.1:3001/api"
PASS=0; FAIL=0

kiem() {
  local ten="$1" ketQua="$2" mongDoi="$3"
  if [[ "$ketQua" == *"$mongDoi"* ]]; then
    echo "  ✅ $ten"; PASS=$((PASS+1))
  else
    echo "  ❌ $ten"; echo "     mong đợi chứa: $mongDoi"; echo "     nhận được: ${ketQua:0:200}"; FAIL=$((FAIL+1))
  fi
}

echo "── 1. NHÂN SỰ ──────────────────────────────────"
R=$(curl -s "$API/nhan-su")
kiem "Danh sách nhân sự" "$R" '"hoTen"'
kiem "Có đếm số hạng mục đang gánh" "$R" '"soHangMucDangLam"'

EMAIL_THU="thu-$(date +%s)@example.com"
R=$(curl -s -X POST "$API/nhan-su" -H 'Content-Type: application/json' \
  -d "{\"hoTen\":\"Võ Thị Ê\",\"email\":\"$EMAIL_THU\",\"soDienThoai\":\"0987654321\"}")
kiem "Tạo nhân sự mới" "$R" '"thanhCong":true'
NS_ID=$(echo "$R" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

R=$(curl -s -X POST "$API/nhan-su" -H 'Content-Type: application/json' \
  -d "{\"hoTen\":\"Trùng Email\",\"email\":\"$EMAIL_THU\"}")
kiem "Chặn email trùng (người đang hoạt động)" "$R" 'đã có trong danh bạ'

# Người đã nghỉ quay lại: phải kích hoạt lại chứ không chặn cứng
curl -s -X DELETE "$API/nhan-su/$NS_ID" > /dev/null
R=$(curl -s -X POST "$API/nhan-su" -H 'Content-Type: application/json' \
  -d "{\"hoTen\":\"Võ Thị Ê (quay lại)\",\"email\":\"$EMAIL_THU\"}")
kiem "Kích hoạt lại nhân sự đã nghỉ" "$R" '"dangHoatDong":true'
kiem "Giữ nguyên id cũ (không mất lịch sử)" "$R" "$NS_ID"

R=$(curl -s -X POST "$API/nhan-su" -H 'Content-Type: application/json' \
  -d '{"hoTen":"X","email":"sai-dinh-dang"}')
kiem "Chặn email sai định dạng" "$R" 'Email không hợp lệ'
kiem "Chặn họ tên quá ngắn" "$R" 'ít nhất 2 ký tự'

R=$(curl -s -X POST "$API/nhan-su" -H 'Content-Type: application/json' \
  -d '{"hoTen":"Sai SĐT","email":"sdt@example.com","soDienThoai":"123"}')
kiem "Chặn số điện thoại sai" "$R" 'Số điện thoại không hợp lệ'

echo
echo "── 2. CÔNG VIỆC ────────────────────────────────"
R=$(curl -s "$API/cong-viec")
kiem "Danh sách công việc" "$R" 'CV-0001'
kiem "Có đếm hạng mục quá hạn" "$R" '"soHangMucQuaHan"'

R=$(curl -s -X POST "$API/cong-viec" -H 'Content-Type: application/json' \
  -d '{"ten":"Công việc kiểm thử","ngayBatDau":"2026-08-01","ngayKetThucDuKien":"2026-07-01"}')
kiem "Chặn ngày kết thúc trước ngày bắt đầu" "$R" 'phải sau ngày bắt đầu'

R=$(curl -s -X POST "$API/cong-viec" -H 'Content-Type: application/json' \
  -d '{"ten":"Công việc kiểm thử","ngayBatDau":"2026-08-01","ngayKetThucDuKien":"2026-09-01","mucDoUuTien":"CAO"}')
kiem "Tạo công việc" "$R" '"thanhCong":true'
CV_ID=$(echo "$R" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
kiem "Sinh mã tự động" "$R" '"ma":"CV-000'

echo
echo "── 3. HẠNG MỤC + TRỌNG SỐ ──────────────────────"
for i in 1 2 3; do
  R=$(curl -s -X POST "$API/hang-muc" -H 'Content-Type: application/json' \
    -d "{\"congViecId\":\"$CV_ID\",\"ten\":\"Hạng mục $i\"}")
done
kiem "Tạo 3 hạng mục" "$R" '"thanhCong":true'

R=$(curl -s "$API/cong-viec/$CV_ID")
kiem "Trả về cây hạng mục" "$R" '"cayHangMuc"'
TRONGSO=$(echo "$R" | grep -o '"trongSo":[0-9]*' | grep -o '[0-9]*' | tr '\n' ' ')
kiem "Tự chia đều trọng số thành 33/33/34" "$TRONGSO" "33 33 34"

HM_ID=$(echo "$R" | sed -n 's/.*"cayHangMuc":\[{"id":"\([^"]*\)".*/\1/p')

R=$(curl -s -X POST "$API/hang-muc" -H 'Content-Type: application/json' \
  -d "{\"congViecId\":\"$CV_ID\",\"ten\":\"Hạng mục con\",\"hangMucChaId\":\"$HM_ID\"}")
kiem "Tạo hạng mục con (cấp 2)" "$R" '"thanhCong":true'
HM_CON_ID=$(echo "$R" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

R=$(curl -s -X POST "$API/hang-muc" -H 'Content-Type: application/json' \
  -d "{\"congViecId\":\"$CV_ID\",\"ten\":\"Trọng số 0\",\"trongSo\":0}")
kiem "CHẶN trọng số 0 (chốt chia 0)" "$R" 'Trọng số phải từ 1'

echo
echo "── 4. TIẾN ĐỘ LAN NGƯỢC LÊN ────────────────────"
R=$(curl -s -X PATCH "$API/hang-muc/$HM_CON_ID/tien-do" -H 'Content-Type: application/json' \
  -d '{"daHoanThanh":true}')
kiem "Tick hoàn thành hạng mục con" "$R" '"daHoanThanh":true'

R=$(curl -s "$API/cong-viec/$CV_ID")
CHA_PT=$(echo "$R" | python3 -c "import sys,json; d=json.load(sys.stdin)['duLieu']; print(d['cayHangMuc'][0]['phanTramHoanThanh'])" 2>/dev/null)
kiem "% cha thành 100 (con duy nhất đã xong)" "$CHA_PT" "100"
CV_PT=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['duLieu']['phanTramHoanThanh'])" 2>/dev/null)
kiem "% công việc = 33 (33 của 100)" "$CV_PT" "33"

echo
echo "── 5. CHẶN VÒNG LẶP CÂY ────────────────────────"
R=$(curl -s -X POST "$API/hang-muc/sap-xep-lai" -H 'Content-Type: application/json' \
  -d "[{\"id\":\"$HM_ID\",\"thuTu\":0,\"hangMucChaId\":\"$HM_CON_ID\"}]")
kiem "Chặn đặt cha vào trong con của nó" "$R" 'con của chính nó'

R=$(curl -s -X POST "$API/hang-muc/sap-xep-lai" -H 'Content-Type: application/json' \
  -d "[{\"id\":\"$HM_ID\",\"thuTu\":0,\"hangMucChaId\":\"$HM_ID\"}]")
kiem "Chặn đặt làm con của chính nó" "$R" 'chính nó'

echo
echo "── 6. TỆP ĐÍNH KÈM ─────────────────────────────"
echo "Nội dung thử nghiệm" > /tmp/tai-liệu-thử.txt
R=$(curl -s -X POST "$API/tep/hang-muc/$HM_CON_ID" -F "tep=@/tmp/tai-liệu-thử.txt")
kiem "Tải lên tệp tên tiếng Việt có dấu" "$R" '"thanhCong":true'
kiem "Giữ nguyên tên gốc có dấu" "$R" 'tai-liệu-thử.txt'
TEP_ID=$(echo "$R" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

R=$(curl -s "$API/tep/$TEP_ID/tai-ve")
kiem "Tải về đúng nội dung" "$R" 'Nội dung thử nghiệm'

echo
echo "── 7. ĐẾM ẢNH HƯỞNG KHI XÓA ────────────────────"
R=$(curl -s "$API/cong-viec/$CV_ID/anh-huong-khi-xoa")
kiem "Đếm số hạng mục sẽ mất" "$R" '"soHangMuc"'
kiem "Đếm số tệp sẽ mất" "$R" '"soTepDinhKem":1'

echo
echo "── 8. LỖI & 404 ────────────────────────────────"
R=$(curl -s "$API/hang-muc/khong-ton-tai-abc")
kiem "404 tiếng Việt" "$R" 'Không tìm thấy hạng mục'

R=$(curl -s "$API/duong-dan-la")
kiem "404 route không tồn tại" "$R" 'Không tìm thấy đường dẫn'

echo
echo "── DỌN DẸP ─────────────────────────────────────"
curl -s -X DELETE "$API/cong-viec/$CV_ID" > /dev/null
curl -s -X DELETE "$API/nhan-su/$NS_ID" > /dev/null
rm -f /tmp/tai-liệu-thử.txt
echo "  đã xóa dữ liệu kiểm thử"

echo
echo "════════════════════════════════════════════════"
echo "  KẾT QUẢ:  ✅ $PASS đạt   ❌ $FAIL hỏng"
echo "════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ]
