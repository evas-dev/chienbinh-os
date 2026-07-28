export function ThanhTienDo({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="bg-cb-panel-2 h-2 overflow-hidden rounded-full"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="bg-cb-gold h-full rounded-full transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}
