"use client";
import { useSearchParams } from "next/navigation";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const VerifyPayment = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  //const payerID = searchParams.get("PayerID");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const capturePayPalOrder = useAction(api.paymentAction.capturePayPalOrder);

  useEffect(() => {
    if (token && user?.id) {
      (async () => {
        try {
          await capturePayPalOrder({ orderID: token, userId: user.id });
          setStatus("success");
          toast.success("Payment successful! Credits added.");
        } catch (error) {
          setStatus("error");
          const errorMessage =
            error instanceof ConvexError && error.data?.message
              ? "Failed to verify payment."
              : "Payment failed";
          toast.error(errorMessage);
        }
      })();
    }
  }, [token, user?.id, capturePayPalOrder]);

  const { icon, title, description } = {
    loading: {
      icon: <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />,
      title: "Verifying payment...",
      description: "Please wait while we process your payment.",
    },
    success: {
      icon: <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />,
      title: "Payment Successful!",
      description: "Your payment has been processed successfully.",
    },
    error: {
      icon: <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />,
      title: "Payment Failed",
      description:
        "There was an issue processing your payment. Please try again.",
    },
  }[status];

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-white p-8 text-center max-w-md w-full">
        {icon}
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        <p className="text-gray-500 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default VerifyPayment;
