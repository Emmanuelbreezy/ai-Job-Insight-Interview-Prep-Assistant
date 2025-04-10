import { Role } from "@/lib/constant";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
    userId: v.string(), // Clerk user ID
    name: v.string(),
    url: v.optional(v.string()),
    storageId: v.string(),
    portfolioData: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  messages: defineTable({
    userId: v.string(),
    fileId: v.id("files"),
    text: v.string(),
    role: v.union(v.literal(Role.USER), v.literal(Role.AI)),
    createdAt: v.number(),
  }).index("by_file", ["fileId"]),

  apiLimits: defineTable({
    userId: v.string(),
    plan: v.union(v.literal("FREE"), v.literal("PRO")),
    fileCount: v.number(),
    messageCount: v.number(),
    lastReset: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
