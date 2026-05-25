import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const createArticle = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
  },
  returns: v.object({
    id: v.id("articles"),
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    description: v.string(),
    content: v.string(),
    featuredImage: v.id("_storage"),
    excerpt: v.string(),
  }),
  handler: async (ctx, args) => {
    const articles = await ctx.db.get(args.slug);

    if (!articles) {
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
    if (args.tagId !== undefined) updates.tagId = args.tagId;

    await ctx.db.patch(args.articles, updates);

    return articles;
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
  args: {
    authorId: v.id("authors"),
  },

  handler: async (ctx, { authorId }) => {
    const allArticles = await ctx.db
      .query("authors")
      .withIndex("by_articles", (q) => q.eq("articles", authorId))
      .order("desc")
      .take(10);

    return allArticles;
  },
});

export const getArticleByCategories = query({
  args: {
    categoryId: v.id("category"),
  },
  handler: async (ctx, { categoryId }) => {
    // Fetch all articles
    const allArticles = await ctx.db.query("articles").collect();

    // Filter articles by category
    return allArticles
      .filter(
        (article) => article.category && article.category.includes(categoryId),
      )
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
      .filter((article) => article.tags && article.tags.includes(tagId))
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
