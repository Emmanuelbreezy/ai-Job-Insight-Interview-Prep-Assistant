import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { AppMode, JobStatus } from "@/lib/constant";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { CREDIT_COST, FREE_TIER_CREDITS } from "@/lib/api-limit";

export const createJob = mutation({
  args: {
    userId: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
    //Handle API credits
    let apiLimits = await ctx.db
      .query("apiLimits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    // Initialize credits if new user
    if (!apiLimits) {
      const newLimitsId = await ctx.db.insert("apiLimits", {
        userId: args.userId,
        credits: FREE_TIER_CREDITS,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      apiLimits = await ctx.db.get(newLimitsId);
    }
    // Verify credits
    if (!apiLimits) {
      throw new ConvexError("Failed to initialize your account limits");
    }

    if (apiLimits.credits < 1) {
      return {
        data: null,
        message: "You have run out of credits. Buy more to continue.",
        requiresUpgrade: true,
      };
    }

    const jobId = await ctx.db.insert("jobs", {
      userId: args.userId,
      jobTitle: "Untitled",
      originalDescription: args.jobDescription,
      processedDescription: "",
      htmlFormatDescription: "",
      status: JobStatus.PROCESSING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    // 3. Deduct credit after successful job creation
    await ctx.runMutation(api.apiLimits.deductCredit, {
      userId: args.userId,
      amount: CREDIT_COST.JOB_CREATION,
    });
    // 4. Initiate AI processing
    await ctx.scheduler.runAfter(0, internal.actions.processJobWithAI, {
      jobId,
      userId: args.userId,
      jobDescription: args.jobDescription,
    });
    return { data: jobId, success: true };
  },
});

export const getAllJobs = query({
  args: {
    userId: v.string(), // User ID to filter jobs
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("jobs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});
export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"),
    jobTitle: v.optional(v.string()),
    processedDescription: v.optional(v.string()),
    htmlFormatDescription: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal(JobStatus.PROCESSING),
        v.literal(JobStatus.READY),
        v.literal(JobStatus.FAILED)
      )
    ),
  },
  handler: async (ctx, args) => {
    const { jobId, ...rest } = args;
    await ctx.db.patch(jobId, {
      ...rest,
      updatedAt: Date.now(),
    });
  },
});

export const getByJobId = query({
  args: {
    jobId: v.string(),
    jobMode: v.string(),
  },
  handler: async (ctx, { jobId, jobMode }) => {
    if (!jobId) {
      return {
        data: null,
        success: false,
        message: "jobId is required",
      };
    }
    if (jobMode === AppMode.JOB_INSIGHT) {
      const jobConversions = await ctx.db
        .query("jobInsightConversations")
        .withIndex("by_job", (q) => q.eq("jobId", jobId as Id<"jobs">))
        .collect();
      if (!jobConversions) return { data: null, success: true };
      return { data: jobConversions, success: true };
    } else if (jobMode === AppMode.INTERVIEW_SESSION) {
      return { data: [], success: true };
    }
    return { data: [], success: false };
  },
});
