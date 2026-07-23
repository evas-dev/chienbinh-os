import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tinhSoNgayConLai, xepMucCanhBao, dinhDangNgayVN, ngayLichVN } from './ngay-thang.js';

/**
 * Quy tắc nghiệp vụ: NGÀY VIỆT NAM — CỨ QUA NỬA ĐÊM LÀ NGÀY MỚI.
 * So sánh theo ngày lịch ở Asia/Ho_Chi_Minh, hoàn toàn bỏ qua giờ phút.
 *
 * Việt Nam là UTC+7 (không có giờ mùa hè), nên 00:00 giờ VN = 17:00 UTC hôm trước.
 */

/** Tạo Date từ giờ Việt Nam cho dễ đọc test. */
function gioVN(chuoi: string): Date {
  return new Date(`${chuoi}+07:00`);
}

describe('ngayLichVN', () => {
  it('trả về ngày lịch theo giờ VN, không theo giờ máy chủ', () => {
    // 2026-07-23 23:59 giờ VN = 16:59 UTC cùng ngày
    assert.equal(ngayLichVN(gioVN('2026-07-23T23:59:00')), '2026-07-23');
  });

  it('sau nửa đêm giờ VN là đã sang ngày mới', () => {
    assert.equal(ngayLichVN(gioVN('2026-07-24T00:01:00')), '2026-07-24');
  });

  it('mốc 17:00 UTC là nửa đêm giờ VN → đã sang ngày hôm sau', () => {
    assert.equal(ngayLichVN(new Date('2026-07-23T17:00:00Z')), '2026-07-24');
    assert.equal(ngayLichVN(new Date('2026-07-23T16:59:00Z')), '2026-07-23');
  });
});

describe('tinhSoNgayConLai', () => {
  const bayGio = gioVN('2026-07-23T10:00:00');

  it('hạn cuối ngày hôm nay → còn 0 ngày', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2026-07-23T23:59:00'), bayGio), 0);
  });

  it('hạn đầu ngày hôm nay → vẫn là còn 0 ngày (bỏ qua giờ)', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2026-07-23T00:01:00'), bayGio), 0);
  });

  it('hạn 00:01 ngày mai → còn 1 ngày', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2026-07-24T00:01:00'), bayGio), 1);
  });

  it('hạn 23:59 hôm qua → quá hạn 1 ngày', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2026-07-22T23:59:00'), bayGio), -1);
  });

  it('hạn tuần sau → còn 7 ngày', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2026-07-30T08:00:00'), bayGio), 7);
  });

  it('vắt qua ranh giới tháng vẫn đúng', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2026-08-02T09:00:00'), gioVN('2026-07-30T09:00:00')), 3);
  });

  it('vắt qua ranh giới năm vẫn đúng', () => {
    assert.equal(tinhSoNgayConLai(gioVN('2027-01-01T09:00:00'), gioVN('2026-12-30T09:00:00')), 2);
  });

  it('KẾT QUẢ KHÔNG PHỤ THUỘC MÚI GIỜ MÁY CHỦ (quan trọng khi lên VPS chạy UTC)', () => {
    // Cùng một thời điểm tuyệt đối, viết theo hai cách khác nhau
    const hanTheoVN = gioVN('2026-07-25T08:00:00');
    const hanTheoUTC = new Date('2026-07-25T01:00:00Z'); // = 08:00 giờ VN
    assert.equal(hanTheoVN.getTime(), hanTheoUTC.getTime());
    assert.equal(tinhSoNgayConLai(hanTheoVN, bayGio), tinhSoNgayConLai(hanTheoUTC, bayGio));
  });

  it('bẫy múi giờ: 22:00 UTC ngày 23 thực chất đã là 05:00 ngày 24 giờ VN', () => {
    const bayGioUTC = new Date('2026-07-23T22:00:00Z'); // = 2026-07-24 05:00 VN
    // Hạn là hết ngày 24 giờ VN → vẫn là hôm nay theo giờ VN → còn 0 ngày
    assert.equal(tinhSoNgayConLai(gioVN('2026-07-24T20:00:00'), bayGioUTC), 0);
  });
});

describe('xepMucCanhBao', () => {
  it('đã hoàn thành thì luôn BINH_THUONG, kể cả khi quá hạn', () => {
    assert.equal(xepMucCanhBao(-10, 3, true), 'BINH_THUONG');
  });

  it('quá hạn và chưa xong → QUA_HAN', () => {
    assert.equal(xepMucCanhBao(-1, 3, false), 'QUA_HAN');
  });

  it('đến hạn hôm nay → HOM_NAY', () => {
    assert.equal(xepMucCanhBao(0, 3, false), 'HOM_NAY');
  });

  it('trong ngưỡng cảnh báo → SAP_TOI', () => {
    assert.equal(xepMucCanhBao(1, 3, false), 'SAP_TOI');
    assert.equal(xepMucCanhBao(3, 3, false), 'SAP_TOI');
  });

  it('ngoài ngưỡng → BINH_THUONG', () => {
    assert.equal(xepMucCanhBao(4, 3, false), 'BINH_THUONG');
  });

  it('đổi ngưỡng sang 7 ngày thì phân loại đổi theo', () => {
    assert.equal(xepMucCanhBao(5, 3, false), 'BINH_THUONG');
    assert.equal(xepMucCanhBao(5, 7, false), 'SAP_TOI');
  });
});

describe('dinhDangNgayVN', () => {
  it('định dạng dd/mm/yyyy theo giờ Việt Nam', () => {
    assert.equal(dinhDangNgayVN(gioVN('2026-07-23T10:00:00')), '23/07/2026');
  });

  it('23:59 giờ VN vẫn là ngày hôm đó, không nhảy sang hôm sau', () => {
    assert.equal(dinhDangNgayVN(gioVN('2026-07-23T23:59:00')), '23/07/2026');
  });
});
