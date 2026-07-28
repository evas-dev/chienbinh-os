export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-cb-bg text-cb-ink flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
