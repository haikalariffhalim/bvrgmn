import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories;
  },
});

export const getCategoryById = query({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, { categoryId }) => {
    const category = await ctx.db.get(categoryId);
    if (!category) {
      throw new ConvexError("Category not found");
    }
    return category;
  },
});

export const getCategoryBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!category) {
      throw new ConvexError("Category not found");
    }
    return category;
  },
});

export const listAllCategories = query({
  args: {
    slug: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .paginate(args.paginationOpts);

    return categories;
  },
});

export const Category = mutation({
  args: {
    id: v.union(
      v.literal("tech"),
      v.literal("economics"),
      v.literal("programming"),
      v.literal("entertainment"),
      v.literal("AI"),
      v.literal("culture"),
      v.literal("life"),
    ),
    slug: v.string(),
    themes: v.union(
      v.literal("theoVhon"),
      v.literal("bobbyLee"),
      v.literal("joeRogan"),
      v.literal(""),
      v.literal("AI"),
      v.literal("culture"),
      v.literal("life"),
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new ConvexError("Category already exists");
    }

    const category = await ctx.db.insert("categories", {
      id: args.id,
      slug: args.slug,
      themes: args.themes,
      description: args.description,
    });

    return category;
  },
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    slug: v.optional(v.string()),
    themes: v.union(
      v.literal("TheoVhon"),
      v.literal("BobbyLee"),
      v.literal("JoeRogan"),
      v.literal("BillBurr"),
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Check if category exists
    const category = await ctx.db.get(id);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    // Check if new slug conflicts with another category
    if (args.slug !== undefined && args.slug !== category.slug) {
      const newSlug = args.slug;
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();

      if (existing) {
        throw new ConvexError("Another category with this slug already exists");
      }
    }

    await ctx.db.patch(id, updates);

    return { success: true };
  },
});

export const deleteCategory = mutation({
  args: {
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);
    if (!category) {
      throw new ConvexError("Category not found");
    }

    await ctx.db.delete(args.id);
    return {
      success: true,
    };
  },
});

export const searchCategories = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const categories = await ctx.db.query("categories").collect();
    const lowerQuery = args.query.toLowerCase();
    return categories.filter((cat) =>
      cat.slug.toLowerCase().includes(lowerQuery),
    );
  },
});

export const countCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.length;
  },
});
