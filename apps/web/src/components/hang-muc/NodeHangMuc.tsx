import { FileText, MoreVertical, Paperclip, Plus, Trash2, User } from 'lucide-react';
import { dinhDangNgayVN, type HangMucDTO } from '@ceo/shared';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ThanhTienDo } from '@/components/chung/ThanhTienDo';
import { HuyHieuHan } from '@/components/chung/HuyHieu';
import { useThaoTacNode } from '@/hooks/use-thao-tac-node';

interface Props {
  hangMuc: HangMucDTO;
  congViecId: string;
  nguongVang: number;
  onMoChiTiet: (id: string) => void;
  onThemCon: (chaId: string) => void;
  onXoa: (hangMuc: HangMucDTO) => void;
}

/**
 * Một dòng trong cây hạng mục.
 *
 * Bố cục: [tick/%] Tên · [trọng số] · [thanh tiến độ] · [người] · [hạn] · [⋮]
 *
 * Nút CHA có phần trăm chỉ đọc (hiện ổ khóa) vì con số đó do máy chủ tính theo
 * trọng số các con. Chỉ nút LÁ mới sửa được tiến độ.
 */
export function NodeHangMuc({
  hangMuc,
  congViecId,
  nguongVang,
  onMoChiTiet,
  onThemCon,
  onXoa,
}: Props) {
  const laNutLa = hangMuc.hangMucCon.length === 0;
  const {
    trongSoNhap,
    setTrongSoNhap,
    phanTramNhap,
    setPhanTramNhap,
    doiTick,
    luuPhanTram,
    luuTrongSo,
    dangCapNhatTienDo,
  } = useThaoTacNode(hangMuc, congViecId);

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-colors',
        'hover:border-slate-300 hover:shadow-sm',
        hangMuc.daHoanThanh && 'bg-slate-50/60',
      )}
    >
      {/* Ô tick hoặc ô nhập % — chỉ nút lá mới có */}
      <div className="flex w-12 shrink-0 justify-center">
        {laNutLa ? (
          hangMuc.loaiTienDo === 'CHECKBOX' ? (
            <Checkbox
              checked={hangMuc.daHoanThanh}
              onCheckedChange={(v) => void doiTick(v === true)}
              disabled={dangCapNhatTienDo}
              aria-label={`Đánh dấu hoàn thành ${hangMuc.ten}`}
            />
          ) : (
            <Input
              value={phanTramNhap}
              onChange={(e) => setPhanTramNhap(e.target.value)}
              onBlur={() => void luuPhanTram()}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="h-7 w-12 px-1 text-center text-xs tabular-nums"
              aria-label={`Phần trăm hoàn thành ${hangMuc.ten}`}
            />
          )
        ) : (
          <span className="text-xs text-muted-foreground/40" title="Hạng mục cha">
            ⌄
          </span>
        )}
      </div>

      {/* Tên và mã */}
      <button
        type="button"
        onClick={() => onMoChiTiet(hangMuc.id)}
        className="min-w-0 flex-1 text-left"
      >
        <div
          className={cn(
            'truncate text-sm font-medium',
            hangMuc.daHoanThanh && 'text-muted-foreground line-through',
          )}
        >
          {hangMuc.ten}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{hangMuc.ma}</span>
          {hangMuc.soTepDinhKem > 0 && (
            <span className="flex items-center gap-0.5">
              <Paperclip className="size-3" aria-hidden />
              {hangMuc.soTepDinhKem}
            </span>
          )}
        </div>
      </button>

      {/* Trọng số — sửa tại chỗ, lưu khi rời ô */}
      <div className="hidden w-16 shrink-0 items-center gap-1 sm:flex">
        <Input
          value={trongSoNhap}
          onChange={(e) => setTrongSoNhap(e.target.value)}
          onBlur={() => void luuTrongSo()}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className="h-7 w-12 px-1 text-center text-xs tabular-nums"
          aria-label={`Trọng số của ${hangMuc.ten}`}
          title="Trọng số trong nhóm"
        />
      </div>

      <ThanhTienDo
        phanTram={hangMuc.phanTramHoanThanh}
        laTuTinh={!laNutLa}
        kichThuoc="nho"
        className="hidden w-32 shrink-0 md:flex"
      />

      {/* Người phụ trách */}
      <div className="hidden w-32 shrink-0 truncate text-xs md:block">
        {hangMuc.nguoiPhuTrach ? (
          <span
            className="flex items-center gap-1 text-muted-foreground"
            title={`${hangMuc.nguoiPhuTrach.email}${hangMuc.nguoiPhuTrach.soDienThoai ? ` · ${hangMuc.nguoiPhuTrach.soDienThoai}` : ''}`}
          >
            <User className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{hangMuc.nguoiPhuTrach.hoTen}</span>
          </span>
        ) : (
          <span className="text-muted-foreground/50">Chưa giao</span>
        )}
      </div>

      {/* Hạn chót + cảnh báo màu */}
      <div className="hidden w-28 shrink-0 md:block">
        {hangMuc.hanHoanThanh ? (
          <div className="space-y-0.5">
            <div className="text-xs tabular-nums text-muted-foreground">
              {dinhDangNgayVN(new Date(hangMuc.hanHoanThanh))}
            </div>
            <HuyHieuHan
              hanHoanThanh={hangMuc.hanHoanThanh}
              daHoanThanh={hangMuc.daHoanThanh}
              nguongVang={nguongVang}
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">Chưa đặt hạn</span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label={`Thao tác với ${hangMuc.ten}`}
          >
            <MoreVertical className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onMoChiTiet(hangMuc.id)}>
            <FileText className="size-4" aria-hidden />
            Xem chi tiết &amp; tệp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onThemCon(hangMuc.id)}>
            <Plus className="size-4" aria-hidden />
            Thêm hạng mục con
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onXoa(hangMuc)}>
            <Trash2 className="size-4" aria-hidden />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
