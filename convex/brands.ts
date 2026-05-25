import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getAllBrands = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const brands = await ctx.db
      .query("products")
      .withIndex("by_pr_", (q) => q.eq("_id", args.id))
      .collect();

    return brands
      .map((p) => p.brand)
      .filter((b): b is string => b !== undefined)
      .map((b) => b.toLowerCase())
      .filter((b, i, a) => a.indexOf(b) === i)
      .sort();
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
