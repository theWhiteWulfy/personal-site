import rss from "@astrojs/rss";
import site from '@config/site'
import { getCollection } from "astro:content";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export async function GET(context) {
      // Fetch all entries from the collections
const articles = (await getCollection("articles"))
.filter((article) => !article.data.draft);

const works = (await getCollection("works"))
.filter((article) => !article.data.draft);

const notes = (await getCollection("notes"))
.filter((article) => !article.data.draft);

const bibilio = (await getCollection("bibliophilediaries"))
.filter((article) => !article.data.draft);

const saasguide = (await getCollection("saasguide"))
.filter((faq) => !faq.data.draft);
  

  const items = [...articles, ...works, ...notes, ...bibilio, ...saasguide].sort(
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
      description: item.data.excerpt,
      pubDate: dayjs(item.data.date).utc().format("MMMM D, YYYY"),
      link: `/${item.collection}/${item.slug}/`,
    })),
  });
}
