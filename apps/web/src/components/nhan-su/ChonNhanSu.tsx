import { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDanhSachNhanSu } from '@/hooks/use-nhan-su';
import { FormTaoNhanh } from './FormTaoNhanh';

interface Props {
  giaTri: string | null;
  onChon: (id: string | null) => void;
  chieuRongDay?: boolean;
}

/**
 * Chọn nhân sự, kèm khả năng TẠO MỚI NGAY TẠI CHỖ.
 *
 * Đúng yêu cầu nghiệp vụ: khi giao việc cho người chưa có trong hệ thống thì
 * tạo luôn, không bắt người dùng rời màn hình đang làm sang trang Nhân sự rồi
 * quay lại — thao tác đó làm mất mạch suy nghĩ.
 */
export function ChonNhanSu({ giaTri, onChon, chieuRongDay }: Props) {
  const [moKhong, setMoKhong] = useState(false);
  const [tuKhoa, setTuKhoa] = useState('');
  const [dangTaoMoi, setDangTaoMoi] = useState(false);

  const { data: danhSach = [], isLoading } = useDanhSachNhanSu({ dangHoatDong: true });
  const daChon = danhSach.find((n) => n.id === giaTri);

  const dong = () => {
    setMoKhong(false);
    setTuKhoa('');
    setDangTaoMoi(false);
  };

  return (
    <Popover open={moKhong} onOpenChange={(m) => (m ? setMoKhong(true) : dong())}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={moKhong}
          className={cn('justify-between font-normal', chieuRongDay && 'w-full')}
        >
          <span className={cn('truncate', !daChon && 'text-muted-foreground')}>
            {daChon ? daChon.hoTen : 'Chưa giao ai'}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0" align="start">
        {dangTaoMoi ? (
          <FormTaoNhanh
            hoTenBanDau={tuKhoa}
            onXong={(ns) => {
              onChon(ns.id);
              dong();
            }}
            onHuy={() => setDangTaoMoi(false)}
          />
        ) : (
          <Command>
            <CommandInput
              placeholder="Tìm theo tên hoặc email…"
              value={tuKhoa}
              onValueChange={setTuKhoa}
            />
            <CommandList>
              {/* Không tìm thấy ai → mời tạo mới ngay, điền sẵn tên vừa gõ */}
              <CommandEmpty>
                <button
                  type="button"
                  onClick={() => setDangTaoMoi(true)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                >
                  <UserPlus className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">
                    Tạo nhân sự{tuKhoa ? ` “${tuKhoa}”` : ' mới'}
                  </span>
                </button>
              </CommandEmpty>

              <CommandGroup>
                {giaTri && (
                  <CommandItem
                    value="__bo-chon__"
                    onSelect={() => {
                      onChon(null);
                      dong();
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="size-4" aria-hidden />
                    Bỏ giao việc
                  </CommandItem>
                )}

                {isLoading && (
                  <div className="px-2 py-3 text-sm text-muted-foreground">Đang tải…</div>
                )}

                {danhSach.map((ns) => (
                  <CommandItem
                    key={ns.id}
                    value={`${ns.hoTen} ${ns.email}`}
                    onSelect={() => {
                      onChon(ns.id);
                      dong();
                    }}
                  >
                    <Check
                      className={cn('size-4', ns.id === giaTri ? 'opacity-100' : 'opacity-0')}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{ns.hoTen}</div>
                      <div className="truncate text-xs text-muted-foreground">{ns.email}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              {danhSach.length > 0 && (
                <div className="border-t p-1">
                  <button
                    type="button"
                    onClick={() => setDangTaoMoi(true)}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <UserPlus className="size-4 shrink-0" aria-hidden />
                    Thêm nhân sự mới
                  </button>
                </div>
              )}
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
