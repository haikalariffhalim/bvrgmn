import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const addReview = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    content: v.string(),
    productSpec: v.id("productSpecs"),
    rating: v.number(),
    authorId: v.id("author"),
    postId: v.id("posts"),
    categoryId: v.id("category"),
    tagId: v.array(v.id("tags")),
  },
  handler: async (ctx, args) => {
    // Validate rating
    if (args.rating < 0 || args.rating > 5) {
      throw new ConvexError("Rating must be between 0 and 5");
    }

    // Check if slug exists
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new ConvexError("Review slug already exists");
    }

    const now = new Date().toISOString();

    return await ctx.db.insert("reviews", {
      title: args.title,
      slug: args.slug,
      summary: args.summary,
      content: args.content,
      productSpecId: args.productSpec,
      rating: args.rating,
      authorId: args.authorId,
      postId: args.postId,
      categoryId: args.categoryId,
      tagId: args.tagId,
    });
  },
});

export const updateReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    summary: v.optional(v.string()),
    content: v.optional(v.string()),
    rating: v.optional(v.number()),
    categoryId: v.optional(v.id("category")),
    tagId: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new ConvexError("Review not found");
    }

    if (args.rating !== undefined && (args.rating < 0 || args.rating > 5)) {
      throw new ConvexError("Rating must be between 0 and 5");
    }

    const updates: Record<string, any> = {};

    if (args.title !== undefined) updates.title = args.title;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.summary !== undefined) updates.summary = args.summary;
    if (args.content !== undefined) updates.content = args.content;
    if (args.rating !== undefined) updates.rating = args.rating;
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.tagId !== undefined) updates.tagId = args.tagId;

    await ctx.db.patch(args.reviewId, updates);
    return args.reviewId;
  },
});

export const getReviewByProductId = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, { productId }) => {
    const review = await ctx.db
      .query("reviews")
      .withIndex("by_products", (q) => q.eq("productId", productId))
      .collect();

    return review.sort(
      (a, b) => (b._creationTime || 0) - (a._creationTime || 0),
    );
  },
});

export const getReviewBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getReviewsByAspect = query({
  args: {
    productSpecId: v.id("productSpecs"),
  },
  handler: async (ctx, { productSpecId }) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_spec", (q) => q.eq("productSpec", productSpecId))
      .collect();

    return reviews.sort((a, b) => b.rating - a.rating);
  },
});
