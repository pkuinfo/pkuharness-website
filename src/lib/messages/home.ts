/** UI strings for the home page. English defines the shape; Chinese must match it. */
export const en = {
  meta: {
    title: 'PKU Harness: an Android app for PKU campus services',
    description:
      'PKU Harness is a free, open-source Android app for Peking University students. It signs in to campus services with your PKU account and has an AI assistant that can use them for you.',
  },
  hero: {
    title: 'PKU Harness',
    lead: 'An open-source Android app for Peking University students. It signs in to campus services with your PKU account, and an AI assistant uses them for you: your timetable, campus card, free classrooms, Treehole, course website and more.',
    download: 'Download for Android',
    manual: 'User manual',
    released: (tag: string) => `Latest version ${tag}`,
    android: 'Android 7.0 or later',
    license: 'Free and open source (MIT)',
  },
  media: {
    play: 'Play recording',
    pause: 'Pause recording',
  },
  tabs: {
    title: 'The four tabs',
    more: 'Read more in the manual',
    items: {
      chat: {
        name: 'Chat',
        body: 'Ask the assistant in your own words. It calls campus services through plugins and shows the result as a card or a form. Actions that change something wait for your confirmation.',
      },
      dashboard: {
        name: 'Dashboard',
        body: 'Widgets for the numbers you check often, such as your card balance or free classrooms. Ask in Chat to add or change a widget. Each one can be Small, Wide or Large.',
      },
      schedule: {
        name: 'Schedule',
        body: 'Your timetable, to-dos and reminders. A reminder can repeat, for example every 3 days for 16 times. The phone’s alarm delivers it at the exact minute.',
      },
      settings: {
        name: 'Settings',
        body: 'Your PKU account, AI provider and plugins. For each plugin you choose what the assistant may do without asking.',
      },
    },
  },
  services: {
    title: 'Campus services',
    lead: 'Each service is a plugin. These plugins come with the app; you can install others from a link.',
    marketplace: 'Open the marketplace',
  },
  privacy: {
    title: 'Your account and data',
    points: [
      'Your student ID, password and authenticator secret are stored only on your phone, in Android’s encrypted storage.',
      'The app connects to campus systems directly from your phone. Our server never sees your account.',
      'Chats go to the AI provider you choose, with your own API key. DeepSeek is the default; any OpenAI-compatible provider works.',
      'There are no ads, no analytics and no tracking.',
    ],
    terms: 'Terms of Service',
    policy: 'Privacy Policy',
  },
  developers: {
    title: 'Adding a campus service',
    lead: 'A plugin is a folder with a PLUGIN.md file and tool files in YAML. It lists the websites it may contact, and the app handles sign-in and permissions. You can share a plugin with a link.',
    docs: 'Plugin guide',
    repo: 'Source code',
  },
  faq: {
    title: 'Questions',
    lead: 'If your question is not answered here, open an issue on GitHub.',
    ask: 'Open an issue',
    items: [
      {
        id: 'cost',
        q: 'Does it cost anything?',
        a: 'The app is free. The assistant uses your own API key from an AI provider, and you pay the provider for what you use.',
      },
      {
        id: 'ios',
        q: 'Is there an iPhone version?',
        a: 'Not yet. The app runs on Android 7.0 or later.',
      },
      {
        id: 'network',
        q: 'Does it work off campus?',
        a: 'Most features do. A few university services, such as the finance system, only work on the campus network.',
      },
      {
        id: 'update',
        q: 'How do I update?',
        a: 'The app checks for new versions and asks you. Tap Update; it downloads the new APK and opens Android’s installer, and your data stays. Small fixes arrive automatically without a new APK.',
      },
      {
        id: 'apk',
        q: 'How can I check that the APK is genuine?',
        a: 'Every APK is built by GitHub Actions from a tagged commit and signed with the same key. The release notes list the fingerprints of the APK and of the signing certificate.',
      },
    ],
  },
  cta: {
    title: 'Download',
    latest: (tag: string, date: string) => `The latest version is ${tag}, released on ${date}.`,
    none: 'The release information could not be loaded. All versions are on the download page and on GitHub Releases.',
    download: (tag: string) => `Download ${tag}`,
    downloadPage: 'Open the download page',
    github: 'Source on GitHub',
  },
};

export const zh: typeof en = {
  meta: {
    title: 'PKU Harness：北大校园服务 Android 应用',
    description:
      'PKU Harness 是面向北京大学学生的免费开源 Android 应用。它用你的北大账号登录校园服务，并由 AI 助手代你使用这些服务。',
  },
  hero: {
    title: 'PKU Harness',
    lead: '面向北京大学学生的开源 Android 应用。它用你的北大账号登录校园服务，再由 AI 助手代你使用：课表、校园卡、空闲教室、树洞、教学网等。',
    download: '下载 Android 版',
    manual: '使用手册',
    released: (tag: string) => `最新版本 ${tag}`,
    android: 'Android 7.0 及以上',
    license: '免费开源（MIT）',
  },
  media: {
    play: '播放录屏',
    pause: '暂停录屏',
  },
  tabs: {
    title: '四个标签页',
    more: '在手册中查看',
    items: {
      chat: {
        name: '对话',
        body: '用自己的话问助手。它通过插件调用校园服务，用卡片或表单给出结果。会改变内容的操作，要等你确认后才执行。',
      },
      dashboard: {
        name: '看板',
        body: '放常看的数字，例如校园卡余额、空闲教室。在对话中让助手添加或修改组件。每个组件可以是小、宽或大。',
      },
      schedule: {
        name: '日程',
        body: '课表、待办和提醒。提醒可以重复，例如「每 3 天一次，共 16 次」，由手机闹钟准时送达。',
      },
      settings: {
        name: '设置',
        body: '北大账号、AI 服务商和插件。你可以为每个插件选择哪些操作助手可以直接执行。',
      },
    },
  },
  services: {
    title: '校园服务',
    lead: '每项服务都是一个插件。下面的插件随 App 提供，其他插件可以通过链接安装。',
    marketplace: '打开插件市场',
  },
  privacy: {
    title: '账号和数据',
    points: [
      '学号、密码和手机令牌密钥只保存在你的手机上，存放在 Android 加密存储中。',
      'App 从你的手机直接连接学校系统，我们的服务器看不到你的账号。',
      '对话发送给你选择的 AI 服务商，使用你自己的 API 密钥。默认是 DeepSeek，也可以用任何兼容 OpenAI 接口的服务。',
      '没有广告、统计分析或追踪。',
    ],
    terms: '用户协议',
    policy: '隐私政策',
  },
  developers: {
    title: '接入新的校园服务',
    lead: '插件是一个文件夹，包含一个 PLUGIN.md 文件和若干 YAML 格式的工具文件。插件列出它可以访问的网站，登录和权限由 App 处理。插件可以通过链接分享。',
    docs: '插件开发指南',
    repo: '源代码',
  },
  faq: {
    title: '常见问题',
    lead: '如果这里没有你的问题，请在 GitHub 上提交 issue。',
    ask: '提交 issue',
    items: [
      {
        id: 'cost',
        q: '收费吗？',
        a: 'App 免费。助手使用你自己在 AI 服务商处申请的 API 密钥，用量费用由你向服务商支付。',
      },
      {
        id: 'ios',
        q: '有 iPhone 版吗？',
        a: '暂时没有。App 支持 Android 7.0 及以上版本。',
      },
      {
        id: 'network',
        q: '在校外能用吗？',
        a: '大部分功能可以。少数学校服务（例如财务系统）只能在校园网内使用。',
      },
      {
        id: 'update',
        q: '怎么更新？',
        a: 'App 会检查新版本并提示你。点「更新」后，它会下载新的 APK 并打开系统安装器，数据会保留。小的修复会自动下载，不需要新的 APK。',
      },
      {
        id: 'apk',
        q: '怎样确认 APK 没有被篡改？',
        a: '每个 APK 都由 GitHub Actions 从带标签的提交构建，并用同一个密钥签名。发布说明中列出了 APK 和签名证书的指纹。',
      },
    ],
  },
  cta: {
    title: '下载',
    latest: (tag: string, date: string) => `最新版本是 ${tag}，发布于 ${date}。`,
    none: '暂时无法获取版本信息。所有版本都可以在下载页和 GitHub Releases 上找到。',
    download: (tag: string) => `下载 ${tag}`,
    downloadPage: '打开下载页',
    github: 'GitHub 上的源代码',
  },
};
