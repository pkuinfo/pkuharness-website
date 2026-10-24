/**
 * UI strings for the download pages. English defines the shape; Chinese must match it.
 * Inline `code` in a string is rendered as <code> by `Rich`.
 */
export const en = {
  meta: {
    title: 'Download',
    description:
      'Download PKU Harness for Android: the signed APK, its SHA-256 and signing certificate, release notes and older versions. Or build it from source.',
    previewTitle: 'Download (preview)',
  },
  title: 'Get PKU Harness',
  lede: 'For Android 7.0 and later. Free and open source.',
  previewBanner: 'Preview with demo data. This page is only served in development.',

  latest: {
    stable: 'Latest',
    prerelease: 'Preview',
    released: (date: string) => `Released ${date}`,
    download: 'Download APK',
    arch: (a: string) => `${a} phones`,
    qr: 'Scan to download on your phone',
    qrAlt: (file: string) => `QR code for ${file}`,
    github: 'This release on GitHub',
    installNote:
      'Android will ask you to allow your browser to install apps. Only install packages from this page or the GitHub release page.',
  },

  verify: {
    title: 'Check the file',
    lede: 'Compare these with what you downloaded, e.g. `sha256sum pku-harness-*.apk` on a computer.',
    sha256: 'File SHA-256',
    cert: 'Signing certificate SHA-256',
    certNote:
      'Every release is signed with this same key. If you installed a build signed differently (say, one you built from source), uninstall it first.',
    noSha: 'This package’s release notes don’t include a checksum.',
    copy: (what: string) => `Copy ${what}`,
    copied: 'Copied',
  },

  facts: {
    versionCode: 'Version code',
    runtime: 'Runtime fingerprint (OTA)',
    commit: 'Commit',
  },

  needs: {
    title: 'What you need',
    items: [
      { title: 'Android 7.0 or later', body: 'API 24 and up, on an arm64 phone. An iOS version is planned.' },
      {
        title: 'Your PKU account',
        body: 'The student ID and password you use for IAAA. They stay in your phone’s secure storage.',
      },
      {
        title: 'An AI model key',
        body: 'DeepSeek by default, or the address and key of any OpenAI-compatible service.',
      },
      {
        title: 'Campus network, sometimes',
        body: 'A few services, like the finance portal, only answer on campus. The app connects directly, not through a proxy.',
      },
    ],
  },

  updates: {
    title: 'How updates work',
    lede: 'You install the APK once. Most updates arrive inside the app.',
    steps: [
      {
        title: 'Install the APK',
        body: 'From this page or GitHub. It’s built by GitHub Actions from the tagged commit and signed with the release key.',
      },
      {
        title: 'Updates arrive over the air',
        body: 'New screens and fixes come from our own update server. CI builds them from public commits and the maintainers sign them; the app rejects anything without a valid signature.',
      },
      {
        title: 'Plugins update from their links',
        body: 'Each plugin updates from the repo it was installed from. If an update asks for more, the app asks you first.',
      },
      {
        title: 'Native changes need a new APK',
        body: 'New Android permissions or system features ship as a new APK. It shows up here and on GitHub.',
      },
    ],
    ios: 'iOS: the app already starts on iPhone. Campus login waits on porting the network module.',
  },

  notes: {
    title: 'Release notes',
    from: 'From the GitHub release',
  },

  history: {
    title: 'All versions',
    current: 'Current',
    firstOnly: 'This is the first public release. Earlier builds will show up here as new versions come out.',
    noApk: 'No APK attached',
  },

  soon: {
    unreachable: 'Couldn’t reach GitHub',
    preparing: 'Getting ready',
    title: 'The first public APK is on its way',
    bodyUnreachable:
      'This page reads the latest version from GitHub and didn’t get an answer just now. Try the release page directly, or build from source below.',
    body: 'When it’s out, the APK, its checksum and a QR code will be here. Until then you can build it from source and install it on your phone or an emulator.',
    watch: 'Watch releases on GitHub',
    build: 'Build from source',
  },

  build: {
    title: 'Build from source',
    lede: 'For contributors, or if you’d rather compile it yourself. A source build is signed with your own key, so uninstall the release APK first.',
    steps: [
      {
        title: 'Set up',
        body: 'Install Bun, JDK 17 and the Android SDK. Plug in a phone with USB debugging on, or start an emulator.',
      },
      {
        title: 'Clone with the plugins submodule',
        body: 'Plugins live in the `plugins/` submodule, so pass `--recurse-submodules`.',
        cmd: 'git clone --recurse-submodules \\\n  https://github.com/pkuinfo/pku-harness.git\ncd pku-harness',
      },
      { title: 'Install dependencies', body: 'The project uses Bun throughout.', cmd: 'bun install' },
      {
        title: 'Build and install',
        body: 'Runs `expo run:android`. The first build takes a few minutes; after that, JS changes reload instantly.',
        cmd: 'bun run android',
      },
    ] as { title: string; body: string; cmd?: string }[],
    proxy:
      'If your computer runs a system proxy (Clash and the like), start the emulator without inheriting `HTTP_PROXY`, or the app can’t reach campus services.',
    readme: 'README',
    docs: 'Install guide',
    more: 'More in the',
    and: 'and the',
    copy: 'Copy command',
  },
};

export const zh: typeof en = {
  meta: {
    title: '下载',
    description: '下载 PKU Harness Android 版：签名的 APK、SHA-256 与签名证书、更新说明和历史版本；也可以从源码构建。',
    previewTitle: '下载（预览）',
  },
  title: '下载 PKU Harness',
  lede: '支持 Android 7.0 及以上，免费、开源。',
  previewBanner: '这是用演示数据生成的预览，只在开发环境里能打开。',

  latest: {
    stable: '最新版',
    prerelease: '预览版',
    released: (date) => `${date}发布`,
    download: '下载 APK',
    arch: (a) => `适用于 ${a} 手机`,
    qr: '用手机扫码下载',
    qrAlt: (file) => `${file} 的下载二维码`,
    github: '在 GitHub 上查看这个版本',
    installNote: '安装时 Android 会请你允许浏览器安装应用。只安装来自本页或 GitHub 发布页的安装包。',
  },

  verify: {
    title: '核对安装包',
    lede: '可以在电脑上用 `sha256sum pku-harness-*.apk` 算一下，和下面的值对比。',
    sha256: '文件 SHA-256',
    cert: '签名证书 SHA-256',
    certNote: '每个版本都用同一把密钥签名。如果你装过签名不同的版本（比如自己从源码编译的），要先卸载。',
    noSha: '这个安装包的发布说明里没有提供校验值。',
    copy: (what) => `复制${what}`,
    copied: '已复制',
  },

  facts: {
    versionCode: '版本号',
    runtime: '运行时指纹（热更新）',
    commit: '提交',
  },

  needs: {
    title: '你需要',
    items: [
      { title: 'Android 7.0 或更高', body: 'API 24 起，arm64 手机。iOS 版在计划中。' },
      { title: '北大账号', body: '统一身份认证的学号和密码，只保存在手机的安全存储里。' },
      { title: '一个模型 Key', body: '默认用 DeepSeek，也可以填任何 OpenAI 兼容服务的地址和 Key。' },
      { title: '部分服务要校园网', body: '比如财务门户只能在校园网内访问。App 直接连接，不走代理。' },
    ],
  },

  updates: {
    title: '之后怎么更新',
    lede: 'APK 只需要装一次，大部分更新都在 App 里完成。',
    steps: [
      {
        title: '装一次 APK',
        body: '从本页或 GitHub 下载。它由 GitHub Actions 从打了标签的提交构建，并用发布密钥签名。',
      },
      {
        title: '界面和修复走热更新',
        body: '新界面和问题修复从我们自己的更新服务器推送：CI 从公开提交构建、维护者签名，签名不对的更新 App 一律拒收。',
      },
      {
        title: '插件从各自的链接更新',
        body: '每个插件从安装时的仓库更新。如果更新要更多权限，App 会先问你。',
      },
      {
        title: '原生改动才发新 APK',
        body: '新的 Android 权限或系统能力需要重新安装 APK，会出现在本页和 GitHub 发布页。',
      },
    ],
    ios: 'iOS：App 已经能在 iPhone 上启动，校园登录要等网络模块移植完成。',
  },

  notes: {
    title: '发布说明',
    from: '摘自 GitHub 发布页',
  },

  history: {
    title: '所有版本',
    current: '当前',
    firstOnly: '这是第一个公开版本。以后发布新版本，旧版本会列在这里。',
    noApk: '没有附带 APK',
  },

  soon: {
    unreachable: '暂时连不上 GitHub',
    preparing: '准备中',
    title: '首个公开安装包快要发布了',
    bodyUnreachable: '这一页从 GitHub 读取最新版本，刚才没有读到。可以直接去发布页看看，或者按下面的步骤从源码构建。',
    body: '发布后，安装包、校验值和下载二维码会出现在这里。在那之前，你可以从源码构建，装到自己的手机或模拟器上。',
    watch: '关注 GitHub 发布',
    build: '从源码构建',
  },

  build: {
    title: '从源码构建',
    lede: '适合想参与开发、或者想自己编译的同学。源码构建用的是你自己的签名，所以要先卸载正式版。',
    steps: [
      {
        title: '准备环境',
        body: '安装 Bun、JDK 17 和 Android SDK，准备一台开了 USB 调试的手机，或者一个 Android 模拟器。',
      },
      {
        title: '克隆仓库（带上插件子模块）',
        body: '插件在 `plugins/` 子模块里，所以要加 `--recurse-submodules`。',
        cmd: 'git clone --recurse-submodules \\\n  https://github.com/pkuinfo/pku-harness.git\ncd pku-harness',
      },
      { title: '安装依赖', body: '项目统一用 Bun。', cmd: 'bun install' },
      {
        title: '构建并装到设备上',
        body: '也就是 `expo run:android`。第一次构建要几分钟，之后改 JS 会立即刷新。',
        cmd: 'bun run android',
      },
    ],
    proxy: '如果电脑开着系统代理（Clash 之类），启动模拟器时不要继承 `HTTP_PROXY`，否则 App 连不上校园服务。',
    readme: 'README',
    docs: '安装文档',
    more: '更多细节见',
    and: '和',
    copy: '复制命令',
  },
};
