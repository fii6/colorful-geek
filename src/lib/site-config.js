// Single source of truth for site + theme settings.
// Mirrors Hexo's _config.yml + themes/colorful-geek/_config.yml.

export const siteConfig = {
  url: 'https://ericlee.pages.dev',
  title: 'Colorful Geek',
  subtitle: 'A terminal-style blog',
  description: 'GitHub Dark terminal-style Astro blog theme',
  keywords: 'astro, terminal, github-dark, blog',
  author: 'Eric Lee',
  language: 'zh-CN',
  date_format: 'YYYY-MM-DD',
  per_page: 6,
  feed: { path: '/atom.xml' },
};

export const themeConfig = {
  brand: {
    title: 'Colorful Geek',
    window_controls: true,
    logo_text: '>_',
  },

  header: {
    show_search: true,
    show_theme_toggle: true,
  },

  menu: {
    home: '/',
    archives: '/archives/',
    categories: '/categories/',
    links: '/links/',
  },

  sidebar: {
    enable: true,
    position: 'right',
    widgets: ['profile', 'categories', 'tags'],
    show_on: ['home'],
  },

  profile: {
    enable: true,
    avatar: 'https://myimgbed.pages.dev/file/1746291377487_file-8bwdCTifiX9rZRgLns5P3T.webp',
    username: 'Eric Lee',
    bio: '我是风，自由的风。',
    social: {
      twitter: 'https://x.com/x_ericlee',
      telegram: 'https://t.me/null',
      email: 'mailto:ericlee@outlook.be',
    },
  },

  post: {
    toc: false,
    toc_max_depth: 3,
    reading_progress: true,
    reading_time: false,
    word_count: false,
    copy_code: true,
    related_posts: 5,
    show_updated: true,
    fancybox: true,
    external_link: true,
    heading_anchors: true,
    callouts: true,
    lang_badge: true,
  },

  license: {
    enable: true,
    type: 'by-nc-sa', // by | by-sa | by-nc | by-nc-sa | by-nd | by-nc-nd | zero
    version: '4.0',
    // url: ''  // optional override
  },

  reward: {
    enable: false,
    title: '请作者喝杯咖啡 ☕',
    description: '如果觉得这篇文章对你有帮助,可以请我喝杯咖啡 ❤️',
    methods: [
      // { name: '微信', qrcode: '/img/reward-wechat.png' },
    ],
  },

  back_to_top: {
    enable: true,
    threshold: 320,
  },

  search: {
    enable: true,
    hotkey: '/',
  },

  appearance: {
    default_mode: 'light', // 'dark' | 'light'
    toggle: true,
    font_mono: '"JetBrains Mono", "Fira Code", "SFMono-Regular", "Menlo", "Consolas", monospace',
    font_sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    title_font_family:
      '"LXGW WenKai", "霞鹜文楷", "Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif',
    accent: '#58a6ff',
    theme_color: '#0d1117',
    title_separator: ' · ',
    article_font_url: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/style.css',
    article_font_family:
      '"Microsoft YaHei", "微软雅黑", "PingFang SC", "Hiragino Sans GB", sans-serif',
  },

  custom_css: ['https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'],
  custom_js: [],

  footer: {
    copyright: '&copy; 2026 Eric All Rights reserved.',
    show_powered_by: true,
    links: [],
  },

  friend_links: [
    {
      name: 'Linux Do 社区',
      url: 'https://linux.do',
      avatar:
        'https://linux.do/uploads/default/optimized/3X/9/d/9dd49731091ce8656e94433a26a3ef36062b3994_2_180x180.png',
      description: '真诚、友善、团结的技术社区',
    },
  ],

  favicon: '/img/favicon.svg',
  since: '2024-02-03',
};
