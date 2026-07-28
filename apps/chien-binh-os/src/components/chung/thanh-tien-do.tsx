export function ThanhTienDo({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="bg-cb-panel-2 h-1.5 overflow-hidden rounded-full">
      <div className="bg-cb-gold h-full transition-all" style={{ width: `${clamped}%` }} />
    </div>
  );
}
