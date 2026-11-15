/**
 * UI strings for the root page (`/`, `/en`): a WebGL particle piece with almost no text. English
 * defines the shape; Chinese must match it. The three large words are the three adjectives of the
 * product's one-line description.
 */
export const en = {
  meta: {
    title: 'PKU harness',
    description:
      'PKU harness is an open-source Android app that helps Peking University students with campus services. This page is an interactive particle animation; the home page explains the app.',
  },
  /** For screen readers: what the canvas shows. */
  label:
    'An interactive particle animation. As you scroll, the particles form a sphere, a galaxy, a wave with bouncing balls, the Boya Pagoda, the PKU harness bird and the name PKU harness.',
  enter: 'Go to the home page',
  otherLang: '中文',
  scroll: 'Scroll',
  hint: 'Move the pointer. Click for a shockwave.',
  hintTouch: 'Drag to move the particles. Tap for a shockwave.',
  words: ['Pluggable', 'Keyless', 'Unified'],
  forms: ['Sphere', 'Galaxy', 'Wave', 'Boya Pagoda', 'Swallow', 'PKU harness'],
  particles: 'particles',
  motionOff: 'Turn off animation',
  motionOn: 'Turn on animation',
  slow: 'The animation is not running smoothly on this device.',
  tagline: 'A pluggable, keyless, unified agent harness on your phone.',
};

export const zh: typeof en = {
  meta: {
    title: 'PKU harness',
    description:
      'PKU harness 是一个帮助北大学生处理校园事务的开源 Android 应用。这个页面是一段可以互动的粒子动画，应用的介绍在主页。',
  },
  label:
    '一段可以互动的粒子动画。向下滚动时，粒子依次组成球体、星系、带弹跳小球的波浪、博雅塔、PKU harness 的燕子标志和「PKU harness」字样。',
  enter: '进入主页',
  otherLang: 'English',
  scroll: '向下滚动',
  hint: '移动指针试试，点击会产生冲击波。',
  hintTouch: '拖动可以拨开粒子，轻点会产生冲击波。',
  words: ['可插拔', '免密钥', '一体化'],
  forms: ['球体', '星系', '波浪', '博雅塔', '燕子', 'PKU harness'],
  particles: '个粒子',
  motionOff: '关闭动效',
  motionOn: '开启动效',
  slow: '动画在这台设备上不够流畅。',
  tagline: '装在手机上的可插拔、免密钥、一体化智能体。',
};
