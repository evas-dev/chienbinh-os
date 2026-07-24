import { useState } from 'react';
import { toast } from 'sonner';
import type { HangMucDTO } from '@ceo/shared';
import { useCapNhatHangMuc, useCapNhatTienDo } from './use-hang-muc';

/**
 * Gom logic thao tác của một dòng hạng mục (tick, sửa %, sửa trọng số) ra khỏi
 * phần render, để component NodeHangMuc chỉ còn lo hiển thị.
 *
 * Nguyên tắc chung: chỉ gọi API khi RỜI Ô hoặc bấm Enter, không gọi theo từng
 * ký tự gõ. Lỗi thì hoàn ô về giá trị cũ và báo toast.
 */
export function useThaoTacNode(hangMuc: HangMucDTO, congViecId: string) {
  const capNhatTienDo = useCapNhatTienDo(congViecId);
  const capNhatHangMuc = useCapNhatHangMuc(congViecId);

  const [trongSoNhap, setTrongSoNhap] = useState(String(hangMuc.trongSo));
  const [phanTramNhap, setPhanTramNhap] = useState(String(hangMuc.phanTramHoanThanh));

  const doiTick = async (tick: boolean) => {
    try {
      await capNhatTienDo.mutateAsync({ id: hangMuc.id, duLieu: { daHoanThanh: tick } });
    } catch {
      toast.error('Không cập nhật được tiến độ');
    }
  };

  const luuPhanTram = async () => {
    const so = Number.parseInt(phanTramNhap, 10);
    if (Number.isNaN(so) || so === hangMuc.phanTramHoanThanh) {
      setPhanTramNhap(String(hangMuc.phanTramHoanThanh));
      return;
    }
    try {
      await capNhatTienDo.mutateAsync({
        id: hangMuc.id,
        duLieu: { phanTram: Math.min(100, Math.max(0, so)) },
      });
    } catch {
      toast.error('Không cập nhật được tiến độ');
      setPhanTramNhap(String(hangMuc.phanTramHoanThanh));
    }
  };

  const luuTrongSo = async () => {
    const so = Number.parseInt(trongSoNhap, 10);
    if (Number.isNaN(so) || so === hangMuc.trongSo) {
      setTrongSoNhap(String(hangMuc.trongSo));
      return;
    }
    try {
      await capNhatHangMuc.mutateAsync({ id: hangMuc.id, duLieu: { trongSo: Math.max(1, so) } });
    } catch {
      toast.error('Không cập nhật được trọng số');
      setTrongSoNhap(String(hangMuc.trongSo));
    }
  };

  return {
    trongSoNhap,
    setTrongSoNhap,
    phanTramNhap,
    setPhanTramNhap,
    doiTick,
    luuPhanTram,
    luuTrongSo,
    dangCapNhatTienDo: capNhatTienDo.isPending,
  };
}
