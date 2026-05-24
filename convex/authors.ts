import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const getAuthorBySlug = query({
  args: {
    slug: v.id("slug"),
  },
  handler: async (ctx, args) => {
    const authorSlug = await ctx.db
      .query("authors")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return { slug: authorSlug };
  },
});

export const createProfilePage = mutation({
  args: {
    username: v.string(),
    bio: v.string(),
    avatar: v.id("_storage"),
  },
  handler: async (ctx, args) => {},
});

export const profile = v.object({
  profilePage: v.boolean(),
  userAdmin: v.boolean(),
  username: v.string(),
  avatar: v.id("_storage"),
  bio: v.string(),
  socialmedia: v.array(v.id("socialmedia")),
  userProfilePage: v.string(),
  email: v.string(),
});
