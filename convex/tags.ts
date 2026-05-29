import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db.query("tags").collect();
    return tags;
  },
});
