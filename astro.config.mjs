import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import { siteConfig } from './src/lib/site-config.js';
import { pluginCustomCopyButton } from './src/plugins/expressive-code/custom-copy-button.ts';

export default defineConfig({
  site: siteConfig.url,
  trailingSlash: 'ignore',
  integrations: [
    expressiveCode({
      themes: ['github-dark-high-contrast', 'github-light-default'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: false,
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers(),
        pluginCustomCopyButton(),
      ],
      defaultProps: {
        wrap: false,
        overridesByLang: {
          shellsession: { showLineNumbers: false },
        },
      },
      styleOverrides: {
        codeBackground: 'var(--codeblock-bg)',
        borderRadius: '0.75rem',
        borderColor: 'var(--code-border)',
        codeFontSize: '0.875rem',
        codeFontFamily:
          "var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
        codeLineHeight: '1.5rem',
        frames: {
          editorBackground: 'var(--codeblock-bg)',
          terminalBackground: 'var(--codeblock-bg)',
          terminalTitlebarBackground: 'var(--codeblock-topbar-bg)',
          editorTabBarBackground: 'var(--codeblock-topbar-bg)',
          editorActiveTabBackground: 'none',
          editorActiveTabIndicatorBottomColor: 'var(--accent-fg)',
          editorActiveTabIndicatorTopColor: 'none',
          editorTabBarBorderBottomColor: 'var(--codeblock-topbar-bg)',
          terminalTitlebarBorderBottomColor: 'none',
        },
        textMarkers: {
          delHue: 0,
          insHue: 140,
          markHue: 210,
        },
      },
      frames: {
        showCopyToClipboardButton: false,
      },
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [remarkGithubBlockquoteAlert],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'prepend',
          properties: { className: ['headerlink'], ariaHidden: 'true', tabIndex: -1 },
        },
      ],
    ],
  },
});
