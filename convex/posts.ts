import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listLatestPosts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_creation_time")
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("posts", {
      text: args.text,
      completed: false,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const posts = await ctx.db.get(args.id);
    if (!posts) {
      throw new Error("Post not found");
    }
    return await ctx.db.patch(args.id, {
      completed: !posts.completed,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
