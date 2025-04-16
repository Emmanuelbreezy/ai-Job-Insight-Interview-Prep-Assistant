import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { FREE_TIER_CREDITS, PLANS } from "@/lib/api-limit";

export const getUserCredits = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiLimits = await ctx.db
      .query("apiLimits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return {
      credits: apiLimits?.credits ?? FREE_TIER_CREDITS,
      plan: apiLimits?.plan ?? PLANS.FREE,
    };
  },
});

export const deductCredit = mutation({
  args: { userId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    const apiLimits = await ctx.db
      .query("apiLimits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!apiLimits || apiLimits.credits < args.amount) {
      throw new ConvexError({
        type: "INSUFFICIENT_CREDITS",
        message: "You have run out of credits",
        required: args.amount,
        available: apiLimits?.credits ?? 0,
      });
    }
    const newCredits = parseFloat((apiLimits.credits - args.amount).toFixed(2));
    await ctx.db.patch(apiLimits._id, {
      credits: newCredits,
      updatedAt: Date.now(),
    });
  },
});
