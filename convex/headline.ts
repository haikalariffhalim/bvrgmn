import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getHeadline = query({
  args: {
    authorId: v.optional(v.id("authors")),
    tags: v.optional(v.array(v.id("tags"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { authorId, tags, limit = 10 }) => {
    const results = [];

    // Get published articles
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    // Get published product specs
    const productSpecs = await ctx.db
      .query("productSpecs")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    // Get published reviews
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    // Combine all posts
    const allPosts = [
      ...articles.map((a) => ({ ...a, postType: "article" })),
      ...productSpecs.map((p) => ({ ...p, postType: "productSpec" })),
      ...reviews.map((r) => ({ ...r, postType: "review" })),
    ];

    // Filter by author if provided
    let filtered = allPosts;
    if (authorId) {
      filtered = filtered.filter((p) => p.authorId === authorId);
    }

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      filtered = filtered.filter((p) =>
        tags.some((tag) => p.tags.includes(tag)),
      );
    }

    // Sort by popularity (descending) and return limited results
    return filtered.sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  },
});
