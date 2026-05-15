---
title: "colorful-geek 主题介绍与使用说明"
date: 2026-05-15 10:00:00
updated: 2026-05-15 10:00:00
categories: 主题
tags:
  - astro
  - 博客主题
  - colorful-geek
  - 使用指南
---

`colorful-geek` 主题，灵感源自 GitHub Dark 终端界面：黑色窗口、红黄绿三色按钮、等宽字体的命令行美学。使用 [Astro 5](https://astro.build)框架，静态生成 ，现代构建链。

> [!NOTE]
> 本文使用主题自身渲染，所有展示效果都来自当前页面。

## 特性一览

- **GitHub Dark 终端外壳**：标题栏 + 三色窗口控件，亮 / 暗双主题一键切换，状态写入 `localStorage`
- **侧边栏组件**：个人资料、分类、标签三个内置 widget，可按页面类型分别启用
- **文章增强**：自动目录 (TOC)、阅读进度条、相关文章、上下篇导航、版权 / 打赏卡片
- **Markdown 扩展**：GitHub `> [!NOTE/TIP/IMPORTANT/WARNING/CAUTION]` 提示框、标题锚点、代码复制按钮、语言徽标
- **可视化与公式**：内置 Mermaid 图表、KaTeX 数学公式、Fancybox 图片灯箱
- **全站搜索**：基于 Pagefind 的静态索引，按 `/` 召出搜索浮层
- **完善的索引页**：归档、分类、标签、友链、404、RSS、Sitemap 一应俱全

## 快速开始

主题本体就是一个可直接运行的 Astro 项目。克隆下来即可：

```bash
git clone https://github.com/fii6/colorful-geek.git
cd colorful-geek
npm install
npm run dev
```

启动后访问 <http://localhost:4321/> 即可看到本地预览。

## 生产构建

```bash
npm run build      # 构建静态文件 + 生成 Pagefind 索引
npm run preview    # 本地预览 dist/ 产物
```

构建产物会输出到 `dist/`，可直接部署到 Cloudflare Pages、Vercel、Netlify、GitHub Pages 等任何静态托管平台。

## 站点与主题配置

所有配置集中在 `src/lib/site-config.js`。下面列出几个高频字段：

```js
// src/lib/site-config.js
export const siteConfig = {
  url: 'https://example.com',
  title: 'Colorful Geek',
  author: 'Your Name',
  description: '一句话描述',
  language: 'zh-CN',           // 'zh-CN' 或 'en'
  per_page: 6,
};

export const themeConfig = {
  brand: { title: 'Colorful Geek', logo_text: '>_' },
  menu: {
    home: '/',
    archives: '/archives/',
    categories: '/categories/',
    links: '/links/',
  },
  profile: {
    enable: true,
    avatar: '/img/avatar.png',
    username: 'Your Name',
    bio: '一句话签名',
    social: {
      twitter: 'https://x.com/yourname',
      email: 'mailto:you@example.com',
    },
  },
  appearance: {
    default_mode: 'light',     // 默认主题: 'light' | 'dark'
    accent: '#58a6ff',
  },
  // ...
};
```

修改后保存，`astro dev` 会自动热重载。

## 写作

文章放在 `src/content/posts/` 下，扩展名支持 `.md` 与 `.mdx`，frontmatter 字段如下：

```yaml
---
title: 我的第一篇文章
date: 2026-05-15 10:00:00
updated: 2026-05-15 12:00:00
categories: 随笔            # 字符串或数组都行
tags: [astro, blog]
description: 短摘要,用于列表页与 SEO
cover: https://example.com/cover.jpg
license: true              # 该篇关闭 CC 卡片可设为 false
reward: true               # 该篇关闭打赏卡片可设为 false
draft: false               # true 时该文不会出现在生产构建中
---
```

静态页面（关于、友链等）放在 `src/content/pages/`，frontmatter 只需 `title` 与可选的 `description`。

## 部署

以 Cloudflare Pages 为例：

1. 把本仓库 fork 到自己的 GitHub
2. 在 Cloudflare Pages 新建项目，连接到该仓库
3. 构建命令填 `npm run build`，输出目录填 `dist`
4. 触发首次构建后绑定自定义域名即可

其他平台同理，只要支持 Node + 静态托管就行。

## 目录速查

| 目录 / 文件 | 作用 |
| --- | --- |
| `src/content/posts/` | 博客文章 |
| `src/content/pages/` | 静态页面（如关于） |
| `src/lib/site-config.js` | 站点 + 主题配置 |
| `src/components/` | 主题组件（Footer、Sidebar、Header 等） |
| `src/layouts/BaseLayout.astro` | 页面外壳 |
| `src/pages/` | 路由与列表页 |
| `public/` | 直接复制到根的静态资源 |
| `astro.config.mjs` | Markdown / Mermaid / KaTeX 插件链 |

## 下一步

下一篇文章会逐项展示主题对 Markdown、Mermaid、KaTeX 的渲染效果，可以直接当成"样式对照表"翻看。

仓库地址：<https://github.com/fii6/colorful-geek>
