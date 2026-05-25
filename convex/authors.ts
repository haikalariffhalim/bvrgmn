import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getAuthorById = query({
  args: {
    id: v.id("authors"),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.id);
    return author;
  },
});

export const getAuthorBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query("authors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return author;
  },
});

export const getAuthorByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db
      .query("authors")
      .withIndex("by_author_email", (q) => q.eq("email", args.email))
      .first();
    return author;
  },
});

export const createAuthor = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    slug: v.string(),
    profileImg: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("authors")
      .withIndex("by_author_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new ConvexError("Author with this email already exists");
    }

    const author = await ctx.db.insert("authors", {
      name: args.name,
      email: args.email,
      slug: args.slug,
      profileImg: args.profileImg,		
    });

    return author;
  },
});

export const updateAuthor = mutation({
  args: {
    authorId: v.id("authors"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    slug: v.optional(v.string()),
    profileImg: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const author = await ctx.db.get(args.authorId);

    if (!author) {
      throw new ConvexError("Author not found");
    }

    const updates: Record<string, any> = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.profileImg !== undefined) updates.profileImg = args.profileImg;

    await ctx.db.patch(args.authorId, updates);
    return args.authorId;
  },
});
