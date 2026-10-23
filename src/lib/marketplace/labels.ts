import type { Capability, MarketplacePlugin } from './types';

/** Capabilities in plain words (zh first, as the app shows them). Client-safe. */
export const CAPABILITY: Record<
  Capability,
  { zh: string; en: string; explain: string; explainZh: string; tone: 'neutral' | 'notice' | 'warn' }
> = {
  network: {
    zh: '联网',
    en: 'Network',
    explain: 'Talks to servers on the internet.',
    explainZh: '会访问互联网上的服务器。',
    tone: 'neutral',
  },
  'campus-network': {
    zh: '校园网',
    en: 'Campus network',
    explain: 'Some hosts it uses only answer on the PKU campus network.',
    explainZh: '用到的部分校内网站只在北大校园网内可以访问。',
    tone: 'notice',
  },
  'campus-session': {
    zh: '校园登录态',
    en: 'Campus session',
    explain: 'Acts with your logged-in campus session. Your password never leaves your phone.',
    explainZh: '使用你已登录的校园会话办事；你的密码不会离开手机。',
    tone: 'warn',
  },
  notifications: {
    zh: '通知',
    en: 'Notifications',
    explain: 'Can send you local notifications.',
    explainZh: '可以给你发本地通知。',
    tone: 'neutral',
  },
  background: {
    zh: '后台运行',
    en: 'Background',
    explain: 'Runs scheduled checks while the app is closed.',
    explainZh: 'App 关闭时也会按计划在后台检查。',
    tone: 'notice',
  },
  shell: {
    zh: '命令行',
    en: 'Shell',
    explain: 'Needs a shell; phones do not have one, so the app hides it there.',
    explainZh: '需要命令行；手机没有，所以 App 在手机上会隐藏它。',
    tone: 'warn',
  },
  filesystem: {
    zh: '文件系统',
    en: 'Filesystem',
    explain: 'Needs a filesystem; phones do not offer one, so the app hides it there.',
    explainZh: '需要文件系统；手机不提供，所以 App 在手机上会隐藏它。',
    tone: 'warn',
  },
  cloud: {
    zh: '云服务',
    en: 'Cloud',
    explain: 'Sends data to PKU Harness Cloud (see the disclosure).',
    explainZh: '会把数据发到 PKU Harness Cloud（见下方说明）。',
    tone: 'notice',
  },
  ongoing: {
    zh: '持续活动',
    en: 'Ongoing',
    explain: 'Shows a live, ongoing activity (e.g. a countdown).',
    explainZh: '会显示持续进行的实时活动（如倒计时）。',
    tone: 'neutral',
  },
};

export const CLOUD_SERVICE: Record<string, { zh: string; en: string }> = {
  store: { zh: '云端存储', en: 'Cloud store' },
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

export const marketplaceHref = (p: Pick<MarketplacePlugin, 'slug'>) => `/marketplace/${p.slug}`;

/** Tags users filter by (the "official" tag is shown as a badge instead). */
export const visibleTags = (p: Pick<MarketplacePlugin, 'tags'>) => p.tags.filter((t) => t !== 'official');

/** Campus services a PLUGIN.md may call with the user's session (spec §4). */
export const CAMPUS_SERVICE: Record<string, { zh: string; en: string; host?: string }> = {
  card: { zh: '校园卡', en: 'Campus card', host: 'bdcard.pku.edu.cn' },
  its: { zh: '网费与网络账号', en: 'Network account', host: 'its.pku.edu.cn' },
  treehole: { zh: '树洞', en: 'Treehole', host: 'treehole.pku.edu.cn' },
  blackboard: { zh: '教学网', en: 'Course website', host: 'course.pku.edu.cn' },
  elective: { zh: '选课网', en: 'Course election', host: 'elective.pku.edu.cn' },
  cwfw: { zh: '财务综合信息门户', en: 'Finance portal', host: 'cwfw.pku.edu.cn' },
  cwpay: { zh: '收费平台', en: 'Payments', host: 'cwpay.pku.edu.cn' },
  bdkj: { zh: '北大空间（研讨室）', en: 'Room booking', host: 'bdkj.pku.edu.cn' },
  library: { zh: '图书馆', en: 'Library', host: 'lib.pku.edu.cn' },
  'library-space': { zh: '图书馆空间预约', en: 'Library spaces' },
  portal: { zh: '校内门户', en: 'Portal', host: 'portal.pku.edu.cn' },
};

/** Host abilities (spec §7) in plain words. */
export const ABILITY: Record<string, { zh: string; en: string }> = {
  verify: { zh: '二次验证', en: 'Second-factor verification' },
  otp: { zh: '读取手机令牌验证码', en: 'Read the OTP code' },
  todos: { zh: '读写你的待办', en: 'Read and change your to-dos' },
  timetable: { zh: '读写你的课表', en: 'Read and change your timetable' },
  scheduler: { zh: '创建提醒与定时检查', en: 'Create reminders and scheduled checks' },
  browser: { zh: '在浏览器中打开链接', en: 'Open links in the browser' },
  campusPage: { zh: '打开已登录的校内网页', en: 'Open signed-in campus pages' },
  sms: { zh: '读取短信验证码（需你确认）', en: 'Read an SMS code (you confirm)' },
  files: { zh: '让你选择文件', en: 'Let you pick a file' },
  crypto: { zh: '计算签名', en: 'Compute request signatures' },
};

/** Tool effects (spec §5): what a tool may do. */
export const EFFECT: Record<string, { zh: string; en: string; tone: 'neutral' | 'notice' | 'warn' }> = {
  read: { zh: '只读', en: 'Read', tone: 'neutral' },
  write: { zh: '修改数据', en: 'Write', tone: 'notice' },
  money: { zh: '涉及付款', en: 'Money', tone: 'warn' },
  public: { zh: '公开发布', en: 'Public', tone: 'warn' },
};

export const MODE: Record<string, string> = { auto: '直接执行', ask: '先问你', off: '关闭' };
