import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { tinhPhanTramCha, chiaDeuTrongSo, TRONG_SO_TOI_THIEU } from './tien-do.js';

/**
 * Công thức trọng số WBS:  %cha = Σ(trongSo × %) / Σ(trongSo)
 *
 * Chia cho TỔNG TRỌNG SỐ THỰC TẾ, không chia cứng 100 — nhờ vậy tổng 95 hay
 * 110 vẫn cho ra đúng tỷ lệ.
 *
 * Phép chia 0 bị khử BẰNG CẤU TRÚC chứ không bằng câu lệnh if:
 * trọng số tối thiểu là 1 (chốt ở DB default, Zod min, và chiaDeuTrongSo),
 * nên Σ trọng số luôn ≥ số con ≥ 1 khi mảng không rỗng.
 */

describe('tinhPhanTramCha', () => {
  it('ví dụ nghiệp vụ: Móng 30/100%, Thân 50/40%, Hoàn thiện 20/0% → 50%', () => {
    const ketQua = tinhPhanTramCha([
      { trongSo: 30, phanTram: 100 },
      { trongSo: 50, phanTram: 40 },
      { trongSo: 20, phanTram: 0 },
    ]);
    assert.equal(ketQua, 50);
  });

  it('tổng trọng số 95 (thiếu 5) vẫn ra đúng tỷ lệ', () => {
    // 30*100 + 45*100 + 20*0 = 7500 ; 7500/95 = 78.9 → 79
    assert.equal(
      tinhPhanTramCha([
        { trongSo: 30, phanTram: 100 },
        { trongSo: 45, phanTram: 100 },
        { trongSo: 20, phanTram: 0 },
      ]),
      79,
    );
  });

  it('tổng trọng số 110 (thừa 10) vẫn ra đúng tỷ lệ', () => {
    assert.equal(
      tinhPhanTramCha([
        { trongSo: 55, phanTram: 100 },
        { trongSo: 55, phanTram: 0 },
      ]),
      50,
    );
  });

  it('chỉ một con → phần trăm cha bằng phần trăm con đó', () => {
    assert.equal(tinhPhanTramCha([{ trongSo: 1, phanTram: 37 }]), 37);
    assert.equal(tinhPhanTramCha([{ trongSo: 999, phanTram: 37 }]), 37);
  });

  it('mọi con đều 100% → cha 100%', () => {
    assert.equal(
      tinhPhanTramCha([
        { trongSo: 1, phanTram: 100 },
        { trongSo: 99, phanTram: 100 },
      ]),
      100,
    );
  });

  it('mọi con đều 0% → cha 0%', () => {
    assert.equal(
      tinhPhanTramCha([
        { trongSo: 40, phanTram: 0 },
        { trongSo: 60, phanTram: 0 },
      ]),
      0,
    );
  });

  it('trọng số bằng nhau thì suy biến về trung bình cộng', () => {
    assert.equal(
      tinhPhanTramCha([
        { trongSo: 1, phanTram: 0 },
        { trongSo: 1, phanTram: 50 },
        { trongSo: 1, phanTram: 100 },
      ]),
      50,
    );
  });

  it('200 con trọng số đều bằng 1 → trung bình cộng, không tràn không lỗi', () => {
    const cacCon = Array.from({ length: 200 }, (_, i) => ({
      trongSo: 1,
      phanTram: i < 100 ? 100 : 0,
    }));
    assert.equal(tinhPhanTramCha(cacCon), 50);
  });

  it('mảng rỗng trả về 0 và KHÔNG chia cho 0 (nhánh này lẽ ra không bao giờ chạm tới)', () => {
    const ketQua = tinhPhanTramCha([]);
    assert.equal(ketQua, 0);
    assert.ok(Number.isFinite(ketQua), 'không được là NaN hay Infinity');
  });

  it('phòng thủ: dữ liệu hỏng có trọng số 0 vẫn không sinh ra NaN', () => {
    // Trọng số 0 lẽ ra bị Zod chặn từ tầng API, nhưng nếu dữ liệu cũ trong DB
    // lọt vào thì hàm vẫn phải trả số hữu hạn chứ không được NaN.
    const ketQua = tinhPhanTramCha([
      { trongSo: 0, phanTram: 100 },
      { trongSo: 0, phanTram: 0 },
    ]);
    assert.ok(Number.isFinite(ketQua), `phải là số hữu hạn, nhận được ${ketQua}`);
  });

  it('kết quả luôn là số nguyên trong khoảng 0..100', () => {
    const ketQua = tinhPhanTramCha([
      { trongSo: 7, phanTram: 33 },
      { trongSo: 13, phanTram: 66 },
      { trongSo: 3, phanTram: 99 },
    ]);
    assert.ok(Number.isInteger(ketQua));
    assert.ok(ketQua >= 0 && ketQua <= 100);
  });
});

describe('chiaDeuTrongSo', () => {
  it('3 con → [33, 33, 34], cộng lại đúng 100', () => {
    const ketQua = chiaDeuTrongSo(3);
    assert.deepEqual(ketQua, [33, 33, 34]);
    assert.equal(
      ketQua.reduce((a, b) => a + b, 0),
      100,
    );
  });

  it('1 con → [100]', () => {
    assert.deepEqual(chiaDeuTrongSo(1), [100]);
  });

  it('4 con → [25, 25, 25, 25]', () => {
    assert.deepEqual(chiaDeuTrongSo(4), [25, 25, 25, 25]);
  });

  it('7 con → cộng lại vẫn đúng 100', () => {
    assert.equal(
      chiaDeuTrongSo(7).reduce((a, b) => a + b, 0),
      100,
    );
  });

  it('KHÔNG BAO GIỜ sinh ra trọng số 0, kể cả khi có 200 con', () => {
    const ketQua = chiaDeuTrongSo(200);
    assert.equal(ketQua.length, 200);
    assert.ok(
      ketQua.every((t) => t >= TRONG_SO_TOI_THIEU),
      'mọi trọng số phải ≥ 1',
    );
    // Vượt 100 con thì tổng khác 100 — và vẫn đúng, vì công thức chia cho tổng thực tế
    assert.equal(
      ketQua.reduce((a, b) => a + b, 0),
      200,
    );
  });

  it('mọi số lượng từ 1 đến 150 đều không sinh trọng số 0', () => {
    for (let n = 1; n <= 150; n++) {
      assert.ok(
        chiaDeuTrongSo(n).every((t) => t >= TRONG_SO_TOI_THIEU),
        `thất bại với n=${n}`,
      );
    }
  });

  it('số lượng ≤ 100 thì tổng luôn đúng 100', () => {
    for (let n = 1; n <= 100; n++) {
      const tong = chiaDeuTrongSo(n).reduce((a, b) => a + b, 0);
      assert.equal(tong, 100, `n=${n} cho tổng ${tong}`);
    }
  });

  it('0 hoặc số âm trả về mảng rỗng', () => {
    assert.deepEqual(chiaDeuTrongSo(0), []);
    assert.deepEqual(chiaDeuTrongSo(-3), []);
  });
});
