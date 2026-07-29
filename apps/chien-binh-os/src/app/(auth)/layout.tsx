export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cb-bg text-cb-ink relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/*
        Nền "mặt bàn tác chiến": lưới toạ độ mờ + một vệt sáng crimson từ trên
        xuống. Cả hai đều rất nhạt và aria-hidden — chỉ để khoảng trống quanh
        form trông có chủ ý, không được cạnh tranh với ô nhập.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--cb-ink) 1px, transparent 1px), linear-gradient(to bottom, var(--cb-ink) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 aspect-square w-[42rem] max-w-[130vw] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--cb-crimson) 22%, transparent) 0%, transparent 62%)",
        }}
      />
      {/* Tối dần về đáy để lưới không kéo mắt xuống khỏi form. */}
      <div
        aria-hidden
        className="from-cb-bg pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t to-transparent"
      />

      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
