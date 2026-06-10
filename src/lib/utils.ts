

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
