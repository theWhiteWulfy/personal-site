import re

with open('src/lib/utils.ts', 'r') as f:
    content = f.read()

content = re.sub(
    r'<<<<<<< HEAD\nexport function getAdjacentPosts\(posts: any\[\], currentSlug: string \| undefined\) \{\n  const postIndex = posts.findIndex\(\(post\) => post.slug === currentSlug\);\n\n  if \(postIndex === -1\) \{\n    return \{ nextPost: undefined, prevPost: undefined \};\n  \}\n\n=======\nexport function getAdjacentPosts<T extends \{ slug: string \}>\(\n  posts: T\[\],\n  currentSlug: string \| undefined\n\) \{\n  const postIndex = posts.findIndex\(\(post\) => post.slug === currentSlug\);\n  if \(postIndex === -1\) \{\n    return \{ nextPost: undefined, prevPost: undefined \};\n  \}\n>>>>>>> origin\/main',
    r'''export function getAdjacentPosts<T extends { slug: string }>(
  posts: T[],
  currentSlug: string | undefined
) {
  const postIndex = posts.findIndex((post) => post.slug === currentSlug);
  if (postIndex === -1) {
    return { nextPost: undefined, prevPost: undefined };
  }''',
    content
)

with open('src/lib/utils.ts', 'w') as f:
    f.write(content)
