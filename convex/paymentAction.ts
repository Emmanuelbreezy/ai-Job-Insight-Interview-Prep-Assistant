"use node";
import axios from "axios";
import { PaymentStatus } from "@/lib/constant";
import { action } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;
const PAYPAL_API_BASE_URL = process.env.PAYPAL_API_BASE_URL!;

// Helper function to get PayPal access toke
const getAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const response = await axios.post(
    `${PAYPAL_API_BASE_URL}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
    }
  );
  return response.data.access_token;
};

// Mutation to create a PayPal order
export const createPayPalOrder = action({
  args: {
    userId: v.string(),
    amount: v.number(),
    credits: v.number(),
    redirectUrl: v.string(),
  },
  handler: async (
    ctx,
    { amount, userId, credits, redirectUrl }
  ): Promise<string> => {
    try {
      const accessToken = await getAccessToken();

      const paymentId = await ctx.runMutation(api.payment.createPayment, {
        userId,
        amount: amount,
        credits: credits,
        status: PaymentStatus.PENDING,
      });

      const response = await axios.post(
        `${PAYPAL_API_BASE_URL}/v2/checkout/orders`,
        {
          intent: "CAPTURE",
          purchase_units: [
            {
              amount: { currency_code: "USD", value: amount.toFixed(2) },
              custom_id: `${paymentId.toString()}:${credits}`,
            },
          ],
          application_context: {
            return_url: redirectUrl, // Redirect URL after payment
            cancel_url: redirectUrl, // Redirect URL if payment is canceled
            // user_action: "CONTINUE", // Skip PayPal login and go directly to payment
            // landing_page: "BILLING",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const approvalLink = response.data.links.find(
        (link: any) => link.rel === "approve"
      );
      if (!approvalLink) {
        throw new ConvexError("No approval link found in PayPal response");
      }
      return approvalLink.href;
    } catch (error) {
      console.log(error);
      throw new ConvexError("Failed to create order");
    }
  },
});

// Mutation to capture a PayPal order
export const capturePayPalOrder = action({
  args: {
    orderID: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { orderID, userId }) => {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.post(
        `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const capture =
        response.data?.purchase_units?.[0]?.payments?.captures?.[0];
      if (!capture) throw new ConvexError("Capture data not found");
      //const amount = parseFloat(capture.amount.value);
      const transactionId = capture.id;
      const customId = capture.custom_id;
      const [paymentId, credits] = customId.split(":"); // Split by ":"

      console.log(capture, "capture");

      await ctx.runMutation(api.payment.updatePayment, {
        paymentId,
        paypalOrderId: orderID,
        status: PaymentStatus.COMPLETED,
        transactionId,
      });
      await ctx.runMutation(api.apiLimits.addCredits, {
        userId,
        credits: parseInt(credits),
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw new ConvexError("Failed to create order");
    }
  },
});
