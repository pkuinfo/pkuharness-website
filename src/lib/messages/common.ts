/** Shared UI strings (nav, footer, language names). English defines the shape; Chinese must match it. */
export const en = {
  nav: { docs: 'Docs', marketplace: 'Marketplace', download: 'Download' },
  footer: {
    tagline: 'An open-source, AI-native app for campus life at Peking University.',
    product: 'Product',
    source: 'Source',
    community: 'Community',
    org: 'GitHub organization',
    issues: 'Report an issue',
    contributing: 'Contributing',
    security: 'Security',
    thisSite: 'This website',
    license: 'MIT License. Built and maintained by the pkuinfo community.',
    disclaimer:
      'A student community project, not an official product of Peking University. The name and emblem of Peking University belong to the university.',
  },
};

export const zh: typeof en = {
  nav: { docs: '文档', marketplace: '插件市场', download: '下载' },
  footer: {
    tagline: '北大校园生活的 AI 原生 App，开源免费。',
    product: '产品',
    source: '源代码',
    community: '社区',
    org: 'GitHub 组织',
    issues: '反馈问题',
    contributing: '参与贡献',
    security: '安全问题',
    thisSite: '本网站',
    license: 'MIT 协议，由 pkuinfo 社区开发和维护。',
    disclaimer: '学生社区的开源项目，不是北京大学官方产品。“北京大学”名称与标识归北京大学所有。',
  },
};
