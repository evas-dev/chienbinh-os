import {
  Swords,
  Plus,
  Award,
  Trophy,
  CheckCircle2,
  Shield,
  Target,
  Scale,
  Handshake,
  AlertTriangle,
  BarChart3,
  Wallet,
  Compass,
  User,
  XCircle,
  Medal,
  Megaphone,
  FileText,
  BookOpen,
  ClipboardList,
  TrendingUp,
  Lightbulb,
  Zap,
  Receipt,
  Siren,
  Link as LinkIcon,
  Bell,
  RefreshCw,
  Repeat,
  Smartphone,
  Mail,
  Book,
  Ruler,
  Pin,
  Briefcase,
  Crown,
  Gift,
  Palmtree,
  Check,
  Settings,
  FolderOpen,
  Sparkles,
  Hourglass,
  Library,
  GraduationCap,
  Umbrella,
  Bomb,
  Star,
  Radar,
  Flame,
  Crosshair,
  Sword,
  Rocket,
  Send,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Map 1-1 các emoji đang dùng trong giao diện sang icon SVG (lucide-react) tương ứng.
const EMOJI_TO_ICON: Record<string, LucideIcon> = {
  "⚔": Swords,
  "➕": Plus,
  "🎖": Award,
  "🏆": Trophy,
  "✅": CheckCircle2,
  "🛡": Shield,
  "🏅": Medal,
  "🎯": Target,
  "⚖": Scale,
  "🤝": Handshake,
  "⚠": AlertTriangle,
  "📊": BarChart3,
  "💰": Wallet,
  "🧭": Compass,
  "👤": User,
  "❌": XCircle,
  "🥇": Medal,
  "🥈": Medal,
  "🥉": Medal,
  "🗂": FolderOpen,
  "📣": Megaphone,
  "📝": FileText,
  "📖": BookOpen,
  "📕": Book,
  "📋": ClipboardList,
  "📈": TrendingUp,
  "💡": Lightbulb,
  "⚡": Zap,
  "🧾": Receipt,
  "🚨": Siren,
  "🔗": LinkIcon,
  "🔔": Bell,
  "🔄": RefreshCw,
  "🔁": Repeat,
  "📱": Smartphone,
  "📨": Mail,
  "📏": Ruler,
  "📌": Pin,
  "💼": Briefcase,
  "👑": Crown,
  "🎁": Gift,
  "🌴": Palmtree,
  "✔": Check,
  "⚙": Settings,
  "🆕": Sparkles,
  "⏳": Hourglass,
  "🏖": Umbrella,
  "📚": Library,
  "🎓": GraduationCap,
  "💣": Bomb,
  "💥": Star,
  "📡": Radar,
  "🔥": Flame,
  "🔫": Crosshair,
  "🗡": Sword,
  "🚀": Rocket,
  "📤": Send,
  "↩": Undo2,
};

// Màu riêng cho huy chương hạng 1/2/3 trên bảng xếp hạng — thay cho 🥇🥈🥉.
const MEDAL_COLOR: Record<string, string> = {
  "🥇": "text-yellow-400",
  "🥈": "text-gray-400",
  "🥉": "text-amber-600",
};

// Thay mọi emoji hardcode trong giao diện cũ bằng icon SVG tương ứng.
// Glyph không có trong bảng map (vd icon nhập tự do) sẽ fallback về render text gốc.
export function EmojiIcon({
  glyph,
  className,
}: {
  glyph: string | null | undefined;
  className?: string;
}) {
  if (!glyph) return null;
  // Bỏ ký tự biến thể U+FE0F trước khi tra bảng: "⚔️" và "⚔" là cùng một biểu
  // tượng nhưng khác chuỗi, trước đây phải khai báo cả hai và cứ quên một cái
  // là glyph đó rơi xuống nhánh hiển thị emoji thật.
  const trimmed = glyph.trim().replace(/\uFE0F/g, "");
  const Icon = EMOJI_TO_ICON[trimmed];
  if (!Icon) return <span className={className}>{glyph}</span>;
  const medalColor = MEDAL_COLOR[trimmed];
  return <Icon className={cn("inline-block size-4 shrink-0", medalColor, className)} aria-hidden />;
}
