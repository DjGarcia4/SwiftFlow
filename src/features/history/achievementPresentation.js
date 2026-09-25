import {
  FireIcon,
  TrophyIcon,
  BoltIcon,
  RocketLaunchIcon,
  CheckBadgeIcon,
  MapIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  StarIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  GiftIcon,
  HashtagIcon,
  FlagIcon,
  ChevronDoubleUpIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  HeartIcon,
  BookOpenIcon,
  EyeIcon,
} from "@heroicons/vue/24/outline";

// Shared between the achievements grid (HistoryView) and the unlock toast,
// so both read the same icon-per-achievement / color-per-category mapping.
export const ACHIEVEMENT_ICONS = {
  trophy: TrophyIcon,
  bolt: BoltIcon,
  rocket: RocketLaunchIcon,
  "check-badge": CheckBadgeIcon,
  fire: FireIcon,
  map: MapIcon,
  code: CodeBracketIcon,
  chat: ChatBubbleBottomCenterTextIcon,
  clock: ClockIcon,
  sparkles: SparklesIcon,
  moon: MoonIcon,
  sun: SunIcon,
  star: StarIcon,
  document: DocumentTextIcon,
  calendar: CalendarDaysIcon,
  gift: GiftIcon,
  hashtag: HashtagIcon,
  flag: FlagIcon,
  "level-up": ChevronDoubleUpIcon,
  "academic-cap": AcademicCapIcon,
  shield: ShieldCheckIcon,
  heart: HeartIcon,
  book: BookOpenIcon,
  eye: EyeIcon,
};

export const ACHIEVEMENT_CATEGORY_RGB = {
  sessions: [217, 119, 6], // amber
  speed: [37, 99, 235], // blue
  accuracy: [5, 150, 105], // emerald
  streak: [234, 88, 12], // orange
  combo: [225, 29, 72], // rose
  explorer: [124, 58, 237], // violet
  time: [8, 145, 178], // cyan
  zen: [13, 148, 136], // teal
  special: [192, 38, 211], // fuchsia
  challenge: [79, 70, 229], // indigo
  level: [202, 138, 4], // gold
  reading: [180, 83, 9], // amber, like old paper
};

const FALLBACK_RGB = [100, 116, 139]; // slate, shouldn't normally hit this

// Subtle tint for the achievements grid: a translucent wash of the
// category color over the card background, readable in either theme.
// Locked achievements get no color override at all — the caller's plain
// gray Tailwind classes should show through instead.
export const achievementTintStyle = (achievement) => {
  if (!achievement.unlocked) return {};

  const [r, g, b] = ACHIEVEMENT_CATEGORY_RGB[achievement.category] ?? FALLBACK_RGB;
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.12)`,
    borderColor: `rgb(${r} ${g} ${b})`,
    color: `rgb(${r} ${g} ${b})`,
  };
};

// Punchier solid version for the unlock toast, which needs to pop against
// the page rather than blend into a grid of cards.
// A toast can bring its own color (a level up wears its rank's) instead of
// its category's.
export const achievementSolidStyle = (achievement) => {
  const [r, g, b] =
    achievement.rgb ?? ACHIEVEMENT_CATEGORY_RGB[achievement.category] ?? FALLBACK_RGB;
  const darken = (channel) => Math.round(channel * 0.75);
  return {
    backgroundColor: `rgb(${r} ${g} ${b})`,
    borderColor: `rgb(${darken(r)} ${darken(g)} ${darken(b)})`,
    color: "white",
  };
};
