import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * INDEX PAGE FUNCTIONS
 *
 * These manage the index/listing pages shown on homepage and category pages
 * Agent generates THUMBNAIL VERSIONS of content:
 * - Alternative titles (headline vs. original title)
 * - Thumbnail images (may differ from featured image)
 * - Excerpts (optimized for feeds)
 *
 * WORKFLOW:
 * 1. Author publishes article/review/specs to articlePage table (detail page)
 * 2. Agent reads published content and generates:
 *    - Alternative headline/title (more engaging for homepage)
 *    - Thumbnail image (optimized for feed display)
 *    - Excerpt text (optimized for preview)
 * 3. Agent creates indexPage entry linking to the published articlePage
 * 4. Homepage displays thumbnail versions, detail page links show full content
 */

/**
 * Create index page headliner section (featured content)
 * Used for: Homepage hero/featured section
 * Displays: Agent-generated headline + thumbnail image
 * Links to: Detail page for full content
 */
export const createHeadlinerPost = mutation({
  args: {
    postId: v.id("posts"), // Links to articlePage.postId
    slug: v.string(),
    headline: v.string(), // Agent-generated alternative title
    excerpt: v.string(),
    thumbFeaturedImg: v.id("_storage"), // Thumbnail image (may differ from original)
    authorName: v.string(),
    authorSlug: v.string(),
    authorAvatar: v.id("_storage"),
    authorBio: v.string(),
    authorSocials: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const authorProfileCard = {
      name: args.authorName,
      slug: args.authorSlug,
      avatar: args.authorAvatar,
      bio: args.authorBio,
      socials: args.authorSocials,
    };

    const section = {
      id: "headliner" as const,
      headline: args.headline,
      excerpt: args.excerpt,
      thumbFeaturedImg: args.thumbFeaturedImg,
      authorProfileCard,
      publishedAt: now,
      updatedAt: now,
      pageViews: 0,
    };

    return await ctx.db.insert("indexPage", {
      postId: args.postId,
      status: "published" as const,
      slug: args.slug,
      section,
    });
  },
});

/**
 * Create top categories section
 * Used for: Homepage trending categories section
 * Shows: X most popular content in each category
 * Agent generates: Thumbnail title and image per category
 */
export const createTopCategoriesPost = mutation({
  args: {
    postId: v.id("posts"),
    slug: v.string(),
    categoryId: v.id("categories"), // Content category (tech, business, etc)
    thumbImg: v.id("_storage"),
    thumbTitle: v.string(), // Agent-generated category headline
    order: v.array(v.number()), // Order of posts in category
    limit: v.number(), // Max posts to show
  },
  handler: async (ctx, args) => {
    const section = {
      id: "top-categories" as const,
      thumbImg: args.thumbImg,
      thumbTitle: args.thumbTitle,
      categoryId: args.categoryId,
      pageViews: 0,
      order: args.order,
      limit: args.limit,
    };

    return await ctx.db.insert("indexPage", {
      postId: args.postId,
      status: "published" as const,
      slug: args.slug,
      section,
    });
  },
});

/**
 * Create latest posts section (main feed)
 * Used for: Homepage latest feed or /latest page
 * Shows: Most recent published content with thumbnails
 * Agent generates: Alternative titles + thumbnail images
 */
export const createLatestPost = mutation({
  args: {
    postId: v.id("posts"),
    slug: v.string(),
    thumbImg: v.id("_storage"), // Thumbnail image 1
    thumbImgDesc: v.string(),
    thumbTitle: v.string(), // Agent-generated alternative title
    thumbExcerpt: v.string(), // Agent-generated excerpt
    thumbImgTwo: v.id("_storage"), // Required per schema
    thumbImgTwoDesc: v.string(), // Required per schema
    thumbTitleTwo: v.string(), // Required per schema
    thumbExcerptTwo: v.string(), // Required per schema
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    const section = {
      id: "latest" as const,
      publishedAt: now,
      order: [] as any,
      limit: 0,
      thumbImg: args.thumbImg,
      thumbImgDesc: args.thumbImgDesc,
      thumbTitle: args.thumbTitle,
      thumbExcerpt: args.thumbExcerpt,
      thumbImgTwo: args.thumbImgTwo,
      thumbImgTwoDesc: args.thumbImgTwoDesc,
      thumbTitleTwo: args.thumbTitleTwo,
      thumbExcerptTwo: args.thumbExcerptTwo,
    };

    return await ctx.db.insert("indexPage", {
      postId: args.postId,
      status: "published" as const,
      slug: args.slug,
      section,
    });
  },
});

/**
 * Create side posts section (editor's picks)
 * Used for: Sidebar on homepage and category pages
 * Shows: Curated/featured content
 * Agent generates: Alternative titles + thumbnail images
 */
export const createSidePost = mutation({
  args: {
    postId: v.id("posts"),
    slug: v.string(),
    tags: v.array(v.string()), // For targeting/filtering
    thumbImg: v.id("_storage"),
    thumbImgDesc: v.string(),
    thumbTitle: v.string(), // Agent-generated title
    thumbExcerpt: v.string(),
    thumbImgTwo: v.id("_storage"),
    thumbImgTwoDesc: v.string(),
    thumbShortSummary: v.string(),
  },
  handler: async (ctx, args) => {
    const section = {
      id: "side" as const,
      tags: args.tags,
      thumbImg: args.thumbImg,
      thumbImgDesc: args.thumbImgDesc,
      thumbTitle: args.thumbTitle,
      thumbExcerpt: args.thumbExcerpt,
      thumbImgTwo: args.thumbImgTwo,
      thumbImgTwoDesc: args.thumbImgTwoDesc,
      thumbShortSummary: args.thumbShortSummary,
    };

    return await ctx.db.insert("indexPage", {
      postId: args.postId,
      status: "published" as const,
      slug: args.slug,
      section,
    });
  },
});

/**
 * Get headliner post for homepage
 * Returns: Single featured post with agent-generated headline
 */
export const getHeadlinerPost = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("indexPage")
      .collect()
      .then((all) =>
        all.filter(
          (p) => p.status === "published" && p.section.id === "headliner",
        ),
      );

    if (posts.length === 0) {
      return null;
    }

    // Return the most recent one
    const post = posts[0];
    const section = post.section;

    if (section.id !== "headliner") {
      return null;
    }

    return {
      id: post._id,
      postId: post.postId,
      slug: post.slug,
      headline: section.headline,
      excerpt: section.excerpt,
      thumbFeaturedImg: section.thumbFeaturedImg,
      author: section.authorProfileCard,
      publishedAt: section.publishedAt,
      updatedAt: section.updatedAt,
      pageViews: section.pageViews,
    };
  },
});

/**
 * Get top categories posts
 * Returns: Posts grouped by content category
 */
export const getTopCategoriesPosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 5 }) => {
    const posts = await ctx.db
      .query("indexPage")
      .collect()
      .then((all) =>
        all
          .filter(
            (p) =>
              p.status === "published" && p.section.id === "top-categories",
          )
          .slice(0, limit),
      );

    return posts
      .map((post: any) => {
        const section = post.section;
        if (section.id !== "top-categories") {
          return null;
        }
        return {
          id: post._id,
          postId: post.postId,
          slug: post.slug,
          categoryId: section.categoryId,
          thumbImg: section.thumbImg,
          thumbTitle: section.thumbTitle,
          pageViews: section.pageViews,
          order: section.order,
          limit: section.limit,
        };
      })
      .filter(Boolean);
  },
});

/**
 * Get latest posts (main feed)
 * Returns: Most recent content with pagination
 */
export const getLatestPosts = query({
  args: { limit: v.optional(v.number()), offset: v.optional(v.number()) },
  handler: async (ctx, { limit = 10, offset = 0 }) => {
    const posts = await ctx.db
      .query("indexPage")
      .collect()
      .then((all) =>
        all
          .filter((p) => p.status === "published" && p.section.id === "latest")
          .sort((a: any, b: any) => {
            const aSectionDate =
              a.section.id === "latest" ? a.section.publishedAt : "";
            const bSectionDate =
              b.section.id === "latest" ? b.section.publishedAt : "";
            return (
              new Date(bSectionDate).getTime() -
              new Date(aSectionDate).getTime()
            );
          })
          .slice(offset, offset + limit),
      );

    return posts
      .map((post: any) => {
        const section = post.section;
        if (section.id !== "latest") {
          return null;
        }
        return {
          id: post._id,
          postId: post.postId,
          slug: post.slug,
          thumbImg: section.thumbImg,
          thumbImgDesc: section.thumbImgDesc,
          thumbTitle: section.thumbTitle,
          thumbExcerpt: section.thumbExcerpt,
          thumbImgTwo: section.thumbImgTwo,
          thumbImgTwoDesc: section.thumbImgTwoDesc,
          thumbTitleTwo: section.thumbTitleTwo,
          thumbExcerptTwo: section.thumbExcerptTwo,
          publishedAt: section.publishedAt,
        };
      })
      .filter(Boolean);
  },
});

/**
 * Get side posts (editor's picks)
 * Returns: Curated content for sidebars
 */
export const getSidePosts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 5 }) => {
    const posts = await ctx.db
      .query("indexPage")
      .collect()
      .then((all) =>
        all
          .filter((p) => p.status === "published" && p.section.id === "side")
          .slice(0, limit),
      );

    return posts
      .map((post: any) => {
        const section = post.section;
        if (section.id !== "side") {
          return null;
        }
        return {
          id: post._id,
          postId: post.postId,
          slug: post.slug,
          tags: section.tags,
          thumbImg: section.thumbImg,
          thumbImgDesc: section.thumbImgDesc,
          thumbTitle: section.thumbTitle,
          thumbExcerpt: section.thumbExcerpt,
          thumbImgTwo: section.thumbImgTwo,
          thumbImgTwoDesc: section.thumbImgTwoDesc,
          thumbShortSummary: section.thumbShortSummary,
        };
      })
      .filter(Boolean);
  },
});

/**
 * Get index page by slug
 */
export const getIndexPageBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const page = await ctx.db
      .query("indexPage")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!page) {
      return null;
    }

    const section = page.section;

    return {
      id: page._id,
      postId: page.postId,
      slug: page.slug,
      status: page.status,
      section,
    };
  },
});

/**
 * Get all index pages by section type
 * Returns: All posts of a specific section (headliner, top-categories, latest, side)
 */
export const getIndexPagesBySection = query({
  args: {
    sectionId: v.union(
      v.literal("headliner"),
      v.literal("top-categories"),
      v.literal("latest"),
      v.literal("side"),
    ),
  },
  handler: async (ctx, { sectionId }) => {
    const pages = await ctx.db
      .query("indexPage")
      .collect()
      .then((all) =>
        all.filter(
          (p: any) => p.status === "published" && p.section.id === sectionId,
        ),
      );

    return pages.map((page: any) => ({
      id: page._id,
      postId: page.postId,
      slug: page.slug,
      section: page.section,
    }));
  },
});

/**
 * Increment page views for index page post
 * Tracks engagement on thumbnail versions
 */
export const incrementIndexPageViews = mutation({
  args: { indexPageId: v.id("indexPage") },
  handler: async (ctx, { indexPageId }) => {
    const page = await ctx.db.get(indexPageId);
    if (!page) {
      throw new ConvexError("Index page not found");
    }

    const section = page.section as any;
    const newViews = (section.pageViews || 0) + 1;
    const updatedSection = {
      ...section,
      pageViews: newViews,
    };

    await ctx.db.patch(indexPageId, {
      section: updatedSection,
    });

    return indexPageId;
  },
});

/**
 * Update index page section (for agent to update generated content)
 * Used for: Agent re-generating better headlines, images, excerpts
 */
export const updateIndexPageSection = mutation({
  args: {
    indexPageId: v.id("indexPage"),
    headline: v.optional(v.string()),
    thumbTitle: v.optional(v.string()),
    thumbTitleTwo: v.optional(v.string()),
    thumbExcerpt: v.optional(v.string()),
    thumbExcerptTwo: v.optional(v.string()),
    thumbImg: v.optional(v.id("_storage")),
    thumbImgTwo: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db.get(args.indexPageId);
    if (!page) {
      throw new ConvexError("Index page not found");
    }

    const section = page.section as any;

    const updatedSection = {
      ...section,
      headline: args.headline ?? section.headline,
      thumbTitle: args.thumbTitle ?? section.thumbTitle,
      thumbTitleTwo: args.thumbTitleTwo ?? section.thumbTitleTwo,
      thumbExcerpt: args.thumbExcerpt ?? section.thumbExcerpt,
      thumbExcerptTwo: args.thumbExcerptTwo ?? section.thumbExcerptTwo,
      thumbImg: args.thumbImg ?? section.thumbImg,
      thumbImgTwo: args.thumbImgTwo ?? section.thumbImgTwo,
    };

    await ctx.db.patch(args.indexPageId, {
      section: updatedSection,
    });

    return args.indexPageId;
  },
});

/**
 * Delete index page post
 */
export const deleteIndexPage = mutation({
  args: { indexPageId: v.id("indexPage") },
  handler: async (ctx, { indexPageId }) => {
    await ctx.db.delete(indexPageId);
    return indexPageId;
  },
});
