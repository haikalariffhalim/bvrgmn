import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const addProduct = mutation({
  args: {
    name: v.string(),
    model: v.string(),
    category: v.id("productCategories"),
    brand: v.string(),
    thumbnailImg: v.id("_storage"),

    slug: v.string(),

    announced: v.string(),
    operatingSystem: v.string(),
    variants: v.object({
      storage: v.array(v.string()),
      color: v.array(v.string()),
      ram: v.optional(v.array(v.string())),
    }),
    specs: v.any(),
    featuredImage: v.id("_storage"),

    tags: v.array(v.id("tags")),
    authorId: v.id("authors"),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("productId")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new ConvexError("Product slug already exists");
    }

    const now = new Date().toISOString();

    return await ctx.db.insert("products", {
      slug: args.slug,
      title: args.title,
      summary: args.summary,
      productTypeId: args.productTypeId,
      productModel: args.productModel,
      specs: {
        brand: args.brand,
        model: args.productModel,
        slug: args.slug,
        announced: args.announced,
        operatingSystem: args.operatingSystem,
        variants: args.variants,
        specifications: args.specs,
      },
      featuredImage: args.featuredImage,
      authorId: args.authorId,
      authorName: args.authorName,
      category: args.category,
      tags: args.tags,
      isDraft: args.isDraft,
      isPublished: !args.isDraft,
      publishedAt: args.isDraft ? "" : now,
      createdAt: now,
      updatedAt: now,
      popularity: 0,
      views: 0,
    });
  },
});

/**
 * Update phone product spec
 */
export const updatePhoneProductSpec = mutation({
  args: {
    productSpecId: v.id("productSpecs"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    specs: v.optional(v.any()),
    productModel: v.optional(v.string()),
    variants: v.optional(
      v.object({
        storage: v.optional(v.array(v.string())),
        color: v.optional(v.array(v.string())),
        ram: v.optional(v.array(v.string())),
      }),
    ),
    category: v.optional(v.array(v.id("categories"))),
    tags: v.optional(v.array(v.id("tags"))),
    isDraft: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const productSpec = await ctx.db.get(args.productSpecId);
    if (!productSpec) {
      throw new ConvexError("Product spec not found");
    }

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.summary !== undefined) updates.summary = args.summary;
    if (args.specs !== undefined) {
      updates.specs = { ...productSpec.specs, ...args.specs };
    }
    if (args.productModel !== undefined)
      updates.productModel = args.productModel;

    if (args.variants !== undefined) {
      updates.specs = {
        ...productSpec.specs,
        variants: {
          ...productSpec.specs?.variants,
          ...args.variants,
        },
      };
    }

    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) updates.tags = args.tags;

    if (args.isDraft !== undefined) {
      updates.isDraft = args.isDraft;
      updates.isPublished = !args.isDraft;
    }

    if (args.isPublished !== undefined) {
      updates.isPublished = args.isPublished;
      updates.isDraft = !args.isPublished;
    }

    await ctx.db.patch(args.productSpecId, updates);
    return args.productSpecId;
  },
});

// ============= PRODUCT LISTING QUERIES =============

/**
 * Get product listing for index/overview page
 * Returns multiple products with preview information
 */
export const getProductListing = query({
  args: {
    productTypeId: v.optional(v.id("productTypes")),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, { productTypeId, limit = 12, offset = 0 }) => {
    let specs = await ctx.db
      .query("productSpecs")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    if (productTypeId) {
      specs = specs.filter((s) => s.productTypeId === productTypeId);
    }

    specs = specs
      .sort((a, b) => b.popularity - a.popularity)
      .slice(offset, offset + limit);

    return specs.map((spec) => ({
      id: spec._id,
      title: spec.title,
      model: spec.specs?.model || "",
      brand: spec.specs?.brand || "",
      slug: spec.specs?.slug || "",
      thumbnail: spec.featuredImage,
      announced: spec.specs?.announced || "",
      variants: spec.specs?.variants || { storage: [], color: [] },
      summary: spec.summary,
      popularity: spec.popularity,
      views: spec.views,
      category: spec.category,
      tags: spec.tags,
    }));
  },
});

/**
 * Get single product overview page
 * Returns detailed product info with related content
 */
export const getProductOverview = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const productSpec = await ctx.db
      .query("productSpecs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!productSpec || !productSpec.isPublished) {
      return null;
    }

    const relatedReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_spec", (q) =>
        q.eq("productSpecId", productSpec._id),
      )
      .collect();

    const relatedArticles = await ctx.db
      .query("articles")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect()
      .then((articles) =>
        articles
          .filter((a) =>
            productSpec.category.some((catId) => a.category.includes(catId)),
          )
          .slice(0, 5),
      );

    return {
      id: productSpec._id,
      title: productSpec.title,
      summary: productSpec.summary,
      model: productSpec.specs?.model || "",
      brand: productSpec.specs?.brand || "",
      slug: productSpec.specs?.slug || "",
      thumbnail: productSpec.featuredImage,
      announced: productSpec.specs?.announced || "",
      operatingSystem: productSpec.specs?.operatingSystem || "",
      variants: productSpec.specs?.variants || {},
      displayHighlights: {
        screen: productSpec.specs?.specifications?.screen || {},
        processor:
          productSpec.specs?.specifications?.processor?.chipset?.name || "",
        camera: productSpec.specs?.specifications?.camera?.main || {},
        battery: productSpec.specs?.specifications?.battery || {},
      },
      views: productSpec.views,
      popularity: productSpec.popularity,
      category: productSpec.category,
      tags: productSpec.tags,
      author: productSpec.authorName,
      relatedReviews: relatedReviews.slice(0, 5),
      relatedArticles: relatedArticles.slice(0, 5),
    };
  },
});

/**
 * Get full product specifications (for docs/review page)
 * Returns complete specifications with TOC structure
 */
export const getProductFullSpecs = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const productSpec = await ctx.db
      .query("productSpecs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (!productSpec || !productSpec.isPublished) {
      return null;
    }

    const allReviews = await ctx.db
      .query("reviews")
      .withIndex("by_product_spec", (q) =>
        q.eq("productSpecId", productSpec._id),
      )
      .collect();

    const reviewsByAspect: Record<string, any[]> = {};
    allReviews.forEach((review) => {
      const aspect = review.reviewAspect || "General";
      if (!reviewsByAspect[aspect]) {
        reviewsByAspect[aspect] = [];
      }
      reviewsByAspect[aspect].push(review);
    });

    const toc = generateTableOfContents(
      productSpec.specs?.specifications || {},
    );

    return {
      id: productSpec._id,
      title: productSpec.title,
      model: productSpec.specs?.model || "",
      brand: productSpec.specs?.brand || "",
      slug: productSpec.specs?.slug || "",
      thumbnail: productSpec.featuredImage,
      announced: productSpec.specs?.announced || "",
      operatingSystem: productSpec.specs?.operatingSystem || "",
      variants: productSpec.specs?.variants || {},
      specifications: productSpec.specs?.specifications || {},
      tableOfContents: toc,
      reviews: reviewsByAspect,
      author: productSpec.authorName,
      createdAt: productSpec.createdAt,
      updatedAt: productSpec.updatedAt,
    };
  },
});

/**
 * Get products by brand
 */
export const getProductsByBrand = query({
  args: { brand: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { brand, limit = 12 }) => {
    const specs = await ctx.db
      .query("productSpecs")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    return specs
      .filter((s) => s.specs?.brand?.toLowerCase() === brand.toLowerCase())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
      .map((s) => ({
        id: s._id,
        model: s.specs?.model,
        brand: s.specs?.brand,
        slug: s.specs?.slug,
        thumbnail: s.featuredImage,
        popularity: s.popularity,
      }));
  },
});

/**
 * Search products by brand or model
 */
export const searchProducts = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchQuery }) => {
    const specs = await ctx.db
      .query("productSpecs")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    const lowerQuery = searchQuery.toLowerCase();

    return specs
      .filter(
        (s) =>
          s.specs?.brand?.toLowerCase().includes(lowerQuery) ||
          s.specs?.model?.toLowerCase().includes(lowerQuery) ||
          s.title.toLowerCase().includes(lowerQuery),
      )
      .sort((a, b) => b.popularity - a.popularity);
  },
});

/**
 * Increment product views
 */
export const incrementProductViews = mutation({
  args: { productSpecId: v.id("productSpecs") },
  handler: async (ctx, { productSpecId }) => {
    const product = await ctx.db.get(productSpecId);
    if (!product) {
      throw new ConvexError("Product not found");
    }

    const newViews = (product.views || 0) + 1;
    await ctx.db.patch(productSpecId, {
      views: newViews,
      popularity: newViews * 0.1,
      updatedAt: new Date().toISOString(),
    });

    return productSpecId;
  },
});

/**
 * Get all brands
 */
export const getAllBrands = query({
  args: {},
  handler: async (ctx) => {
    const specs = await ctx.db
      .query("productSpecs")
      .withIndex("by_published_status", (q) => q.eq("isPublished", true))
      .collect();

    const brands = new Set<string>();
    specs.forEach((s) => {
      if (s.specs?.brand) {
        brands.add(s.specs.brand);
      }
    });

    return Array.from(brands).sort();
  },
});

// ============= HELPER FUNCTIONS =============

function generateTableOfContents(specifications: any): Array<{
  id: string;
  title: string;
  level: number;
}> {
  const sections = [
    "connectivity",
    "body",
    "screen",
    "processor",
    "software",
    "memory",
    "camera",
    "sound",
    "connectivity2",
    "features",
    "battery",
    "misc",
    "tests",
  ];

  return sections
    .filter((section) => specifications[section])
    .map((section) => ({
      id: `spec-${section}`,
      title: formatSectionTitle(section),
      level: 1,
    }));
}

function formatSectionTitle(section: string): string {
  return section
    .replace(/([A-Z])/g, " $1")
    .replace(/2$/, "")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
