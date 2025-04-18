import { PaymentStatus } from "@/lib/constant";
import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createPayment = mutation({
  args: {
    orderId: v.optional(v.string()), // PayPal order ID
    transactionId: v.optional(v.string()), // PayPal transaction ID
    credits: v.number(),
    userId: v.string(), // User ID
    amount: v.number(), // Amount in USD
    status: v.union(
      v.literal(PaymentStatus.PENDING),
      v.literal(PaymentStatus.COMPLETED),
      v.literal(PaymentStatus.FAILED)
    ),
  },
  handler: async (ctx, args) => {
    const paymentId = await ctx.db.insert("payments", {
      paypalOrderId: args.orderId,
      transactionId: args.transactionId,
      userId: args.userId,
      amount: args.amount,
      credits: args.credits,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

export const updatePayment = mutation({
  args: {
    paymentId: v.string(), // The ID of the payment record
    status: v.union(
      v.literal(PaymentStatus.PENDING),
      v.literal(PaymentStatus.COMPLETED),
      v.literal(PaymentStatus.FAILED)
    ),
    transactionId: v.optional(v.string()), // Optional transaction ID
    paypalOrderId: v.optional(v.string()), // Optional transaction ID
  },
  handler: async (ctx, { paymentId, status, transactionId }) => {
    if (!paymentId) {
      throw new ConvexError("Payment Id missing");
    }
    await ctx.db.patch(paymentId as Id<"payments">, {
      status,
      transactionId,
      updatedAt: Date.now(),
    });
  },
});
