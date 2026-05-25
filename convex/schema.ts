import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  indexPage: defineTable({
    postId: v.id("posts"),
    status: v.literal("published"),
    slug: v.string(),
    section: v.union(
      v.object({
        id: v.literal("headliner"),
        headline: v.string(),
        excerpt: v.string(),
        thumbFeaturedImg: v.id("_storage"),
        authorProfileCard: v.object({
          name: v.string(),
          slug: v.string(),
          avatar: v.id("_storage"),
          bio: v.string(),
          socials: v.array(v.string()),
        }),
        publishedAt: v.string(),
        updatedAt: v.string(),
        pageViews: v.number(),
      }),
      v.object({
        id: v.literal("top-categories"),
        thumbImg: v.id("_storage"),
        thumbTitle: v.string(),
        categoryId: v.id("categories"),
        pageViews: v.number(),
        order: v.array(v.number()),
        limit: v.number(),
      }),
      v.object({
        id: v.literal("latest"),
        publishedAt: v.string(),
        order: v.array(v.id("publishedAt")),
        limit: v.number(),
        thumbImg: v.id("_storage"),
        thumbImgDesc: v.string(),
        thumbTitle: v.string(),
        thumbExcerpt: v.string(),
        thumbImgTwo: v.id("_storage"),
        thumbImgTwoDesc: v.string(),
        thumbTitleTwo: v.string(),
        thumbExcerptTwo: v.string(),
      }),
      v.object({
        id: v.optional(v.literal("side")),
        tags: v.array(v.string()),
        thumbImg: v.id("_storage"),
        thumbImgDesc: v.string(),
        thumbTitle: v.string(),
        thumbExcerpt: v.string(),
        thumbImgTwo: v.id("_storage"),
        thumbImgTwoDesc: v.string(),
        thumbShortSummary: v.string(),
      }),
    ),
  })
    .index("by_post", ["postId"])
    .index("by_section", ["section"])
    .index("by_slug", ["slug"]),

  articlePage: defineTable({
    postId: v.id("posts"),
    categoryId: v.id("categories"),
    slug: v.string(),
    section: v.union(
      v.object({
        id: v.literal("hero"),
        authorId: v.id("authors"),
        tagId: v.array(v.id("tags")),
        categoryId: v.array(v.id("categories")),
        bgColor: v.array(v.id("themes")),
        title: v.string(),
        excerpt: v.string(),
        featuredImg: v.id("_storage"),
        featuredImgDesc: v.string(),
        shortSummary: v.string(),
      }),
      v.object({
        id: v.literal("body"),
        bgColor: v.array(v.id("themes")),
        content: v.object({
          p: v.string(),
          h3: v.optional(v.string()),
          h4: v.optional(v.string()),
          images: v.array(v.id("_storage")),
          codeblock: v.optional(v.string()),
          toc: v.optional(v.string()),
        }),
      }),
      v.object({
        id: v.literal("aside"),
        p: v.string(),
        bgColor: v.array(v.id("themes")),
      }),
      v.object({
        id: v.literal("related"),
        p: v.string(),
        bgColor: v.array(v.id("themes")),
        order: v.array(v.number()),
        limit: v.number(),
      }),
    ),
    status: v.union(
      v.literal("published"),
      v.literal("draft"),
      v.literal("pending"),
      v.literal("updated"),
    ),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_status", ["status"])
    .index("by_categories", ["categoryId"])
    .index("by_posts", ["postId"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    themes: v.array(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_themes", ["themes"]),

  authors: defineTable({
    name: v.string(),
    email: v.string(),
    slug: v.string(),
    bio: v.optional(v.string()),
    socials: v.optional(v.array(v.string())),
    avatar: v.optional(v.id("_storage")),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"])
    .index("by_email", ["email"])
    .index("by_avatar", ["avatar"]),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    themes: v.array(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_themes", ["themes"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    model: v.string(),
    productCategory: v.id("productCategories"),
    specsId: v.id("specs"),
    articleId: v.id("articles"),
    postId: v.id("posts"),
    reviewId: v.id("reviews"),
  })
    .index("by_slug", ["slug"])
    .index("by_product_category", ["productCategory"])
    .index("by_article", ["articleId"])
    .index("by_post", ["postId"])
    .index("by_review", ["reviewId"]),

  specs: defineTable({
    productCategory: v.id("productCategories"),
    productId: v.id("products"),
    reviewId: v.id("reviews"),
    articleId: v.id("articles"),
    postId: v.id("posts"),
  })
    .index("by_product_id_category", ["productId", "productCategory"])
    .index("by_review", ["reviewId"])
    .index("by_article", ["articleId"])
    .index("by_post", ["postId"])
    .index("by_product_id", ["productId"]),

  reviews: defineTable({
    productId: v.id("products"),
    specsId: v.id("specs"),
    postId: v.id("posts"),
    slug: v.string(),
    title: v.string(),

    content: v.string(),
    rating: v.number(),
    authorId: v.id("authors"),
  })
    .index("by_slug", ["slug"])
    .index("by_product", ["productId"])
    .index("by_specs", ["specsId"])
    .index("by_post", ["postId"]),
});
