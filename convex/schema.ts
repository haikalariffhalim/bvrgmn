import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    description: v.string(),
    excerpt: v.string(),
    content: v.string(),
    featuredImage: v.id("_storage"),
    authorId: v.id("authors"),
    authorName: v.string(),
    category: v.array(v.id("categories")),
    tags: v.array(v.id("tags")),
    isPublished: v.boolean(),
    isDraft: v.boolean(),
    publishedAt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    popularity: v.number(),
    views: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_status", ["isPublished"])
    .index("by_author_published", ["authorId", "isPublished"])
    .index("by_creation_time", ["createdAt"])
    .index("by_popularity", ["popularity"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
  }).index("by_slug", ["slug"]),

  authors: defineTable({
    name: v.string(),
    email: v.string(),
    slug: v.string(),
    bio: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    isAdmin: v.optional(v.boolean()),
  }).index("by_slug", ["slug"]),

  productTypes: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
  }).index("by_slug", ["slug"]),

  productSpecs: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    productTypeId: v.id("productTypes"),
    productModel: v.string(),
    specs: v.any(),
    featuredImage: v.id("_storage"),
    authorId: v.id("authors"),
    authorName: v.string(),
    category: v.array(v.id("categories")),
    tags: v.array(v.id("tags")),
    isDraft: v.boolean(),
    isPublished: v.boolean(),
    publishedAt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    popularity: v.number(),
    views: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_status", ["isPublished"])
    .index("by_author_published", ["authorId", "isPublished"])
    .index("by_product_type", ["productTypeId"])
    .index("by_creation_time", ["createdAt"])
    .index("by_popularity", ["popularity"]),

  reviews: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    content: v.string(),
    productSpecId: v.id("productSpecs"),
    reviewAspect: v.string(),
    rating: v.number(),
    authorId: v.id("authors"),
    authorName: v.string(),
    category: v.array(v.id("categories")),
    tags: v.array(v.id("tags")),
    isDraft: v.boolean(),
    isPublished: v.boolean(),
    publishedAt: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    popularity: v.number(),
    views: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_status", ["isPublished"])
    .index("by_author_published", ["authorId", "isPublished"])
    .index("by_product_spec", ["productSpecId"])
    .index("by_creation_time", ["createdAt"])
    .index("by_popularity", ["popularity"]),
});
