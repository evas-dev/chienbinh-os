"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Nền mờ đậm hơn (10% -> 65%): modal kiểu game là một khối nổi hẳn lên,
        // nền sau phải chìm xuống thì viền tối của modal mới tách ra được.
        "fixed inset-0 isolate z-50 bg-black/65 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Nới p-4 -> p-5/sm:p-6 và gap-4 -> gap-5: modal nhiều trường (tạo tài
          // khoản có 6 trường) trước đây nhìn rất díu, nhãn gần như dính vào ô
          // nhập của trường phía trên. Nếu đổi padding ở đây thì phải đổi cả
          // margin âm của DialogFooter bên dưới cho khớp.
          // KHÔNG đặt grid-rows cố định ở đây: hàng giữa thành 1fr sẽ kéo giãn
          // phần thân, làm trường đầu tiên phình ra chiếm hết chỗ và đè lên
          // footer. Để grid tự chia theo nội dung.
          // Viền tối dày + khối bóng cứng bên dưới, cùng ngữ pháp với nút và thẻ.
          "fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 content-start gap-5 overflow-y-auto rounded-2xl border-[3px] border-black/75 bg-popover p-5 text-sm text-popover-foreground shadow-[0_6px_0_0_rgb(0_0_0/0.55),0_24px_48px_-12px_rgb(0_0_0/0.9)] duration-100 outline-none sm:max-w-md sm:p-6 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            {/* Nút đóng đỏ như mẫu, nhưng nằm TRONG dải tiêu đề chứ không nhô
                ra ngoài góc: thân modal có `overflow-y-auto` (biểu mẫu dài phải
                cuộn được), phần nhô ra khỏi khung sẽ bị cắt mất. */}
            <Button
              variant="destructive"
              className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">Đóng</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        // Dải tiêu đề chạy hết bề ngang modal — margin âm phải khớp padding của
        // DialogContent (p-5 / sm:p-6), giống cách DialogFooter đang làm.
        // Chừa lề phải cho nút đóng đỏ khỏi đè lên tiêu đề dài.
        "-mx-5 -mt-5 flex flex-col gap-1 rounded-t-xl border-b-2 border-black/50 bg-cb-bg-2 py-3.5 pr-14 pl-5 sm:-mx-6 sm:-mt-6 sm:pr-16 sm:pl-6",
        className,
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // Margin âm phải khớp padding của DialogContent (p-5 / sm:p-6) để dải
        // footer chạm sát mép modal.
        "-mx-5 -mb-5 flex flex-col-reverse gap-2 rounded-b-xl border-t-2 border-black/50 bg-cb-bg-2 p-5 sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:p-6",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-cb-gold-soft text-base leading-tight font-extrabold tracking-wide uppercase",
        className,
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
