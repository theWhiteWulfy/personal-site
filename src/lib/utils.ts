

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");   // remove html tags
  const wordCount = textOnly.split(/\s+/).length; // split by whitespace  
  const readingTimeMinutes = (wordCount / 180 + 1).toFixed(); // 180 words per minute
  return `${readingTimeMinutes} min read`;
}

export function getAdjacentPosts<T extends { slug: string }>(currentSlug: string | undefined, posts: T[]) {
  let postIndex = -1;
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].slug === currentSlug) {
      postIndex = i;
      break;
    }
  }

  return {
    nextPost: postIndex !== -1 ? posts[postIndex + 1] : undefined,
    prevPost: postIndex !== -1 ? posts[postIndex - 1] : undefined,
  };
}
