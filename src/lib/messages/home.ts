/** UI strings for the home page. English defines the shape; Chinese must match it. */
export const en = {
  meta: {
    title: 'PKU Harness: the AI-native app for campus life at PKU',
    description:
      'Sign in with your PKU account once, then ask for a free classroom, the next shuttle or your campus card balance. An open-source Android app; every campus service is a plugin.',
  },
  hero: {
    title: ['Anything at PKU,', 'just ask.'],
    lead: 'PKU Harness is an open-source Android app. Sign in with your PKU account once, then ask it for a free classroom, how busy the canteens are, the next shuttle or your campus card balance. It goes into the university’s systems and gets it for you.',
    download: 'Get the Android app',
    docs: 'Read the docs',
    source: 'Source code',
    released: (tag: string) => `${tag} is out`,
    android: 'Android 7.0 or later',
    license: 'Free and MIT licensed',
  },
  media: {
    play: 'Play recording',
    pause: 'Pause recording',
  },
  tour: {
    title: 'Four tabs, one assistant behind them',
    lead: 'Chat, Dashboard, Schedule and Settings. Anything you can tap on a page, the assistant can do from the chat too.',
    examplesLabel: 'Things you can say',
    chapters: {
      chat: {
        name: 'Chat',
        title: 'Ask, and the answer comes back as UI',
        body: 'The assistant calls plugins to look things up in the university’s systems and draws the result as native cards, forms and pickers. When it needs a yes or a detail from you, you tap it right there in the conversation.',
        examples: [
          'Which rooms in the Second Teaching Building are free tomorrow morning?',
          'Is Xuewu canteen busy right now?',
          'When’s the next shuttle to Xinyanyuan?',
        ],
      },
      dashboard: {
        name: 'Dashboard',
        title: 'Put the numbers you check on the dashboard',
        body: 'Tell it which numbers you care about and it builds the widgets: campus card balance, network fee, canteen crowds. They refresh on their own. It can also run checks on a schedule and notify you on the minute.',
        examples: [
          'Put my campus card balance on the dashboard.',
          'Check my network fee every morning at 8 and tell me if it’s under ¥10.',
        ],
      },
      schedule: {
        name: 'Schedule',
        title: 'Timetable, to-dos and reminders together',
        body: 'Your timetable syncs from the university. To-dos and reminders take any recurrence you can say out loud, and the system alarm clock delivers them on the minute.',
        examples: [
          'Remind me to hand in the problem set on Thursday at 3 pm.',
          'Remind me to water the plants every 3 days, 16 times, then stop.',
        ],
      },
      settings: {
        name: 'Settings',
        title: 'You decide what each plugin may do',
        body: 'Settings keeps only what needs a screen: your PKU account, your model provider and your plugins. For every plugin you set Read, Change, Money and Public separately to Allow, Ask first or Never.',
        examples: ['Never let it spend money without asking.', 'Ask me before anything is posted to Treehole.'],
      },
    },
  },
  plugins: {
    title: 'A plugin is just a folder',
    lead: 'Every campus service is a plugin: a folder with a PLUGIN.md that says which sites it may reach and which tools it offers. There’s no code to run, so sharing one means sending a link.',
    points: [
      {
        title: 'Install from a link',
        body: 'Send a friend the GitHub link or a QR code. They open it in the app to install, and the plugin keeps itself updated from that link.',
      },
      {
        title: 'See what it can reach first',
        body: 'Before anything is installed, the app shows the sites and campus services the plugin can reach and what each tool does: read, change, money or public.',
      },
      {
        title: 'Same rules for everyone',
        body: 'Official plugins use the same language and the same permissions as community ones. Nothing built in can do more than what you could write yourself.',
      },
    ],
    count: (n: number) => `${n} plugins in the marketplace today`,
    browse: 'Browse the marketplace',
    remote: 'MCP',
  },
  trust: {
    title: 'Your password stays on your phone',
    lead: 'No server of ours ever sees your PKU account. The app signs in and talks to campus services from your phone, so the only thing you need to trust is code you can read.',
    points: [
      {
        title: 'Credentials stay on the device',
        body: 'Student ID, password and authenticator secret live in the system’s secure storage. Plugins never see your password, only the per-service sessions the app signed in for them.',
      },
      {
        title: 'Your model, your key',
        body: 'DeepSeek by default, or any OpenAI-compatible provider. Chats go straight from your phone to the provider you picked; your key never passes through us.',
      },
      {
        title: 'Permissions by effect',
        body: 'Read, Change, Money and Public are set separately for every plugin. Scheduled checks in the background can only read; they never decide anything for you.',
      },
      {
        title: 'Campus content is data, not orders',
        body: 'Treehole posts and notices reach the model as data, never as instructions. Anything it wants to remember after reading them waits for your OK.',
      },
      {
        title: 'Signed updates',
        body: 'Over-the-air updates are signed with the maintainers’ private key and built from public commits. The app refuses anything unsigned or signed wrong.',
      },
      {
        title: 'All of it is open source',
        body: 'The app, the plugins and this website are MIT licensed. Read every line, or build it yourself.',
      },
    ],
    diagram: {
      label:
        'Diagram: the phone connects directly to campus services and to the model provider you chose. There is no connection to our server.',
      direct: 'direct, no proxy',
      chat: 'chats, with your key',
      vault: 'secure storage',
      campus: 'Campus services',
      model: 'Your model provider',
      modelSub: 'DeepSeek or compatible',
      ours: 'Our server',
      oursSub: 'can’t see your account',
    },
  },
  developers: {
    title: 'Write a plugin, connect a campus service',
    lead: 'If the university doesn’t offer an API for something, the community can add it. A plugin describes requests and results with YAML steps and safe expressions; the app takes care of sign-in, sessions and permissions. Replay its recorded tests, push it to GitHub and it’s shareable. The assistant in the app can even write one with you.',
    codeLabel: 'Plugin source',
    note: 'The real source of the official classrooms plugin, shortened.',
    links: {
      docs: { title: 'Build a plugin', sub: 'Quick start and language reference' },
      marketplace: { title: 'Marketplace', sub: 'Every plugin you can install' },
      repo: { title: 'pku-harness-plugins', sub: 'SDK, plugins and registry' },
    },
  },
  faq: {
    title: 'Questions people ask',
    lead: 'Not answered here? Ask on GitHub.',
    ask: 'Open an issue',
    items: [
      {
        id: 'cost',
        q: 'Does it cost anything?',
        a: 'The app is free and open source. Chats run on your own model key (DeepSeek by default, or any OpenAI-compatible provider), so you pay the provider directly for what you use. We don’t handle any of it.',
      },
      {
        id: 'password',
        q: 'Is my PKU password safe?',
        a: 'Your student ID, password and authenticator secret stay in the phone’s secure storage. The app signs in to campus systems from the phone, and plugins only get the signed-in sessions, never the password. We have no server that can see your account.',
      },
      {
        id: 'ios',
        q: 'Is there an iPhone version?',
        a: 'iOS support is being prepared. Today it runs on arm64 Android phones with Android 7.0 or later.',
      },
      {
        id: 'network',
        q: 'Does it work off campus?',
        a: 'Most of it does. A few university services only answer on the campus network, such as the finance portal, and those features need you to be connected to it.',
      },
      {
        id: 'apk',
        q: 'How do I know the APK hasn’t been tampered with?',
        a: 'Every APK is built by GitHub Actions from a tagged commit and signed with the same key, and the release notes list the APK and certificate fingerprints. Over-the-air updates are signed too, and the app rejects anything that doesn’t verify.',
      },
    ],
  },
  cta: {
    title: 'Try it on your phone',
    latest: (tag: string, date: string) =>
      `The latest version is ${tag}, released ${date}. Needs Android 7.0 or later; iOS is being prepared.`,
    none: 'We couldn’t load the latest release just now. The download page and GitHub Releases have every version.',
    download: (tag: string) => `Download ${tag}`,
    downloadPage: 'Go to downloads',
    github: 'Star on GitHub',
  },
};

export const zh: typeof en = {
  meta: {
    title: 'PKU Harness：北大校园生活的 AI 原生 App',
    description:
      '用北大账号登录一次，查空教室、看下一班校车、盯校园卡余额，说一句就行。开源的 Android App，每项校园服务都是一个插件。',
  },
  hero: {
    title: ['北大的事，', '跟它说一声就行。'],
    lead: 'PKU Harness 是一个开源的 Android App。用北大账号登录一次，之后想找空教室、看食堂人多不多、查下一班校车、盯校园卡余额，在对话里说一句，它去学校的系统里帮你办。',
    download: '下载 Android 版',
    docs: '看文档',
    source: '源代码',
    released: (tag: string) => `${tag} 已发布`,
    android: '支持 Android 7.0 及以上',
    license: '免费，MIT 开源',
  },
  media: {
    play: '播放录屏',
    pause: '暂停录屏',
  },
  tour: {
    title: '四个标签页，背后是同一个助手',
    lead: '对话、看板、日程、设置。页面上你能点的东西，它在对话里也能替你做。',
    examplesLabel: '可以这样说',
    chapters: {
      chat: {
        name: '对话',
        title: '问一句，答案带着界面回来',
        body: '助手调用插件去学校的系统里查，结果直接画成原生的卡片、表单和选择器。需要你确认或者补个信息，就在对话里点一下。',
        examples: ['明天上午二教哪些教室空着？', '学五现在人多吗？', '下一班去新燕园的校车几点？'],
      },
      dashboard: {
        name: '看板',
        title: '常看的数，放到看板上',
        body: '告诉它你想盯哪些数，它就做成小组件：校园卡余额、网费、食堂人流，数据自己刷新。还能让它定时去查，到点准时通知你。',
        examples: ['把校园卡余额放到看板上', '每天早上 8 点查一次网费，不到 10 块提醒我'],
      },
      schedule: {
        name: '日程',
        title: '课表、待办和提醒放在一起',
        body: '课表从教务同步。待办和提醒随口就能建，重复规则怎么说都行，由系统闹钟按分钟准时送达。',
        examples: ['周四下午 3 点提醒我交习题', '每 3 天提醒我浇一次花，一共 16 次'],
      },
      settings: {
        name: '设置',
        title: '每个插件能做什么，你说了算',
        body: '设置页只放必须的：北大账号、模型服务和插件。每个插件的「读取、修改、资金、公开」四类操作分开设置：直接执行、每次询问，或者禁止。',
        examples: ['涉及资金的操作每次都先问我', '往树洞发东西之前先让我看一眼'],
      },
    },
  },
  plugins: {
    title: '插件就是一个文件夹',
    lead: '每项校园服务都是一个插件：一个带 PLUGIN.md 的文件夹，写明它能访问哪些网站、提供哪些工具。里面没有要运行的代码，分享插件就是发一个链接。',
    points: [
      {
        title: '贴个链接就能装',
        body: '把 GitHub 链接或二维码发给同学，对方在 App 里打开就能装，之后也从这个链接自动更新。',
      },
      {
        title: '装之前先看清楚',
        body: '安装前，App 会列出插件能访问的网站和校园服务，以及每个工具属于读取、修改、资金还是公开。',
      },
      {
        title: '官方和社区一个规矩',
        body: '官方插件用的也是同一套语言、同一套权限。内置插件能做到的，你自己写的插件同样能做到。',
      },
    ],
    count: (n: number) => `插件市场里现在有 ${n} 个插件`,
    browse: '逛逛插件市场',
    remote: 'MCP',
  },
  trust: {
    title: '你的密码不离开手机',
    lead: '我们没有任何一台服务器能看到你的北大账号。App 在手机上登录、在手机上调用学校服务，你只需要信任你能读到的代码。',
    points: [
      {
        title: '凭据只存在本机',
        body: '学号、密码和手机令牌密钥放在系统安全存储里。插件拿不到密码，只拿到 App 替它登录好的、按服务划分的会话。',
      },
      {
        title: '模型自己选，Key 自己带',
        body: '默认 DeepSeek，也可以接任何 OpenAI 兼容的服务。对话从手机直接发给你选的服务商，Key 不经过我们。',
      },
      {
        title: '按操作类型授权',
        body: '每个插件的「读取、修改、资金、公开」分开设置。后台的定时检查只能读取，不会替你做决定。',
      },
      {
        title: '校园内容只当数据',
        body: '树洞帖子、通知这类外部文字作为数据交给模型，不会被当成指令。读过这类内容之后想记住什么，要你点头才保存。',
      },
      {
        title: '更新都有签名',
        body: '热更新由维护者私钥签名、从公开提交构建。没签名或签错的包，App 一律拒收。',
      },
      {
        title: '全部开源',
        body: 'App、插件和这个网站都是 MIT 协议。每一行代码都能读，也可以自己编译。',
      },
    ],
    diagram: {
      label: '示意图：手机直接连接学校服务和你选的模型服务，和我们的服务器之间没有连接。',
      direct: '直连，不走代理',
      chat: '对话，用你的 Key',
      vault: '安全存储',
      campus: '学校服务',
      model: '你选的模型服务',
      modelSub: 'DeepSeek / OpenAI 兼容',
      ours: '我们的服务器',
      oursSub: '看不到你的账号',
    },
  },
  developers: {
    title: '写一个插件，\n接上一项校园服务',
    lead: '学校没开放接口的服务，社区可以自己补上。插件用 YAML 步骤和安全的表达式描述请求和返回，登录、会话和权限都由 App 负责。用录好的测试跑一遍，推到 GitHub 就能分享。App 里的助手也能陪你一起写。',
    codeLabel: '插件源码',
    note: '官方「空闲教室」插件的真实源码，有删节。',
    links: {
      docs: { title: '插件开发文档', sub: '快速上手和语言参考' },
      marketplace: { title: '插件市场', sub: '所有能装的插件' },
      repo: { title: 'pku-harness-plugins', sub: 'SDK、插件和插件索引' },
    },
  },
  faq: {
    title: '常见问题',
    lead: '没找到答案？去 GitHub 问。',
    ask: '提一个 issue',
    items: [
      {
        id: 'cost',
        q: '要花钱吗？',
        a: 'App 免费、开源。对话用的是你自己的模型 Key（默认 DeepSeek，也可以接任何 OpenAI 兼容的服务），用多少由你和服务商直接结算，我们不经手。',
      },
      {
        id: 'password',
        q: '我的北大密码安全吗？',
        a: '学号、密码和手机令牌密钥都存在手机的系统安全存储里。App 在手机上直接登录学校系统，插件只拿到登录好的会话，拿不到密码。我们没有能看到你账号的服务器。',
      },
      {
        id: 'ios',
        q: '有 iPhone 版吗？',
        a: 'iOS 版正在准备。目前支持 Android 7.0 及以上的 arm64 手机。',
      },
      {
        id: 'network',
        q: '不在校园网能用吗？',
        a: '大部分功能都能用。少数学校服务只对校园网开放，比如财务门户，这类功能需要你连着校园网。',
      },
      {
        id: 'apk',
        q: '怎么确认安装包没被改过？',
        a: '每个 APK 都由 GitHub Actions 从打了标签的提交构建，用同一把密钥签名，发布说明里附有 APK 和证书指纹。热更新同样有签名，验不过的 App 不会安装。',
      },
    ],
  },
  cta: {
    title: '装上试试',
    latest: (tag: string, date: string) =>
      `最新版本 ${tag}，${date}发布。需要 Android 7.0 或更高版本，iOS 版在准备中。`,
    none: '暂时没取到最新版本信息。下载页和 GitHub Releases 上有所有版本。',
    download: (tag: string) => `下载 ${tag}`,
    downloadPage: '去下载页',
    github: '在 GitHub 上关注',
  },
};
