import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    _id: v.id("posts"),
    _createdAt: v.number(),
    postType: v.union(
      v.object({
        id: v.id("articles"),
        slug: v.literal("artikel"),
      }),
      v.object({
        id: v.id("reviews"),
        slug: v.literal("ulasan"),
      }),
      v.object({
        id: v.id("products"),
        slug: v.literal("produk"),
      }),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("pending"),
      v.literal("rejected"),
    ),
    publishedAt: v.string(),
    updatedAt: v.string(),
    slug: v.string(),
  }),

  articles: defineTable({
    postType: v.object({
      id: v.id("articles"),
      slug: v.literal("artikel"),
    }),
    title: v.string(),
    featuredImage: v.id("_storage"),
    content: v.string(),
  }),

  socialmedia: defineTable({
    platform: v.array(v.string()),
    logo: v.id("_storage"),
    url: v.string(),
  }),

  // Authors
  authors: defineTable({
    slug: v.string(),
    name: v.string(),
    avatar: v.union(v.id("_storage"), v.null()),
    bio: v.string(),
    socialmedia: v.array(v.id("socialmedia")),
    email: v.string(),
    designation: v.optional(v.string()),
    joinedAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    themes: v.array(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_themes", ["themes"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    themes: v.array(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_themes", ["themes"]),

  products: defineTable({
    name: v.string(),
    brand: v.optional(v.id("brands")),
    slug: v.string(),
    productCategory: v.id("productCategories"),
    featuredImage: v.id("_storage"),
    articleId: v.id("articles"),
    reviewId: v.id("reviews"),
  })
    .index("by_slug", ["slug"])
    .index("by_product_category", ["productCategory"])
    .index("by_article", ["articleId"])
    .index("by_review", ["reviewId"]),

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
