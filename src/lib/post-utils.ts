export function getAdjacentPosts<T extends { slug: string }>(posts: T[], currentSlug: string | undefined) {
  let nextPost;
  let prevPost;

  if (!currentSlug) return { nextPost, prevPost };

  const postIndex = posts.findIndex(post => post.slug === currentSlug);

  if (postIndex !== -1) {
    nextPost = posts[postIndex + 1];
    prevPost = posts[postIndex - 1];
  }

  return { nextPost, prevPost };
}
