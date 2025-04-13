import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { AppMode, JobStatus } from "@/lib/constant";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const createJob = mutation({
  args: {
    userId: v.string(),
    jobDescription: v.string(),
  },
  handler: async (ctx, args) => {
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
    // Call internal function to process with AI
    await ctx.scheduler.runAfter(0, internal.actions.processJobWithAI, {
      jobId,
      userId: args.userId,
      jobDescription: args.jobDescription,
    });

    return jobId;
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
