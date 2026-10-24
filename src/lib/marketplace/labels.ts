import { type Lang, localePath } from '@/lib/i18n';
import type { Capability, MarketplacePlugin } from './types';

/** Capabilities in plain words, in both languages. Client-safe. */
export const CAPABILITY: Record<
  Capability,
  { zh: string; en: string; explain: string; explainZh: string; tone: 'neutral' | 'notice' | 'warn' }
> = {
  network: {
    zh: '联网',
    en: 'Network',
    explain: 'Connects to servers on the internet.',
    explainZh: '会访问互联网上的服务器。',
    tone: 'neutral',
  },
  'campus-network': {
    zh: '校园网',
    en: 'Campus network',
    explain: 'Some of the websites it uses only respond on the PKU campus network.',
    explainZh: '它用到的部分网站只能在北大校园网内访问。',
    tone: 'notice',
  },
  'campus-session': {
    zh: '校园登录',
    en: 'Campus sign-in',
    explain: 'Uses your signed-in campus session. Your password never leaves your phone.',
    explainZh: '使用你已登录的校园会话，你的密码不会离开手机。',
    tone: 'warn',
  },
  notifications: {
    zh: '通知',
    en: 'Notifications',
    explain: 'Can send you local notifications.',
    explainZh: '可以给你发送本地通知。',
    tone: 'neutral',
  },
  background: {
    zh: '后台运行',
    en: 'Background',
    explain: 'Runs scheduled checks while the app is closed.',
    explainZh: '在 App 关闭时按计划在后台检查。',
    tone: 'notice',
  },
  shell: {
    zh: '命令行',
    en: 'Shell',
    explain: 'Needs a command-line shell. Phones do not have one, so the app does not offer this plugin on phones.',
    explainZh: '需要命令行环境。手机上没有命令行，所以 App 在手机上不提供这个插件。',
    tone: 'warn',
  },
  filesystem: {
    zh: '文件系统',
    en: 'File system',
    explain:
      'Needs direct access to a file system. Phones do not provide it, so the app does not offer this plugin on phones.',
    explainZh: '需要直接访问文件系统。手机不提供这种访问，所以 App 在手机上不提供这个插件。',
    tone: 'warn',
  },
  cloud: {
    zh: '云服务',
    en: 'Cloud',
    explain: 'Sends data to PKU Harness Cloud. See the Cloud data section.',
    explainZh: '会把数据发送到 PKU Harness Cloud，详见「云端数据」。',
    tone: 'notice',
  },
  ongoing: {
    zh: '持续通知',
    en: 'Ongoing notification',
    explain: 'Shows a notification that keeps updating, such as a countdown.',
    explainZh: '会显示一条持续更新的通知，例如倒计时。',
    tone: 'neutral',
  },
};

export const CLOUD_SERVICE: Record<string, { zh: string; en: string }> = {
  store: { zh: '云端存储', en: 'Cloud storage' },
  channels: { zh: '频道', en: 'Channels' },
  push: { zh: '推送', en: 'Push' },
  files: { zh: '文件', en: 'Files' },
  functions: { zh: '云函数', en: 'Functions' },
};

export const ALL_CAPABILITIES = Object.keys(CAPABILITY) as Capability[];

/** Short handle shown to users: owner/repo/id. */
export const handleOf = (p: Pick<MarketplacePlugin, 'slug'>) => p.slug;

/** Install name in the app (remote plugins are MCP servers named after the id). */
export const appServerName = (p: Pick<MarketplacePlugin, 'id'>) => `mcp-${p.id}`;

/** Detail page of a plugin; pass `lang` for a locale-aware href (`/en/marketplace/…`). */
export const marketplaceHref = (p: Pick<MarketplacePlugin, 'slug'>, lang: Lang = 'zh') =>
  localePath(lang, `/marketplace/${p.slug}`);

/** Pick a `{ zh, en }` label by language. */
export const pick = (l: { zh: string; en: string } | undefined, lang: Lang, fallback = '') => (l ? l[lang] : fallback);

const CJK = /[\u3400-\u9fff]/;
const humanize = (id: string) =>
  id.length <= 3 ? id.toUpperCase() : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');

/**
 * Plugin name in the reader's language. Manifests are Chinese first and English comes from
 * `i18n.en`; when that is missing, English readers get the id in words rather than a Chinese name.
 */
export const pluginName = (p: Pick<MarketplacePlugin, 'name' | 'nameEn' | 'id'>, lang: Lang) =>
  lang === 'en' ? (p.nameEn ?? (CJK.test(p.name) ? humanize(p.id) : p.name)) : p.name;

/** Plugin description in the reader's language, plus the language it is actually written in. */
export function pluginDescription(p: Pick<MarketplacePlugin, 'description' | 'descriptionEn'>, lang: Lang) {
  if (lang === 'en' && p.descriptionEn) return { text: p.descriptionEn, lang: 'en' as const };
  return { text: p.description, lang: lang === 'en' ? ('zh' as const) : lang };
}

/** Capability explanation in the reader's language. */
export const capabilityExplain = (c: Capability, lang: Lang) =>
  lang === 'zh' ? CAPABILITY[c].explainZh : CAPABILITY[c].explain;

/** Tags users filter by (the "official" tag is shown as a badge instead). */
export const visibleTags = (p: Pick<MarketplacePlugin, 'tags'>) => p.tags.filter((t) => t !== 'official');

/** Campus services a PLUGIN.md may call with the user's session (spec §4). */
export const CAMPUS_SERVICE: Record<string, { zh: string; en: string; host?: string }> = {
  card: { zh: '校园卡', en: 'Campus card', host: 'bdcard.pku.edu.cn' },
  its: { zh: '网费与网络账号', en: 'Network account and fee', host: 'its.pku.edu.cn' },
  treehole: { zh: '树洞', en: 'Treehole', host: 'treehole.pku.edu.cn' },
  blackboard: { zh: '教学网', en: 'Course website', host: 'course.pku.edu.cn' },
  elective: { zh: '选课网', en: 'Course selection', host: 'elective.pku.edu.cn' },
  cwfw: { zh: '财务综合信息门户', en: 'Finance portal', host: 'cwfw.pku.edu.cn' },
  cwpay: { zh: '收费平台', en: 'Fee payment', host: 'cwpay.pku.edu.cn' },
  bdkj: { zh: '北大空间（研讨室预约）', en: 'Room booking', host: 'bdkj.pku.edu.cn' },
  library: { zh: '图书馆', en: 'Library', host: 'lib.pku.edu.cn' },
  'library-space': { zh: '图书馆空间预约', en: 'Library space booking' },
  portal: { zh: '校内门户', en: 'Campus portal', host: 'portal.pku.edu.cn' },
};

/** Host abilities (spec §7) in plain words; kept in line with the app's own labels. */
export const ABILITY: Record<string, { zh: string; en: string }> = {
  verify: { zh: '树洞验证码', en: 'Treehole verification codes' },
  otp: { zh: '读取手机令牌验证码', en: 'Read your authenticator code' },
  todos: { zh: '读取和修改你的待办', en: 'Read and change your to-dos' },
  timetable: { zh: '读取和修改你的课表', en: 'Read and change your timetable' },
  scheduler: { zh: '创建提醒和定时检查', en: 'Create reminders and scheduled checks' },
  browser: { zh: '在浏览器中打开链接', en: 'Open links in the browser' },
  campusPage: { zh: '以登录状态打开校园网站', en: 'Open campus websites signed in' },
  sms: { zh: '读取一条短信验证码（需你允许）', en: 'Read one SMS code (you allow it)' },
  files: { zh: '让你选择文件', en: 'Let you pick a file' },
  crypto: { zh: '计算请求签名', en: 'Compute request signatures' },
};

/** Tool effects (spec §5): what a tool may do. Same words as the app. */
export const EFFECT: Record<string, { zh: string; en: string; tone: 'neutral' | 'notice' | 'warn' }> = {
  read: { zh: '读取', en: 'Read', tone: 'neutral' },
  write: { zh: '修改', en: 'Change', tone: 'notice' },
  money: { zh: '资金', en: 'Money', tone: 'warn' },
  public: { zh: '公开', en: 'Public', tone: 'warn' },
};

/** Default permission modes (spec §9). Same words as the app. */
export const MODE: Record<string, { zh: string; en: string }> = {
  auto: { zh: '直接执行', en: 'Allow' },
  ask: { zh: '每次询问', en: 'Ask first' },
  off: { zh: '禁止', en: 'Never' },
};
