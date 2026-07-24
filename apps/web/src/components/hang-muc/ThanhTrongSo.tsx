import { AlertTriangle, Check, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { chiaDeuTrongSo, tinhTongTrongSo, type HangMucDTO } from '@ceo/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCapNhatTrongSo } from '@/hooks/use-hang-muc';

interface Props {
  anhEm: HangMucDTO[];
  congViecId: string;
}

/**
 * Thanh hiển thị tổng trọng số của một nhóm anh em.
 *
 * Nguyên tắc: CẢNH BÁO NHƯNG KHÔNG CHẶN. Tổng lệch 100 vẫn lưu được và phần
 * trăm vẫn tính đúng tỷ lệ (công thức chia cho tổng thực tế). Người dùng tự
 * chịu trách nhiệm con số của mình — chặn cứng chỉ làm họ bực khi đang nhập dở.
 */
export function ThanhTrongSo({ anhEm, congViecId }: Props) {
  const capNhatTrongSo = useCapNhatTrongSo(congViecId);

  // Một mình một nhóm thì trọng số vô nghĩa, không cần hiện
  if (anhEm.length < 2) return null;

  const tong = tinhTongTrongSo(anhEm);
  const dungChuan = tong === 100;
  const lech = tong - 100;

  const chiaDeu = async () => {
    const moi = chiaDeuTrongSo(anhEm.length);
    try {
      await capNhatTrongSo.mutateAsync(
        anhEm.map((hm, i) => ({ id: hm.id, trongSo: moi[i] ?? 1 })),
      );
      toast.success('Đã chia đều trọng số');
    } catch {
      toast.error('Không chia đều được trọng số');
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs',
        dungChuan
          ? 'border-slate-200 bg-slate-50 text-muted-foreground'
          : 'border-amber-200 bg-amber-50 text-amber-800',
      )}
    >
      <Scale className="size-3.5 shrink-0 opacity-60" aria-hidden />

      <span className="font-medium">Tổng trọng số: {tong}%</span>

      {dungChuan ? (
        <Check className="size-3.5 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <span className="flex items-center gap-1 font-medium">
          <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          {lech > 0 ? `thừa ${lech}%` : `thiếu ${-lech}%`}
        </span>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => void chiaDeu()}
        disabled={capNhatTrongSo.isPending}
        className="ml-auto h-6 px-2 text-xs"
      >
        {capNhatTrongSo.isPending ? 'Đang chia…' : 'Chia đều'}
      </Button>
    </div>
  );
}
