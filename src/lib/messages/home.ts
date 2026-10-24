/** UI strings for the home page. English defines the shape; Chinese must match it. */
export const en = {
  meta: {
    title: 'PKU Harness: an AI assistant for PKU students',
    description:
      'PKU Harness is an open-source Android app. After you sign in with your PKU account, you can ask its assistant for a free classroom, the next shuttle or your campus card balance. Each campus service is provided by a plugin.',
  },
  hero: {
    /** Two lines; each must fit on one line at 390 px. */
    title: ['An AI assistant', 'for PKU students'],
    lead: 'PKU Harness is an open-source Android app. You sign in with your PKU account once. After that, you can ask it in a chat to find a free classroom, check how busy the canteens are, look up the next shuttle or show your campus card balance. The app gets this information from the university’s own systems.',
    download: 'Download for Android',
    docs: 'Read the docs',
    source: 'Source code',
    released: (tag: string) => `${tag} released`,
    android: 'Requires Android 7.0 or later',
    license: 'Free, MIT license',
  },
  media: {
    play: 'Play recording',
    pause: 'Pause recording',
  },
  tour: {
    title: 'The four tabs of the app',
    lead: 'The app has four tabs: Chat, Dashboard, Schedule and Settings. Anything you can do by tapping on a page, the assistant can also do for you from the chat.',
    examplesLabel: 'Examples of what you can say',
    chapters: {
      chat: {
        name: 'Chat',
        title: 'Answers shown as cards and forms',
        body: 'The assistant uses plugins to look things up in the university’s systems. It shows the results as native cards, forms and pickers. When it needs your confirmation or more details, you answer by tapping inside the conversation.',
        examples: [
          'Which rooms in the Second Teaching Building are free tomorrow morning?',
          'Is Xuewu canteen busy right now?',
          'When is the next shuttle to Xinyanyuan?',
        ],
      },
      dashboard: {
        name: 'Dashboard',
        title: 'A dashboard for the numbers you check often',
        body: 'Tell the assistant which numbers you want to follow, such as your campus card balance, network fee or how busy the canteens are. It builds a widget for each one, and the widgets refresh on their own. The assistant can also run a check on a schedule and notify you at the exact minute.',
        examples: [
          'Put my campus card balance on the dashboard.',
          'Check my network fee every morning at 8 and tell me if it is under ¥10.',
        ],
      },
      schedule: {
        name: 'Schedule',
        title: 'Timetable, to-dos and reminders',
        body: 'Your timetable is synced from the university. You can describe a to-do or a reminder in your own words, including how often it repeats. The system alarm clock delivers each reminder at the exact minute.',
        examples: [
          'Remind me to hand in the problem set on Thursday at 3 pm.',
          'Remind me to water the plants every 3 days, 16 times, then stop.',
        ],
      },
      settings: {
        name: 'Settings',
        title: 'Permissions for each plugin',
        body: 'The Settings tab holds only what needs its own screen: your PKU account, your AI model provider and your plugins. Plugin actions are grouped into four kinds: Read, Change, Money and Public. For each plugin, you set every kind to Allow, Ask first or Never.',
        examples: ['Always ask me before spending money.', 'Ask me before posting anything to Treehole.'],
      },
    },
  },
  plugins: {
    title: 'What a plugin is',
    lead: 'Each campus service in the app is provided by a plugin. A plugin is a folder with a file called PLUGIN.md, which lists the websites the plugin may contact and the tools it provides. The app reads this file and follows it, and no plugin code runs on your phone. To share a plugin, you send a link.',
    points: [
      {
        title: 'Installing from a link',
        body: 'Send a friend the plugin’s GitHub link or QR code. They open it in the app to install the plugin. Later updates come from the same link.',
      },
      {
        title: 'Reviewing a plugin before you install it',
        body: 'Before installing, the app lists the websites and campus services the plugin can reach. It also shows the kind of each tool: Read, Change, Money or Public.',
      },
      {
        title: 'The same rules for official and community plugins',
        body: 'Official plugins are written in the same plugin language as community plugins and follow the same permission rules. A built-in plugin cannot do anything that a plugin you write yourself could not.',
      },
    ],
    count: (n: number) => `The marketplace has ${n} plugins`,
    browse: 'Browse the marketplace',
    remote: 'Remote',
  },
  trust: {
    title: 'Privacy and security',
    lead: 'The app signs in to campus services directly from your phone. None of our servers can see your PKU account. The code that does this is open source, so you can read it.',
    points: [
      {
        title: 'Your credentials stay on the phone',
        body: 'Your student ID, password and authenticator secret are kept in the system’s secure storage. Plugins never get your password. The app signs in for them and gives each plugin only a session for the service it uses.',
      },
      {
        title: 'You choose the AI model',
        body: 'The app uses DeepSeek by default. You can also use any provider with an OpenAI-compatible API. Your chats go from your phone straight to that provider, and your API key never passes through our servers.',
      },
      {
        title: 'Permissions by kind of action',
        body: 'For each plugin, you set Read, Change, Money and Public separately. Scheduled checks that run in the background can only read. They never take an action for you.',
      },
      {
        title: 'Campus content is treated as data',
        body: 'Text from campus websites, such as Treehole posts and notices, reaches the model as data, and the model does not follow instructions written in it. If the assistant wants to remember something after reading such text, it waits for your approval.',
      },
      {
        title: 'Signed updates',
        body: 'Over-the-air (OTA) updates are app updates that download inside the app, without a new APK. They are built from public commits and signed with the maintainers’ private key. The app rejects any update without a valid signature.',
      },
      {
        title: 'Open source',
        body: 'The app, the plugins and this website are released under the MIT license. You can read all of the code or build the app yourself.',
      },
    ],
    diagram: {
      label:
        'Diagram: the phone connects directly to campus services and to the model provider you chose. It has no connection to our server.',
      direct: 'direct, no proxy',
      chat: 'chats, with your key',
      vault: 'secure storage',
      campus: 'Campus services',
      model: 'Your model provider',
      modelSub: 'DeepSeek or compatible',
      ours: 'Our server',
      oursSub: 'cannot see your account',
    },
  },
  developers: {
    title: 'Writing a plugin for a campus service',
    lead: 'Many university services have no public API. Anyone can connect such a service to the app by writing a plugin. A plugin describes its requests and results as YAML steps with safe expressions, and the app handles sign-in, sessions and permissions. You test a plugin by replaying recorded responses, then push it to GitHub to share it. The assistant in the app can help you write one.',
    codeLabel: 'Plugin source',
    note: 'Source of the official Free classrooms plugin, shortened.',
    links: {
      docs: { title: 'Build a plugin', sub: 'Quick start and language reference' },
      marketplace: { title: 'Marketplace', sub: 'All plugins you can install' },
      repo: { title: 'pku-harness-plugins', sub: 'SDK, plugins and the plugin index' },
    },
  },
  faq: {
    title: 'Frequently asked questions',
    lead: 'If your question is not answered here, you can ask on GitHub.',
    ask: 'Open an issue',
    items: [
      {
        id: 'cost',
        q: 'Does it cost anything?',
        a: 'The app is free and open source. Chats use your own API key from a model provider, which is DeepSeek by default or any OpenAI-compatible provider. You pay the provider directly for what you use, and we are not involved in the payment.',
      },
      {
        id: 'password',
        q: 'Is my PKU password safe?',
        a: 'Your student ID, password and authenticator secret stay in the phone’s secure storage. The app signs in to campus systems from the phone. Plugins receive only the signed-in sessions, never the password. We do not run any server that can see your account.',
      },
      {
        id: 'ios',
        q: 'Is there an iPhone version?',
        a: 'Not yet. iOS support is being prepared. The app currently runs on arm64 Android phones with Android 7.0 or later.',
      },
      {
        id: 'network',
        q: 'Does it work off campus?',
        a: 'Most features do. A few university services, such as the finance portal, only respond on the campus network. To use those features, you need to be connected to it.',
      },
      {
        id: 'apk',
        q: 'How can I check that the APK has not been modified?',
        a: 'Every APK is built by GitHub Actions from a tagged commit and signed with the same key. The release notes list the fingerprints of the APK and of the signing certificate. Over-the-air updates are signed too, and the app rejects any update that fails the check.',
      },
    ],
  },
  cta: {
    title: 'Install the app',
    latest: (tag: string, date: string) =>
      `The latest version is ${tag}, released on ${date}. It requires Android 7.0 or later. An iOS version is being prepared.`,
    none: 'The latest release information could not be loaded. All versions are available on the download page and on GitHub Releases.',
    download: (tag: string) => `Download ${tag}`,
    downloadPage: 'Open the download page',
    github: 'Star on GitHub',
  },
};

export const zh: typeof en = {
  meta: {
    title: 'PKU Harness：北大学生的 AI 校园助手',
    description:
      'PKU Harness 是一个开源的 Android 应用。用北大账号登录后，你可以请其中的助手查空闲教室、下一班校车或校园卡余额。每项校园服务都由一个插件提供。',
  },
  hero: {
    title: ['北大学生的', 'AI 校园助手'],
    lead: 'PKU Harness 是一个开源的 Android 应用。你只需用北大账号登录一次，之后就可以在对话中请它查找空闲教室、查看食堂的就餐人数、查询下一班校车，或者显示校园卡余额。这些信息由 App 直接从学校的系统中取得。',
    download: '下载 Android 版',
    docs: '阅读文档',
    source: '源代码',
    released: (tag: string) => `${tag} 已发布`,
    android: '需要 Android 7.0 及以上版本',
    license: '免费，MIT 协议',
  },
  media: {
    play: '播放录屏',
    pause: '暂停录屏',
  },
  tour: {
    title: 'App 的四个标签页',
    lead: 'App 有四个标签页：对话、看板、日程和设置。凡是你能在页面上点按完成的操作，助手都可以在对话中替你完成。',
    examplesLabel: '你可以这样说',
    chapters: {
      chat: {
        name: '对话',
        title: '用卡片和表单展示回答',
        body: '助手通过插件到学校的系统中查询，再把结果显示为原生的卡片、表单和选择器。需要你确认或补充信息时，直接在对话中点选即可。',
        examples: ['明天上午二教哪些教室空着？', '学五食堂现在人多吗？', '下一班去新燕园的校车是几点？'],
      },
      dashboard: {
        name: '看板',
        title: '在看板上查看常用的数据',
        body: '告诉助手你想关注哪些数据，例如校园卡余额、网费或食堂的就餐人数，它会为每项数据生成一个小组件。小组件会自动刷新。助手还可以按计划定时检查，并在指定的时刻准时通知你。',
        examples: ['把校园卡余额放到看板上', '每天早上 8 点查一次网费，低于 10 元就提醒我'],
      },
      schedule: {
        name: '日程',
        title: '课表、待办和提醒',
        body: '课表从教务系统同步。待办和提醒可以用自己的话来描述，包括多久重复一次。每条提醒都由系统闹钟按分钟准时送达。',
        examples: ['周四下午 3 点提醒我交习题', '每 3 天提醒我浇一次花，一共 16 次'],
      },
      settings: {
        name: '设置',
        title: '每个插件的权限',
        body: '设置页只保留需要单独界面的内容：北大账号、模型服务和插件。插件的操作分为读取、修改、资金和公开四类。对于每个插件，你可以把每一类分别设为「直接执行」「每次询问」或「禁止」。',
        examples: ['涉及资金的操作每次都先问我', '往树洞发帖之前先让我确认'],
      },
    },
  },
  plugins: {
    title: '插件是什么',
    lead: 'App 中的每项校园服务都由一个插件提供。插件是一个文件夹，里面有一个名为 PLUGIN.md 的文件，写明插件可以访问哪些网站、提供哪些工具。App 读取这个文件并按其中的说明执行，手机上不会运行插件自带的代码。因此，分享插件只需要发送一个链接。',
    points: [
      {
        title: '通过链接安装',
        body: '把插件的 GitHub 链接或二维码发给同学，对方在 App 中打开就能安装。之后的更新也来自这个链接。',
      },
      {
        title: '安装前查看插件的权限',
        body: '安装之前，App 会列出插件能访问的网站和校园服务，并标明每个工具属于读取、修改、资金还是公开。',
      },
      {
        title: '官方插件与社区插件规则相同',
        body: '官方插件和社区插件使用同一种插件语言，遵守同一套权限规则。内置插件能做的事，你自己编写的插件也能做。',
      },
    ],
    count: (n: number) => `插件市场目前有 ${n} 个插件`,
    browse: '浏览插件市场',
    remote: '远程',
  },
  trust: {
    title: '隐私与安全',
    lead: 'App 在你的手机上直接登录学校服务，我们的服务器看不到你的北大账号。完成这些工作的代码全部开源，你可以自己阅读。',
    points: [
      {
        title: '凭据只保存在手机上',
        body: '学号、密码和手机令牌密钥保存在系统的安全存储中。插件拿不到你的密码。App 会替插件登录，只把对应服务的会话交给它。',
      },
      {
        title: '自己选择模型服务',
        body: 'App 默认使用 DeepSeek，也可以接入任何兼容 OpenAI 接口的服务。对话从手机直接发送到你选择的服务商，API Key 不经过我们的服务器。',
      },
      {
        title: '按操作类型授权',
        body: '每个插件的读取、修改、资金和公开四类操作分别设置。在后台运行的定时检查只能读取，不会替你执行任何操作。',
      },
      {
        title: '校园内容只作为数据',
        body: '树洞帖子、通知等来自校园网站的文字会作为数据交给模型，模型不会执行其中写的指令。助手读过这类内容之后如果想记住什么，需要你同意才会保存。',
      },
      {
        title: '更新带有签名',
        body: '热更新（OTA，over-the-air）是不需要重新安装 APK、直接在 App 内下载的更新。它们从公开的提交构建，并用维护者的私钥签名。签名无效的更新，App 一律拒绝。',
      },
      {
        title: '全部开源',
        body: 'App、插件和本网站都以 MIT 协议发布。你可以阅读全部代码，也可以自己编译 App。',
      },
    ],
    diagram: {
      label: '示意图：手机直接连接学校服务和你选择的模型服务，与我们的服务器之间没有连接。',
      direct: '直连，不经过代理',
      chat: '对话，使用你的 Key',
      vault: '安全存储',
      campus: '学校服务',
      model: '你选择的模型服务',
      modelSub: 'DeepSeek 或兼容服务',
      ours: '我们的服务器',
      oursSub: '看不到你的账号',
    },
  },
  developers: {
    title: '为校园服务编写插件',
    lead: '很多学校服务没有公开的接口。任何人都可以编写插件，把这类服务接入 App。插件用 YAML 步骤和安全的表达式描述请求与返回结果，登录、会话和权限则由 App 负责。写好之后，用录制好的响应回放测试，再推送到 GitHub，就可以分享给别人。App 里的助手也可以帮你编写插件。',
    codeLabel: '插件源码',
    note: '官方「空闲教室」插件的源码，有删节。',
    links: {
      docs: { title: '插件开发文档', sub: '快速上手与语言参考' },
      marketplace: { title: '插件市场', sub: '所有可以安装的插件' },
      repo: { title: 'pku-harness-plugins', sub: 'SDK、插件和插件索引' },
    },
  },
  faq: {
    title: '常见问题',
    lead: '如果这里没有你要找的答案，可以在 GitHub 上提问。',
    ask: '提交 issue',
    items: [
      {
        id: 'cost',
        q: '需要付费吗？',
        a: 'App 免费且开源。对话使用你自己的模型 API Key（默认是 DeepSeek，也可以是任何兼容 OpenAI 接口的服务），费用由你直接向服务商支付，我们不经手。',
      },
      {
        id: 'password',
        q: '我的北大密码安全吗？',
        a: '学号、密码和手机令牌密钥都保存在手机的系统安全存储中。App 在手机上直接登录学校系统，插件只能拿到登录后的会话，拿不到密码。我们没有任何能看到你账号的服务器。',
      },
      {
        id: 'ios',
        q: '有 iPhone 版吗？',
        a: '还没有，iOS 版正在准备中。目前 App 支持系统为 Android 7.0 及以上的 arm64 手机。',
      },
      {
        id: 'network',
        q: '不在校园网内能用吗？',
        a: '大部分功能可以使用。少数学校服务只能在校园网内访问，例如财务门户，使用这类功能时需要连接校园网。',
      },
      {
        id: 'apk',
        q: '如何确认安装包没有被篡改？',
        a: '每个 APK 都由 GitHub Actions 从带标签的提交构建，并用同一把密钥签名。发布说明中列出了 APK 和签名证书的指纹。热更新同样带有签名，App 会拒绝所有验证失败的更新。',
      },
    ],
  },
  cta: {
    title: '安装 App',
    latest: (tag: string, date: string) =>
      `最新版本是 ${tag}，发布于 ${date}。需要 Android 7.0 或更高版本，iOS 版正在准备中。`,
    none: '暂时无法获取最新版本的信息。所有版本都可以在下载页和 GitHub Releases 上找到。',
    download: (tag: string) => `下载 ${tag}`,
    downloadPage: '打开下载页',
    github: '在 GitHub 上收藏',
  },
};
