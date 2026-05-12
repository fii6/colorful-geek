# theme-colorful-geek-astro

GitHub Dark terminal-style blog, ported from the Hexo theme `colorful-geek` to Astro 5.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:4321/

## Build

```bash
npm run build
npm run preview
```

`npm run build` produces `dist/` and runs Pagefind to generate the static search index inside it.

If you're on a platform where the Pagefind binary isn't published (e.g. Android/Termux on arm64), use:

```bash
npm run build:site   # astro build only — Pagefind step skipped
npm run index        # run later on a supported host (linux/mac x86_64/arm64)
```

The site itself builds & previews fine without the index; the search overlay will say "search index unavailable" until `npm run index` has been run against `dist/`.

## Site & theme configuration

All configuration lives in `src/lib/site-config.js`. The shape mirrors the Hexo `_config.yml` + theme `_config.yml`:

- `siteConfig.url`, `title`, `author`, `description`, `language` — top-level site
- `themeConfig.brand`, `header`, `menu`, `sidebar`, `profile`, `post`, `license`, `reward`, `appearance`, `footer`, `friend_links`, `favicon`, `since`

Edit the file and restart the dev server.

## Content

Posts live under `src/content/posts/*.md` (or `.mdx`). Frontmatter:

```yaml
---
title: My post
date: 2026-05-11 10:00:00
updated: 2026-05-11 12:00:00
categories: Android        # string or array
tags: [cloudflare, tunnel]
description: short summary
cover: https://example.com/cover.jpg
license: true              # set false to suppress the CC card on this post
reward: true               # set false to suppress reward card on this post
draft: false
---
```

Static pages live under `src/content/pages/*.md`.

## Features

- GitHub-dark terminal shell, light/dark toggle, persisted in `localStorage`
- Sidebar widgets: profile, categories, tags
- Per-post TOC with scrollspy, reading-progress bar, related posts, prev/next nav
- GitHub-style `> [!NOTE/TIP/IMPORTANT/WARNING/CAUTION]` callouts
- Heading anchors, copy-code buttons, language badge on code blocks
- Pagefind full-site search (`/` to open the overlay)
- Fancybox image lightbox in post bodies
- License (CC) and Reward cards, both opt-out per post via frontmatter
- 404 page, archives, categories/tags index + per-taxonomy listings
- Friend-links page, RSS feed, sitemap

## Layout map (Hexo → Astro)

| Hexo template                       | Astro file                              |
|-------------------------------------|------------------------------------------|
| `layout/layout.ejs`                 | `src/layouts/BaseLayout.astro`           |
| `layout/_partial/head.ejs`          | `src/components/Head.astro`              |
| `layout/_partial/header.ejs`        | `src/components/Header.astro`            |
| `layout/_partial/footer.ejs`        | `src/components/Footer.astro`            |
| `layout/_partial/sidebar.ejs`       | `src/components/Sidebar.astro`           |
| `layout/_partial/search.ejs`        | `src/components/SearchOverlay.astro`     |
| `layout/_partial/reading-progress`  | `src/components/ReadingProgress.astro`   |
| `layout/_partial/post-card.ejs`     | `src/components/PostCard.astro`          |
| `layout/_partial/pagination.ejs`    | `src/components/Pagination.astro`        |
| `layout/_partial/license.ejs`       | `src/components/License.astro`           |
| `layout/_partial/reward.ejs`        | `src/components/Reward.astro`            |
| `layout/_partial/related-posts.ejs` | `src/components/RelatedPosts.astro`      |
| `layout/_partial/toc.ejs`           | `src/components/Toc.astro`               |
| `layout/index.ejs`                  | `src/pages/index.astro` + `page/[page].astro` |
| `layout/post.ejs`                   | `src/pages/posts/[...slug].astro`        |
| `layout/page.ejs`                   | `src/pages/[slug].astro`                 |
| `layout/archive.ejs`                | `src/pages/archives/index.astro`         |
| `layout/category.ejs`               | `src/pages/categories/[name].astro`      |
| `layout/categories.ejs`             | `src/pages/categories/index.astro`       |
| `layout/tag.ejs`                    | `src/pages/tags/[name].astro`            |
| `layout/tags.ejs`                   | `src/pages/tags/index.astro`             |
| `layout/links.ejs`                  | `src/pages/links.astro`                  |
| `layout/404.ejs`                    | `src/pages/404.astro`                    |
