import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

export const addThumbnail = mutation({
  args: {
    thumbnailImage: v.id("_storage"),
    description: v.string(),
    snippet: v.string(),
    image: v.id("_storage"),
    imageDescription: v.string(),
    summary: v.optional(v.string()),
    headline: v.array(v.string()),
    secondHeadline: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const thumbnail = await ctx.db.insert("thumbnails", {
      featuredImage: args.image,
      description: args.description,
      snippet: args.snippet,
      image: args.image,
      exerpt: args.imageDescription,
      summary: args.summary,
      headline: args.headline,
      secondHeadline: args.secondHeadline,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return thumbnail;
  },
});
