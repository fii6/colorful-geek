// Shared helpers used across pages and components.

import { getCollection } from 'astro:content';
import { siteConfig } from './site-config.js';

export function normalizeList(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}

export function postSlug(entry) {
  return entry.id.replace(/\.(md|mdx)$/, '');
}

export function postPath(entry) {
  return `/posts/${postSlug(entry)}/`;
}

export async function getPublishedPosts() {
  const posts = await getCollection('posts', (p) => p.data.published !== false && !p.data.draft);
  return posts.sort((a, b) => +new Date(b.data.date) - +new Date(a.data.date));
}

export function formatDate(d, fmt) {
  if (!d) return '';
  const date = new Date(d);
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const D = String(date.getDate()).padStart(2, '0');
  const f = fmt || siteConfig.date_format || 'YYYY-MM-DD';
  return f.replace('YYYY', Y).replace('MM', M).replace('DD', D);
}

export function isoDate(d) {
  return d ? new Date(d).toISOString() : '';
}

export function stripHtml(s) {
  if (!s) return '';
  return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export function wordCount(text) {
  if (!text) return 0;
  const cjk = (text.match(/[㐀-龿]/g) || []).length;
  const words = text.replace(/[㐀-龿]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return cjk + words;
}

export function readingTime(text) {
  // 300 cn chars/min, 200 en words/min — average it cheaply
  return Math.max(1, Math.ceil(wordCount(text) / 250));
}

export function buildTaxonomy(posts, field) {
  const map = new Map();
  for (const post of posts) {
    for (const name of normalizeList(post.data[field])) {
      if (!name) continue;
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(post);
    }
  }
  return Array.from(map.entries())
    .map(([name, items]) => ({ name, posts: items, length: items.length }))
    .sort((a, b) => b.length - a.length);
}

export function tagHue(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (Math.imul(h, 31) + name.charCodeAt(i)) | 0;
  }
  return ((h % 360) + 360) % 360;
}

export function relatedPosts(post, all, limit = 5) {
  const tagSet = new Set(normalizeList(post.data.tags));
  const catSet = new Set(normalizeList(post.data.categories));

  return all
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = 0;
      for (const t of normalizeList(p.data.tags)) if (tagSet.has(t)) score += 2;
      for (const c of normalizeList(p.data.categories)) if (catSet.has(c)) score += 1;
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => (b.score - a.score) || (+new Date(b.post.data.date) - +new Date(a.post.data.date)))
    .slice(0, limit)
    .map((x) => x.post);
}

// Translate a Hexo-style category/tag name into a URL slug. Keep CJK as-is;
// only encode unsafe URL chars.
export function taxonomySlug(name) {
  return encodeURIComponent(String(name).trim().replace(/\s+/g, '-').toLowerCase());
}

export function categoryPath(name) {
  return `/categories/${taxonomySlug(name)}/`;
}

export function tagPath(name) {
  return `/tags/${taxonomySlug(name)}/`;
}
