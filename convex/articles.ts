import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const createArticle = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    description: v.string(),
    slug: v.id("slug"),
    publishedAt: v.string(),
    updatedAt: v.string(),
    featuredImage: v.id("_storage"),
    excerpt: v.string(),
    category: v.array(v.id("categories")),
    tags: v.array(v.id("tags")),
    authorName: v.string(),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    const slug = slugify(args.slug || args.title);

    const existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new ConvexError("Article slug already exists");

    const articleId = await ctx.db.insert("articles", {
      title: args.title,
      summary: args.summary,
      description: args.description,
      slug,
      publishedAt: args.publishedAt, // string per your args
      updatedAt: args.updatedAt,
      featuredImage: args.featuredImage,
      excerpt: args.excerpt,
      category: args.category,
      tags: args.tags,
      authorName: args.authorName,
      createdAt: Date.now(),
    });
    return articleId;
  },
});

export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const getArticleByLatest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_creation_time")
      .order("desc")
      .collect();
  },
});
