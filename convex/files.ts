import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFile = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    storageId: v.string(),
    url: v.optional(v.string()),
    portfolioData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("files", {
      userId: args.userId,
      name: args.name,
      storageId: args.storageId,
      url: args.url,
      portfolioData: args.portfolioData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

export const getFileUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    console.log(fileUrl, "fileUrl");
    if (!fileUrl) {
      throw new Error("File not found");
    }
    return fileUrl;
  },
});

export const getFilesByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, { userId }) => {
    const files = await ctx.db
      .query("files")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return files;
  },
});

export const updateFile = mutation({
  args: {
    fileId: v.id("files"),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    portfolioData: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { fileId, ...updateData } = args;
    await ctx.db.patch(fileId, {
      ...updateData,
      updatedAt: Date.now(),
    });
  },
});
