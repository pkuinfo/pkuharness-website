/**
 * Plugin list for the landing page: the live marketplace registry
 * (pkuinfo/pku-harness-plugins → registry/registry.json), refreshed hourly, with a snapshot
 * (registry of 2026-10-22) as fallback when GitHub is unreachable.
 */

export interface LandingPlugin {
  id: string;
  name: string;
  description: string;
  kind: 'builtin' | 'remote';
  icon: string;
}

const REGISTRY_URL = 'https://raw.githubusercontent.com/pkuinfo/pku-harness-plugins/main/registry/registry.json';

/**
 * English names from each plugin's own i18n (PLUGIN.md `i18n.en.name` or `definePlugin` i18n in
 * pku-harness-plugins, 2026-10-23). The registry only carries the Chinese name.
 */
const EN_NAMES: Record<string, string> = {
  authenticator: 'Authenticator',
  calendar: 'Date and academic calendar',
  'campus-events': 'Campus events',
  canteen: 'Canteens',
  'card-share': 'Share payment code',
  classrooms: 'Free classrooms',
  'course-catalog': 'Course catalogue',
  courses: 'Course (教学网)',
  'course-sync': 'Official timetable',
  dashboard: 'Dashboard',
  deepseek: 'DeepSeek',
  elective: 'Elective (选课网)',
  finance: 'Finance',
  grades: 'Grades',
  library: 'Library',
  memory: 'AI memory',
  notices: 'Campus notices',
  'openai-compatible': 'OpenAI-compatible',
  plugins: 'Plugins',
  'room-booking': 'Seminar rooms',
  schedule: 'Schedule',
  scheduler: 'Reminders and scheduled tasks',
  shuttle: 'Shuttle bus',
  timetable: 'Timetable',
  todo: 'To-dos',
  treehole: 'Treehole',
  ui: 'Generative UI',
  wallet: 'Campus wallet',
};

/** Plugin list with names in `lang` (English falls back to the registry name). */
export async function getLocalizedPlugins(lang: 'zh' | 'en'): Promise<LandingPlugin[]> {
  const plugins = await getLandingPlugins();
  if (lang === 'zh') return plugins;
  return plugins.map((p) => ({ ...p, name: EN_NAMES[p.id] ?? p.name, description: '' }));
}

export async function getLandingPlugins(): Promise<LandingPlugin[]> {
  try {
    const res = await fetch(REGISTRY_URL, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`registry ${res.status}`);
    const data = (await res.json()) as { plugins?: Partial<LandingPlugin>[] };
    const plugins = (data.plugins ?? [])
      .filter((p): p is LandingPlugin => typeof p.id === 'string' && typeof p.name === 'string')
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        kind: p.kind === 'remote' ? ('remote' as const) : ('builtin' as const),
        icon: p.icon ?? 'puzzle',
      }));
    return plugins.length > 0 ? plugins : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

/** Harness-level plugins (agent, UI, providers…) vs. plugins that reach a campus service. */
export const CORE_PLUGIN_IDS = new Set([
  'ui',
  'dashboard',
  'scheduler',
  'todo',
  'schedule',
  'memory',
  'plugins',
  'deepseek',
  'openai-compatible',
  'calendar',
  'authenticator',
]);

const FALLBACK: LandingPlugin[] = [
  {
    id: 'ui',
    name: '界面生成',
    description: '让 AI 在对话里生成原生界面：表单、选择器、数据卡片。',
    kind: 'builtin',
    icon: 'wand',
  },
  {
    id: 'dashboard',
    name: '看板',
    description: '由 AI 搭建、可随时修改的数据看板。',
    kind: 'builtin',
    icon: 'dashboard',
  },
  {
    id: 'scheduler',
    name: '提醒与定时任务',
    description: '准时的本地提醒，以及定期检查数据并在满足条件时通知。',
    kind: 'builtin',
    icon: 'alarm',
  },
  { id: 'todo', name: '待办', description: '待办事项，可设截止时间和准时提醒。', kind: 'builtin', icon: 'todo' },
  { id: 'timetable', name: '课表', description: '课程表、今天的课和上课提醒。', kind: 'builtin', icon: 'timetable' },
  { id: 'course-sync', name: '教务课表', description: '从学校同步本学期课表到日程。', kind: 'builtin', icon: 'sync' },
  {
    id: 'authenticator',
    name: '手机令牌',
    description: '把本 App 绑定为统一身份认证的手机令牌，自动完成二次验证。',
    kind: 'builtin',
    icon: 'key',
  },
  {
    id: 'schedule',
    name: '日程',
    description: '日程页：今天的课、待办、提醒，以及课表周视图和相关表单。',
    kind: 'builtin',
    icon: 'schedule',
  },
  {
    id: 'calendar',
    name: '日期与校历',
    description: '今天的日期、星期、第几教学周，以及北大官方校历（开学、节假日、考试周），可一键设置课表学期。',
    kind: 'builtin',
    icon: 'calendarRange',
  },
  {
    id: 'wallet',
    name: '校园钱包',
    description: '校园卡余额与付款码、充值，网费、电费、水费、浴卡（原「校园卡」「网费」「水电浴」合并）。',
    kind: 'builtin',
    icon: 'wallet',
  },
  {
    id: 'courses',
    name: '教学网',
    description: '教学网课程公告、作业（截止时间、要求、成绩）、课程资料目录和课程回放列表（只读）。',
    kind: 'builtin',
    icon: 'school',
  },
  {
    id: 'course-catalog',
    name: '全校课程目录',
    description: '按课程名、教师、院系搜索全校开课，含上课时间（选课网查询含教室）。只读。',
    kind: 'builtin',
    icon: 'catalog',
  },
  { id: 'grades', name: '成绩', description: '查询各学期成绩和绩点（GPA）。', kind: 'builtin', icon: 'medal' },
  {
    id: 'treehole',
    name: '树洞',
    description: '北大树洞：浏览、搜索、阅读帖子，关注帖子，匿名发帖和回复。',
    kind: 'builtin',
    icon: 'chat',
  },
  {
    id: 'campus-events',
    name: '校园活动',
    description: '学术讲座日历和校园活动日历。',
    kind: 'builtin',
    icon: 'ticket',
  },
  {
    id: 'elective',
    name: '选课网',
    description: '选课网选课结果、补退选课程余量和课程搜索（只读，选课请到官网）。',
    kind: 'builtin',
    icon: 'ballot',
  },
  {
    id: 'finance',
    name: '财务',
    description: '个人酬金/收入（财务门户，仅校园网）、学费住宿费欠费和缴费记录（收费平台）。只读。',
    kind: 'builtin',
    icon: 'card',
  },
  {
    id: 'room-booking',
    name: '研讨室预约',
    description: '北大空间：二教、四教、地学楼研讨教室的查询、空闲时段、预约和取消。',
    kind: 'builtin',
    icon: 'room',
  },
  {
    id: 'memory',
    name: 'AI 记忆',
    description: '记住你的偏好、习惯和长期信息，让 AI 越用越懂你。只保存在本机，可随时查看和删除。',
    kind: 'builtin',
    icon: 'brain',
  },
  {
    id: 'plugins',
    name: '插件管理',
    description: '查看已安装的插件，安装或移除远程（MCP）插件。',
    kind: 'builtin',
    icon: 'puzzle',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek 官方 API（默认 AI 服务）。',
    kind: 'builtin',
    icon: 'sparkles',
  },
  {
    id: 'openai-compatible',
    name: 'OpenAI 兼容服务',
    description: '接入任意兼容 OpenAI Chat Completions 接口的模型服务。',
    kind: 'builtin',
    icon: 'server',
  },
  {
    id: 'demo-canteen',
    name: '食堂菜单（演示）',
    description: '示例远程插件：模拟的食堂菜单与座位预约，演示如何用 MCP 写一个插件。',
    kind: 'remote',
    icon: 'globe',
  },
  {
    id: 'library',
    name: '图书馆',
    description: '馆藏检索、我的借阅与续借、预约取书、研讨室预约、研修专座余量和开馆时间。',
    kind: 'builtin',
    icon: 'library',
  },
  {
    id: 'classrooms',
    name: '空闲教室',
    description: '各教学楼今天到后天每节课的空闲教室。',
    kind: 'builtin',
    icon: 'building',
  },
  {
    id: 'canteen',
    name: '食堂',
    description: '各食堂实时就餐人数、开闭餐时间和餐饮中心通知。',
    kind: 'builtin',
    icon: 'food',
  },
  {
    id: 'shuttle',
    name: '校车',
    description: '燕园—新燕园通勤班车和快速公交时刻表，算出下一班车。',
    kind: 'builtin',
    icon: 'bus',
  },
  {
    id: 'notices',
    name: '校园通知',
    description: '教务部、研究生院、学工部、总务部通知和北大新闻，可搜索、读全文。',
    kind: 'builtin',
    icon: 'bell',
  },
];
