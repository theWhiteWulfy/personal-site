import rss from "@astrojs/rss";
import site from '@config/site'
import { getCollection } from "astro:content";

export async function GET(context) {
  const blog = (await getCollection("blog")).filter(
    (post) => !post.data.draft);

  const projects = (await getCollection("projects")).filter(
    (project) => !project.data.draft,
  );

  const items = [...blog, ...projects].sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
  );

  return rss({
    stylesheet: '/rss/pretty-feed-v3.xsl',
    title: site.title,
    description: site.description,
    author: site.author.name,
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.date,
      link: `/${item.collection}/${item.slug}/`,
    })),
  });
}
