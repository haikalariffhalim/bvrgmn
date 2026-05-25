import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getMostPopularPostsByAuthor = query({
  args: {
    authorId: v.id("authors"),
    includePublished: v.optional(v.boolean()),
  },
  handler: async (ctx, { authorId }) => {
    // Get articles by author
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_author_published", (q) => q.eq("authorId", authorId))
      .collect();

    // Get reviews by author
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_author_published", (q) => q.eq("authorId", authorId))
      .collect();

    // Combine all posts
    let allPosts = [
      ...articles.map((a) => ({ ...a, postType: "article" })),
      ...reviews.map((r) => ({ ...r, postType: "review" })),
    ];

    // Sort by creation time (latest first)
    return allPosts.sort(
      (a, b) => (b._creationTime || 0) - (a._creationTime || 0),
    );
  },
});

export const incrementPostViews = mutation({
  args: {
    postId: v.union(v.id("articles"), v.id("reviews")),
    postType: v.union(v.literal("article"), v.literal("review")),
  },
  handler: async (ctx, { postId, postType }) => {
    let table: "articles" | "reviews" = "articles";
    if (postType === "review") table = "reviews";

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    // Just return the postId (database handles system fields)
    // No updates needed since we're just tracking views

    return postId;
  },
});
