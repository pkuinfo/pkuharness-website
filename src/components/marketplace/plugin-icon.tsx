import {
  AlarmClock,
  Bell,
  BookOpen,
  Brain,
  Building2,
  Bus,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CreditCard,
  DoorOpen,
  Globe,
  KeyRound,
  LayoutDashboard,
  Library,
  ListTodo,
  type LucideIcon,
  Medal,
  MessagesSquare,
  Puzzle,
  RefreshCw,
  School,
  Server,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  Vote,
  Wallet,
  WandSparkles,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/** Icon names used by registry.json (the app's icon set) → lucide equivalents. */
const ICONS: Record<string, LucideIcon> = {
  wand: WandSparkles,
  dashboard: LayoutDashboard,
  alarm: AlarmClock,
  todo: ListTodo,
  timetable: CalendarDays,
  sync: RefreshCw,
  key: KeyRound,
  schedule: CalendarClock,
  calendarRange: CalendarRange,
  wallet: Wallet,
  school: School,
  catalog: BookOpen,
  medal: Medal,
  chat: MessagesSquare,
  ticket: Ticket,
  ballot: Vote,
  card: CreditCard,
  room: DoorOpen,
  brain: Brain,
  puzzle: Puzzle,
  sparkles: Sparkles,
  server: Server,
  globe: Globe,
  library: Library,
  building: Building2,
  food: UtensilsCrossed,
  bus: Bus,
  bell: Bell,
};

/** PKU auxiliary colours as light on a dark tile (DESIGN.md: auxiliaries only as light). */
const TINTS = [
  'from-brand-bright/25 to-brand-deep/5 text-brand-fg ring-brand-bright/25',
  'from-pku-gold/30 to-pku-gold/5 text-pku-gold ring-pku-gold/30 dark:text-pku-sand',
  'from-pku-slate/35 to-pku-navy/5 text-info-fg ring-pku-slate/35',
  'from-pku-amber/30 to-pku-amber/5 text-warn-fg ring-pku-amber/30',
  'from-pku-pine/40 to-pku-pine/5 text-pine-fg ring-pku-pine/40',
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function PluginIcon({
  id,
  icon,
  name,
  size = 'md',
}: {
  id: string;
  icon?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const Icon = icon ? ICONS[icon] : undefined;
  const isUrl = icon?.startsWith('https://');
  const box = { sm: 'size-9 rounded-lg', md: 'size-11 rounded-xl', lg: 'size-16 rounded-2xl' }[size];
  const glyph = { sm: 'size-4', md: 'size-5', lg: 'size-7' }[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ring-1 ring-inset',
        box,
        TINTS[hash(id) % TINTS.length],
      )}
    >
      {isUrl ? (
        // biome-ignore lint/performance/noImgElement: third-party icon URLs, unknown sizes
        <img src={icon} alt="" className="size-full object-cover" loading="lazy" />
      ) : Icon ? (
        <Icon className={glyph} strokeWidth={1.75} />
      ) : (
        <span className={cn('font-semibold', size === 'lg' ? 'text-2xl' : 'text-base')}>{[...name][0]}</span>
      )}
    </span>
  );
}
