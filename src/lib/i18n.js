// i18n strings — port of themes/colorful-geek/languages/{en,zh-CN}.yml
// Active language is picked from siteConfig.language.

const strings = {
  'zh-CN': {
    menu: {
      home: '首页',
      archives: '归档',
      tags: '标签',
      categories: '分类',
      about: '关于',
      links: '友链',
    },
    post: {
      read_more: '阅读全文',
      reading_time: '分钟阅读',
      word_count: '字',
      updated: '更新于',
      posted: '发布于',
      toc: '目录',
      related: '相关文章',
      prev: '上一篇',
      next: '下一篇',
      copy: '复制',
      copied: '已复制',
    },
    search: {
      placeholder: '输入关键词搜索...',
      no_results: '没有找到结果',
      results_count: '条结果',
    },
    archive: { title: '归档', count: '篇文章' },
    tags: { title: '标签', count: '篇' },
    categories: { title: '分类' },
    pagination: { prev: '上一页', next: '下一页' },
    error: {
      '404': { title: '404 — 页面未找到', message: '请求的路径不存在', home: 'cd ~' },
    },
    footer: { powered_by: '驱动', theme: '主题' },
    license: {
      author: '作者',
      url: '链接',
      declare: '版权',
      notice_prefix: '本文采用',
      notice_suffix: '国际许可协议进行许可,转载请注明出处。',
    },
    reward: {
      button: '打赏',
      default_title: '请作者喝杯咖啡 ☕',
      default_desc: '如果这篇文章对你有帮助,可以请我喝杯咖啡 ❤️',
    },
  },
  en: {
    menu: {
      home: 'home',
      archives: 'archives',
      tags: 'tags',
      categories: 'categories',
      about: 'about',
      links: 'links',
    },
    post: {
      read_more: 'read more',
      reading_time: 'min read',
      word_count: 'words',
      updated: 'updated',
      posted: 'posted',
      toc: 'table of contents',
      related: 'related posts',
      prev: 'prev',
      next: 'next',
      copy: 'copy',
      copied: 'copied',
    },
    search: {
      placeholder: 'type to search...',
      no_results: 'no matches',
      results_count: 'results',
    },
    archive: { title: 'archives', count: 'posts' },
    tags: { title: 'tags', count: 'posts' },
    categories: { title: 'categories' },
    pagination: { prev: 'prev', next: 'next' },
    error: {
      '404': { title: '404 — not found', message: 'the requested path does not exist', home: 'cd ~' },
    },
    footer: { powered_by: 'powered by', theme: 'theme' },
    license: {
      author: 'author',
      url: 'link',
      declare: 'license',
      notice_prefix: 'This work is licensed under',
      notice_suffix: '. Please cite the source when reposting.',
    },
    reward: {
      button: 'Reward',
      default_title: 'Buy me a coffee ☕',
      default_desc: 'If this article was helpful, consider buying me a coffee ❤️',
    },
  },
};

import { siteConfig } from './site-config.js';

const ACTIVE = strings[siteConfig.language] || strings['en'];

export function t(path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), ACTIVE) ?? path;
}
