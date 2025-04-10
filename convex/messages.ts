import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMessage = mutation({
  args: {
    userId: v.string(),
    fileId: v.id("files"),
    text: v.string(),
    role: v.union(v.literal("USER"), v.literal("AI")),
  },
  handler: async (ctx, args) => {
    const [file] = await Promise.all([ctx.db.get(args.fileId)]);
    if (!file) throw new Error("File not found");
    return await ctx.db.insert("messages", {
      userId: args.userId,
      fileId: args.fileId,
      text: args.text,
      role: args.role,
      createdAt: Date.now(),
    });
  },
});

export const getMessagesByFileId = query({
  args: {
    fileId: v.id("files"),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.union(v.string(), v.null()),
      })
    ),
  },
  handler: async (ctx, args) => {
    //const { fileId, paginationOpts } = args;
    const file = await ctx.db.get(args.fileId);
    if (!file) throw new Error("File not found");

    // const paginationOptions = paginationOpts || {
    //   numItems: 30,
    //   cursor: null,
    // };

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .order("asc")
      //.paginate(paginationOptions);
      .collect();

    return messages;
  },
});
