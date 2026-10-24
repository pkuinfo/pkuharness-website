/**
 * UI strings for the download pages. English defines the shape; Chinese must match it.
 * Inline `code` in a string is rendered as <code> by `Rich`.
 */
export const en = {
  meta: {
    title: 'Download',
    description:
      'Download PKU Harness for Android. This page has the signed APK, its SHA-256 checksum and signing certificate, the release notes and older versions. You can also build the app from source.',
    previewTitle: 'Download (preview)',
  },
  title: 'Download PKU Harness',
  lede: 'PKU Harness runs on Android 7.0 or later. It is free and open source.',
  previewBanner: 'This preview uses demo data. It is only available in the development environment.',

  latest: {
    stable: 'Latest version',
    prerelease: 'Preview version',
    released: (date: string) => `Released ${date}`,
    download: 'Download APK',
    arch: (a: string) => `For ${a} phones`,
    qr: 'Scan to download on your phone',
    qrAlt: (file: string) => `QR code for ${file}`,
    github: 'View this release on GitHub',
    installNote:
      'Android will ask you to allow your browser to install apps. Install packages only from this page or from the GitHub release page.',
  },

  verify: {
    title: 'Verify the file',
    lede: 'Compare these values with the file you downloaded. On a computer, you can compute the checksum with `sha256sum pku-harness-*.apk`.',
    sha256: 'File SHA-256',
    cert: 'Signing certificate SHA-256',
    certNote:
      'Every release is signed with this key. If you installed a build with a different signature, for example one you built from source, uninstall it first.',
    noSha: 'The release notes for this package do not include a checksum.',
    copy: (what: string) => `Copy ${what}`,
    copied: 'Copied',
  },

  facts: {
    versionCode: 'Version code',
    runtime: 'Runtime fingerprint (for over-the-air updates)',
    commit: 'Commit',
  },

  needs: {
    title: 'Requirements',
    items: [
      {
        title: 'Android 7.0 or later',
        body: 'API level 24 or higher, on a phone with an arm64 processor. An iOS version is planned.',
      },
      {
        title: 'A PKU account',
        body: 'The student ID and password you use for IAAA, the university’s unified sign-in. They are stored only in your phone’s secure storage.',
      },
      {
        title: 'An API key for an AI model',
        body: 'DeepSeek is the default. You can also enter the address and key of any OpenAI-compatible service.',
      },
      {
        title: 'The campus network, for some services',
        body: 'A few services, such as the finance portal, only respond on the campus network. The app connects to them directly, without a proxy.',
      },
    ],
  },

  updates: {
    title: 'How updates work',
    lede: 'You install the APK once. After that, most updates are delivered inside the app.',
    steps: [
      {
        title: 'Install the APK',
        body: 'Download it from this page or from GitHub. Each APK is built by GitHub Actions from a tagged commit and signed with the release key.',
      },
      {
        title: 'Over-the-air updates',
        body: 'Over-the-air (OTA) updates deliver new screens and bug fixes without a new APK. They come from our own update server. Our continuous integration (CI) builds them from public commits, and the maintainers sign them. The app rejects any update without a valid signature.',
      },
      {
        title: 'Plugin updates',
        body: 'Each plugin updates from the repository it was installed from. If an update asks for more permissions, the app asks you first.',
      },
      {
        title: 'New APKs for native changes',
        body: 'Changes such as new Android permissions or system features require a new APK. New APKs are published on this page and on GitHub.',
      },
    ],
    ios: 'iOS: the app already starts on an iPhone. Campus sign-in will work after the network module is ported to iOS.',
  },

  notes: {
    title: 'Release notes',
    from: 'From the GitHub release',
  },

  history: {
    title: 'All versions',
    current: 'Current',
    firstOnly: 'This is the first public release. Older versions will be listed here after new ones are released.',
    noApk: 'No APK attached',
  },

  soon: {
    unreachable: 'Could not reach GitHub',
    preparing: 'In preparation',
    title: 'The first public APK has not been released yet',
    bodyUnreachable:
      'This page reads the latest version from GitHub, but GitHub did not respond. You can open the release page directly, or build the app from source as described below.',
    body: 'When the APK is released, it will appear here with its checksum and a QR code. Until then, you can build the app from source and install it on your phone or an emulator.',
    watch: 'Watch releases on GitHub',
    build: 'Build from source',
  },

  build: {
    title: 'Build from source',
    lede: 'This section is for contributors and for anyone who prefers to compile the app. A build from source is signed with your own key, so uninstall the release APK first.',
    steps: [
      {
        title: 'Prepare your computer',
        body: 'Install Bun, JDK 17 and the Android SDK. Connect a phone with USB debugging turned on, or start an emulator.',
      },
      {
        title: 'Clone the repository with the plugins submodule',
        body: 'The plugins are in the `plugins/` submodule, so add `--recurse-submodules`.',
        cmd: 'git clone --recurse-submodules \\\n  https://github.com/pkuinfo/pku-harness.git\ncd pku-harness',
      },
      { title: 'Install dependencies', body: 'The project uses Bun for all JavaScript tooling.', cmd: 'bun install' },
      {
        title: 'Build and install',
        body: 'This command runs `expo run:android`. The first build takes a few minutes. After that, changes to the JavaScript code reload immediately.',
        cmd: 'bun run android',
      },
    ] as { title: string; body: string; cmd?: string }[],
    proxy:
      'If your computer uses a system proxy such as Clash, start the emulator without inheriting `HTTP_PROXY`. Otherwise the app cannot reach campus services.',
    readme: 'README',
    docs: 'installation guide',
    more: 'More details are in the',
    /** Joins the README link and the docs link; carries its own spaces. */
    and: ' and the ',
    end: '.',
    copy: 'Copy command',
  },
};

export const zh: typeof en = {
  meta: {
    title: '下载',
    description:
      '下载 PKU Harness 的 Android 版。本页提供签名的 APK、它的 SHA-256 校验值和签名证书、发布说明以及历史版本。你也可以从源码构建 App。',
    previewTitle: '下载（预览）',
  },
  title: '下载 PKU Harness',
  lede: 'PKU Harness 支持 Android 7.0 及以上版本，免费且开源。',
  previewBanner: '这是使用演示数据的预览页，只在开发环境中提供。',

  latest: {
    stable: '最新版',
    prerelease: '预览版',
    released: (date) => `发布于 ${date}`,
    download: '下载 APK',
    arch: (a) => `适用于 ${a} 手机`,
    qr: '用手机扫码下载',
    qrAlt: (file) => `${file} 的下载二维码`,
    github: '在 GitHub 上查看此版本',
    installNote: '安装时，Android 会请你允许浏览器安装应用。请只安装来自本页或 GitHub 发布页的安装包。',
  },

  verify: {
    title: '校验安装包',
    lede: '请用下面的值核对你下载的文件。在电脑上，可以用 `sha256sum pku-harness-*.apk` 计算校验值。',
    sha256: '文件 SHA-256',
    cert: '签名证书 SHA-256',
    certNote: '每个版本都用这把密钥签名。如果你安装过签名不同的版本（例如自己从源码构建的版本），需要先把它卸载。',
    noSha: '这个安装包的发布说明中没有提供校验值。',
    copy: (what) => `复制${what}`,
    copied: '已复制',
  },

  facts: {
    versionCode: '版本代码',
    runtime: '运行时指纹（用于热更新）',
    commit: '提交',
  },

  needs: {
    title: '运行要求',
    items: [
      { title: 'Android 7.0 或更高版本', body: 'API 级别 24 及以上，处理器为 arm64 的手机。iOS 版在计划中。' },
      {
        title: '北大账号',
        body: '即登录统一身份认证（IAAA）时使用的学号和密码。它们只保存在手机的安全存储中。',
      },
      { title: '模型的 API Key', body: '默认使用 DeepSeek，也可以填写任何兼容 OpenAI 接口的服务的地址和 Key。' },
      {
        title: '部分服务需要校园网',
        body: '少数服务（例如财务门户）只能在校园网内访问。App 会直接连接这些服务，不经过代理。',
      },
    ],
  },

  updates: {
    title: '更新方式',
    lede: 'APK 只需要安装一次，之后大部分更新都在 App 内完成。',
    steps: [
      {
        title: '安装 APK',
        body: '从本页或 GitHub 下载。每个 APK 都由 GitHub Actions 从带标签的提交构建，并用发布密钥签名。',
      },
      {
        title: '热更新',
        body: '热更新（OTA，over-the-air）不需要重新安装 APK，就能带来新的界面和问题修复。热更新来自我们自己的更新服务器，由持续集成（CI）从公开的提交构建，再由维护者签名。签名无效的更新，App 一律拒绝。',
      },
      {
        title: '插件更新',
        body: '每个插件从安装时所用的仓库更新。如果更新需要更多权限，App 会先询问你。',
      },
      {
        title: '原生改动需要新的 APK',
        body: '新增 Android 权限或系统功能这类改动，需要安装新的 APK。新的 APK 会发布在本页和 GitHub 上。',
      },
    ],
    ios: 'iOS：App 已经可以在 iPhone 上启动。网络模块移植到 iOS 之后，才能使用校园登录。',
  },

  notes: {
    title: '发布说明',
    from: '摘自 GitHub 发布页',
  },

  history: {
    title: '所有版本',
    current: '当前',
    firstOnly: '这是第一个公开版本。发布新版本之后，旧版本会列在这里。',
    noApk: '未附带 APK',
  },

  soon: {
    unreachable: '无法连接 GitHub',
    preparing: '准备中',
    title: '第一个公开版本尚未发布',
    bodyUnreachable:
      '本页从 GitHub 读取最新版本，但 GitHub 暂时没有响应。你可以直接打开发布页，或者按照下面的步骤从源码构建。',
    body: '发布之后，安装包、校验值和下载二维码会显示在这里。在此之前，你可以从源码构建 App，并安装到手机或模拟器上。',
    watch: '在 GitHub 上关注发布',
    build: '从源码构建',
  },

  build: {
    title: '从源码构建',
    lede: '这一部分适合参与开发的同学，以及想自己编译 App 的人。从源码构建的 App 使用你自己的签名，所以要先卸载正式版。',
    steps: [
      {
        title: '准备环境',
        body: '安装 Bun、JDK 17 和 Android SDK。连接一台已开启 USB 调试的手机，或者启动一个模拟器。',
      },
      {
        title: '克隆仓库及插件子模块',
        body: '插件位于 `plugins/` 子模块中，因此需要加上 `--recurse-submodules` 参数。',
        cmd: 'git clone --recurse-submodules \\\n  https://github.com/pkuinfo/pku-harness.git\ncd pku-harness',
      },
      { title: '安装依赖', body: '项目的 JavaScript 工具链统一使用 Bun。', cmd: 'bun install' },
      {
        title: '构建并安装',
        body: '这个命令会运行 `expo run:android`。第一次构建需要几分钟，之后修改 JavaScript 代码会立即生效。',
        cmd: 'bun run android',
      },
    ],
    proxy:
      '如果电脑开启了系统代理（例如 Clash），启动模拟器时不要继承 `HTTP_PROXY` 环境变量，否则 App 无法访问校园服务。',
    readme: 'README',
    docs: '安装文档',
    more: '更多细节见',
    and: ' 和',
    end: '。',
    copy: '复制命令',
  },
};
