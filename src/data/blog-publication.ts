interface BlogPublication {
  draft?: boolean;
  publishAt?: Date | string;
}

export function isBlogPostPublished(
  post: BlogPublication,
  now: Date = new Date(),
): boolean {
  if (post.draft) return false;
  if (!post.publishAt) return true;

  const publishAt = new Date(post.publishAt);
  if (Number.isNaN(publishAt.valueOf())) {
    throw new Error(`Invalid scheduled publication date "${post.publishAt}".`);
  }

  return publishAt <= now;
}
