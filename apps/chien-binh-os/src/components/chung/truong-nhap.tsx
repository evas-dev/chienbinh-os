import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Một trường trong form: nhãn + control.
 *
 * Thay cho pattern `<div className="space-y-1.5"><Label/>…</div>` bị lặp 32 lần
 * ở 8 modal — mỗi nơi tự đặt khoảng cách nên form nhìn díu và không đồng đều.
 *
 * `mt-auto` ở control để khi hai trường nằm cạnh nhau trong grid mà một nhãn
 * dài phải xuống 2 dòng thì hai ô nhập vẫn thẳng hàng nhau, thay vì ô của cột
 * nhãn dài bị tụt xuống. Grid mặc định đã stretch các ô cùng hàng nên KHÔNG
 * cần `h-full` — thêm vào sẽ khiến trường phình ra khi cha bị kéo giãn.
 */
export function TruongNhap({
  nhan,
  moTa,
  htmlFor,
  className,
  children,
}: {
  nhan: React.ReactNode;
  /** Dòng gợi ý nhỏ dưới nhãn, cho quy tắc nhập mà nhãn không nói hết. */
  moTa?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="space-y-1">
        <Label htmlFor={htmlFor}>{nhan}</Label>
        {moTa ? <p className="text-cb-ink-faint text-xs leading-snug">{moTa}</p> : null}
      </div>
      <div className="mt-auto">{children}</div>
    </div>
  );
}

/** Bọc các TruongNhap trong một modal — canh khoảng cách giữa các trường. */
export function NhomTruong({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}
