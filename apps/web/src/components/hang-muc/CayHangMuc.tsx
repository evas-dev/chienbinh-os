import { memo } from 'react';
import type { HangMucDTO } from '@ceo/shared';
import { NodeHangMuc } from './NodeHangMuc';
import { ThanhTrongSo } from './ThanhTrongSo';

interface Props {
  danhSach: HangMucDTO[];
  congViecId: string;
  nguongVang: number;
  capDo?: number;
  onMoChiTiet: (id: string) => void;
  onThemCon: (chaId: string) => void;
  onXoa: (hangMuc: HangMucDTO) => void;
}

const THUT_LE_MOI_CAP = 28;

/**
 * Cây hạng mục, vẽ đệ quy.
 *
 * Cây chỉ sâu 2–3 cấp nên MỞ HẾT MẶC ĐỊNH, không làm nút gập — thêm thao tác
 * gập/mở chỉ tổ khiến người dùng phải bấm thêm mới thấy được thứ họ cần thấy.
 *
 * Mỗi cấp có một đường kẻ dọc mờ bên trái để mắt lần theo quan hệ cha–con.
 */
export const CayHangMuc = memo(function CayHangMuc({
  danhSach,
  congViecId,
  nguongVang,
  capDo = 0,
  onMoChiTiet,
  onThemCon,
  onXoa,
}: Props) {
  if (danhSach.length === 0) return null;

  return (
    <div
      className={capDo > 0 ? 'border-l border-dashed border-slate-200' : undefined}
      style={capDo > 0 ? { marginLeft: THUT_LE_MOI_CAP, paddingLeft: 12 } : undefined}
    >
      <div className="space-y-1.5">
        <ThanhTrongSo anhEm={danhSach} congViecId={congViecId} />

        {danhSach.map((hm) => (
          <div key={hm.id} className="space-y-1.5">
            <NodeHangMuc
              hangMuc={hm}
              congViecId={congViecId}
              nguongVang={nguongVang}
              onMoChiTiet={onMoChiTiet}
              onThemCon={onThemCon}
              onXoa={onXoa}
            />

            {/* Đệ quy xuống các hạng mục con */}
            <CayHangMuc
              danhSach={hm.hangMucCon}
              congViecId={congViecId}
              nguongVang={nguongVang}
              capDo={capDo + 1}
              onMoChiTiet={onMoChiTiet}
              onThemCon={onThemCon}
              onXoa={onXoa}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
