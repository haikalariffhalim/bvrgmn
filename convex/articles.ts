import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const createArticlePage = mutation({
  args: {
    postId: v.id("posts"),
    slug: v.string(),
    categoryId: v.id("categories"),
    authorId: v.id("authors"),
    title: v.string(),
    excerpt: v.string(),
    featuredImg: v.id("_storage"),
    featuredImgDesc: v.string(),
    shortSummary: v.string(),
    tagIds: v.array(v.id("tags")),
    bgColor: v.optional(v.array(v.id("themes"))),
  },
  handler: async (ctx, args) => {
    // Check if article with this slug already exists
    const existing = await ctx.db
      .query("articlePage")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new ConvexError("Content with this slug already exists");
    }

    const now = new Date().toISOString();

    const heroSection = {
      id: "hero" as const,
      authorId: args.authorId,
      tagId: args.tagIds,
      categoryId: args.categoryId,
      bgColor: args.bgColor || [],
      title: args.title,
      excerpt: args.excerpt,
      featuredImg: args.featuredImg,
      featuredImgDesc: args.featuredImgDesc,
      shortSummary: args.shortSummary,
    };

    return await ctx.db.insert("articlePage", {
      postId: args.postId,
      categoryId: args.categoryId,
      slug: args.slug,
      id: "hero" as const,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Add body content section to detail page
 * Can contain multiple body sections for longer content
 */
export const addArticleBodySection = mutation({
  args: {
    articlePageId: v.id("articlePage"),
    paragraphs: v.string(),
    heading3: v.optional(v.string()),
    heading4: v.optional(v.string()),
    images: v.array(v.id("_storage")),
    codeblock: v.optional(v.string()),
    tableOfContents: v.optional(v.string()),
    bgColor: v.optional(v.array(v.id("themes"))),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articlePageId);
    if (!article) {
      throw new ConvexError("Content not found");
    }

    const bodySection = {
      id: "body" as const,
      bgColor: args.bgColor || [],
      content: {
        p: args.paragraphs,
        h3: args.heading3,
        h4: args.heading4,
        images: args.images,
        codeblock: args.codeblock,
        toc: args.tableOfContents,
      },
    };

    // Update article with body section
    await ctx.db.patch(args.articlePageId, {
      section: bodySection,
      updatedAt: new Date().toISOString(),
    });

    return args.articlePageId;
  },
});

/**
 * Publish content detail page (change status from draft to published)
 * After publishing, agent can create index page thumbnail version
 */
export const publishArticle = mutation({
  args: { articlePageId: v.id("articlePage") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articlePageId);
    if (!article) {
      throw new ConvexError("Content not found");
    }

    await ctx.db.patch(args.articlePageId, {
      status: "published",
      updatedAt: new Date().toISOString(),
    });

    return args.articlePageId;
  },
});

/**
 * Get single content page by slug (detail page)
 * Used for: /article/:slug, /review/:slug, /specs/:slug routes
 */
export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const article = await ctx.db
      .query("articlePage")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .filter((q) => q.eq(q.field("status"), "published"))
      .first();

    if (!article || article.section.id !== "hero") {
      return null;
    }

    const heroSection = article.section;

    // Get author info
    const author = await ctx.db.get(heroSection.authorId);

    // Get category and tag info
    const categories = await Promise.all(
      heroSection.categoryId.map((catId: any) => ctx.db.get(catId)),
    );
    const tags = await Promise.all(
      heroSection.tagId.map((tagId: any) => ctx.db.get(tagId)),
    );

    return {
      id: article._id,
      slug: article.slug,
      title: heroSection.title,
      excerpt: heroSection.excerpt,
      summary: heroSection.shortSummary,
      featuredImage: heroSection.featuredImg,
      featuredImageDesc: heroSection.featuredImgDesc,
      author: author
        ? { id: author._id, name: author.name, slug: author.slug }
        : null,
      categories: categories.map((c: any) => ({ id: c?._id, name: c?.name })),
      tags: tags.map((t: any) => ({ id: t?._id, name: t?.name })),
      content: null,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  },
});

/**
 * Get articles by content category
 * Used for: /category/:slug pages showing all related articles
 */
export const getArticlesByCategory = query({
  args: { categoryId: v.id("categories"), limit: v.optional(v.number()) },
  handler: async (ctx, { categoryId, limit = 10 }) => {
    const articles = await ctx.db
      .query("articlePage")
      .withIndex("by_published_status", (q) => q.eq("status", "published"))
      .collect()
      .then((all) =>
        all
          .filter(
            (a) =>
              a.section.id === "hero" &&
              a.section.categoryId.includes(categoryId),
          )
          .slice(0, limit),
      );

    return articles.map((article: any) => {
      const heroSection = article.section;
      return {
        id: article._id,
        slug: article.slug,
        title: heroSection.id === "hero" ? heroSection.title : "",
        excerpt: heroSection.id === "hero" ? heroSection.excerpt : "",
        summary: heroSection.id === "hero" ? heroSection.shortSummary : "",
        featuredImage: heroSection.id === "hero" ? heroSection.featuredImg : "",
        updatedAt: article.updatedAt,
      };
    });
  },
});

/**
 * Get articles by author
 * Used for: /author/:slug pages
 */
export const getArticlesByAuthor = query({
  args: { authorId: v.id("authors"), limit: v.optional(v.number()) },
  handler: async (ctx, { authorId, limit = 10 }) => {
    const articles = await ctx.db
      .query("articlePage")
      .withIndex("by_published_status", (q) => q.eq("status", "published"))
      .collect()
      .then((all) =>
        all
          .filter(
            (a) => a.section.id === "hero" && a.section.authorId === authorId,
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .slice(0, limit),
      );

    return articles.map((article: any) => {
      const heroSection = article.section;
      return {
        id: article._id,
        slug: article.slug,
        title: heroSection.id === "hero" ? heroSection.title : "",
        excerpt: heroSection.id === "hero" ? heroSection.excerpt : "",
        summary: heroSection.id === "hero" ? heroSection.shortSummary : "",
        featuredImage: heroSection.id === "hero" ? heroSection.featuredImg : "",
        updatedAt: article.updatedAt,
      };
    });
  },
});

/**
 * Get articles by tags
 * Used for: /tag/:slug pages
 */
export const getArticlesByTags = query({
  args: { tagIds: v.array(v.id("tags")), limit: v.optional(v.number()) },
  handler: async (ctx, { tagIds, limit = 10 }) => {
    const articles = await ctx.db
      .query("articlePage")
      .withIndex("by_published_status", (q) => q.eq("status", "published"))
      .collect()
      .then((all) =>
        all
          .filter(
            (a: any) =>
              a.section.id === "hero" &&
              tagIds.some((tagId: any) => a.section.tagId.includes(tagId)),
          )
          .slice(0, limit),
      );

    return articles.map((article: any) => {
      const heroSection = article.section;
      return {
        id: article._id,
        slug: article.slug,
        title: heroSection.id === "hero" ? heroSection.title : "",
        excerpt: heroSection.id === "hero" ? heroSection.excerpt : "",
        summary: heroSection.id === "hero" ? heroSection.shortSummary : "",
        featuredImage: heroSection.id === "hero" ? heroSection.featuredImg : "",
        updatedAt: article.updatedAt,
      };
    });
  },
});

/**
 * Get all published articles (for site map, RSS feed, etc.)
 */
export const getAllPublishedArticles = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()) },
  handler: async (ctx, { limit = 20, offset = 0 }) => {
    const articles = await ctx.db
      .query("articlePage")
      .withIndex("by_published_status", (q) => q.eq("status", "published"))
      .collect()
      .then((all) =>
        all
          .filter((a: any) => a.section.id === "hero")
          .sort(
            (a: any, b: any) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .slice(offset, offset + limit),
      );

    return articles.map((article: any) => {
      const heroSection = article.section;
      return {
        id: article._id,
        slug: article.slug,
        title: heroSection.id === "hero" ? heroSection.title : "",
        excerpt: heroSection.id === "hero" ? heroSection.excerpt : "",
        summary: heroSection.id === "hero" ? heroSection.shortSummary : "",
        featuredImage: heroSection.id === "hero" ? heroSection.featuredImg : "",
        updatedAt: article.updatedAt,
      };
    });
  },
});

/**
 * Get article for linking/related content
 * Returns minimal info for showing related articles elsewhere
 */
export const getArticleForLink = query({
  args: { articlePageId: v.id("articlePage") },
  handler: async (ctx, { articlePageId }) => {
    const article = await ctx.db.get(articlePageId);
    if (!article || article.section.id !== "hero") {
      return null;
    }

    const heroSection = article.section;
    return {
      id: article._id,
      slug: article.slug,
      title: heroSection.title,
      featuredImage: heroSection.featuredImg,
    };
  },
});

/**
 * Update article hero section
 */
export const updateArticleHero = mutation({
  args: {
    articlePageId: v.id("articlePage"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    featuredImg: v.optional(v.id("_storage")),
    featuredImgDesc: v.optional(v.string()),
    shortSummary: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    categoryIds: v.optional(v.array(v.id("categories"))),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articlePageId);
    if (!article) {
      throw new ConvexError("Content not found");
    }

    if (article.section.id !== "hero") {
      throw new ConvexError("Article section is not hero section");
    }

    const heroSection = article.section;

    const updatedSection = {
      ...heroSection,
      title: args.title ?? heroSection.title,
      excerpt: args.excerpt ?? heroSection.excerpt,
      featuredImg: args.featuredImg ?? heroSection.featuredImg,
      featuredImgDesc: args.featuredImgDesc ?? heroSection.featuredImgDesc,
      shortSummary: args.shortSummary ?? heroSection.shortSummary,
      tagId: args.tagIds ?? heroSection.tagId,
      categoryId: args.categoryIds ?? heroSection.categoryId,
    };

    await ctx.db.patch(args.articlePageId, {
      section: updatedSection,
      updatedAt: new Date().toISOString(),
    });

    return args.articlePageId;
  },
});
