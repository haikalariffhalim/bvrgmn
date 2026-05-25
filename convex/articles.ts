import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const updateArticle = mutation({
  args: {
    articleId: v.id("articles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    summary: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    featuredImage: v.optional(v.id("_storage")),
    categoryId: v.optional(v.id("category")),
    tag: v.optional(v.array(v.id("tags"))),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);

    if (!article) {
      throw new ConvexError("Article not found");
    }

    const updates: Record<string, any> = {};

    // Update only provided fields
    if (args.title !== undefined) updates.title = args.title;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.summary !== undefined) updates.summary = args.summary;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.featuredImage !== undefined)
      updates.featuredImage = args.featuredImage;
    if (args.categoryId !== undefined) updates.categoryId = args.categoryId;
    if (args.tag !== undefined) updates.tag = args.tag;

    await ctx.db.patch(args.articleId, updates);
    return args.articleId;
  },
});

export const getArticlesBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .collect();
  },
});

export const getArticleByAuthor = query({
  args: { authorId: v.id("authors") },
  handler: async (ctx, { authorId }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_authors", (q) => q.eq("authorId", authorId))
      .order("desc")
      .take(10);
  },
});

export const getArticleByCategories = query({
  args: { categoryId: v.id("category") },
  handler: async (ctx, { categoryId }) => {
    // Fetch all articles
    const allArticles = await ctx.db.query("articles").collect();

    // Filter articles by category
    return allArticles
      .filter((article) => article.categoryId === categoryId)
      .slice(0, 5);
  },
});

export const getArticleByTags = query({
  args: { tagId: v.id("tags") },
  handler: async (ctx, { tagId }) => {
    // Fetch all articles
    const allArticles = await ctx.db.query("articles").collect();

    // Filter articles by tag
    return allArticles
      .filter((article) => article.tag && article.tag.includes(tagId))
      .slice(0, 5);
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
