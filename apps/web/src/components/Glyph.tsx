import {
  LayoutDashboard,
  ArrowUpRight,
  Users,
  FileText,
  Workflow,
  ChartNoAxesCombined,
  Plug,
  UsersRound,
  CreditCard,
  Settings,
  Target,
  Check,
  Sparkles,
} from "lucide-react";
const glyphs: Record<string, typeof LayoutDashboard> = {
  "◫": LayoutDashboard,
  "↗": ArrowUpRight,
  "♧": Users,
  "▤": FileText,
  "⌘": Workflow,
  "▥": ChartNoAxesCombined,
  "⊞": Plug,
  "♙": UsersRound,
  "▱": CreditCard,
  "⚙": Settings,
  "◎": Target,
  "✓": Check,
  "✧": Sparkles,
};
export default function Glyph({ name }: { name: string }) {
  const Icon = glyphs[name] || Sparkles;
  return <Icon size={18} strokeWidth={1.7} aria-hidden="true" />;
}
