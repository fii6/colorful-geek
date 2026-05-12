import rss from '@astrojs/rss';
import { siteConfig } from '~/lib/site-config.js';
import { getPublishedPosts, postPath, stripHtml } from '~/lib/posts.js';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: siteConfig.title,
    description: siteConfig.description || '',
    site: context.site || siteConfig.url,
    items: posts.slice(0, 20).map((post) => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description || stripHtml(post.body || '').slice(0, 200),
      link: postPath(post),
    })),
  });
}
