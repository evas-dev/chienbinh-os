import { useRef, useState } from 'react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api, LoiApi } from '@/lib/api-client';
import { khoa } from '@/lib/query-client';

interface TepDTO {
  id: string;
  tenGoc: string;
  kichThuoc: number;
  loaiMime: string;
  taiLenLuc: string;
}

function doDaiDeDoc(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(0)} KB`;
  return `${(byte / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Danh sách tệp đính kèm của một hạng mục — chính là "checklist tài liệu"
 * trong yêu cầu nghiệp vụ. Hỗ trợ kéo thả để tải lên.
 */
export function KhungTepDinhKem({ hangMucId }: { hangMucId: string }) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dangKeoVao, setDangKeoVao] = useState(false);

  const { data: danhSach = [], isLoading } = useQuery({
    queryKey: khoa.tepDinhKem(hangMucId),
    queryFn: () => api.get<TepDTO[]>(`/tep/hang-muc/${hangMucId}`),
  });

  const taiLen = useMutation({
    mutationFn: (tep: File) => {
      const form = new FormData();
      form.append('tep', tep);
      return api.taiLen<TepDTO>(`/tep/hang-muc/${hangMucId}`, form);
    },
    onSuccess: (t) => {
      toast.success(`Đã tải lên ${t.tenGoc}`);
      void qc.invalidateQueries({ queryKey: khoa.tepDinhKem(hangMucId) });
      void qc.invalidateQueries({ queryKey: ['cong-viec'] });
    },
    onError: (loi) =>
      toast.error(loi instanceof LoiApi ? loi.message : 'Không tải lên được tệp'),
  });

  const xoaTep = useMutation({
    mutationFn: (id: string) => api.delete(`/tep/${id}`),
    onSuccess: () => {
      toast.success('Đã xóa tệp');
      void qc.invalidateQueries({ queryKey: khoa.tepDinhKem(hangMucId) });
      void qc.invalidateQueries({ queryKey: ['cong-viec'] });
    },
  });

  const xuLyTep = (ds: FileList | null) => {
    if (!ds) return;
    for (const tep of Array.from(ds)) taiLen.mutate(tep);
  };

  return (
    <div className="space-y-3">
      {/* Vùng kéo thả */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDangKeoVao(true);
        }}
        onDragLeave={() => setDangKeoVao(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDangKeoVao(false);
          xuLyTep(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors',
          dangKeoVao ? 'border-primary bg-primary/5' : 'border-slate-300',
        )}
      >
        <Upload className="mb-2 size-5 text-muted-foreground/60" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Kéo tệp vào đây hoặc{' '}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            chọn từ máy
          </button>
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">Tối đa 25MB mỗi tệp</p>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            xuLyTep(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {taiLen.isPending && (
        <p className="text-sm text-muted-foreground" role="status">
          Đang tải lên…
        </p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Đang tải danh sách tệp…</p>
      ) : danhSach.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">Chưa có tệp nào</p>
      ) : (
        <ul className="space-y-1.5">
          {danhSach.map((tep) => (
            <li
              key={tep.id}
              className="group flex items-center gap-2.5 rounded-md border px-2.5 py-2"
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{tep.tenGoc}</div>
                <div className="text-xs text-muted-foreground">
                  {doDaiDeDoc(tep.kichThuoc)}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                asChild
                aria-label={`Tải về ${tep.tenGoc}`}
              >
                <a href={`/api/tep/${tep.id}/tai-ve`} download>
                  <Download className="size-3.5" aria-hidden />
                </a>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-red-600"
                onClick={() => xoaTep.mutate(tep.id)}
                disabled={xoaTep.isPending}
                aria-label={`Xóa ${tep.tenGoc}`}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
