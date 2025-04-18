"use client";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { InfoIcon, Loader, Sparkles } from "lucide-react";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSignInModal } from "@/hooks/use-signin-modal";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import {
  CREDIT_DEFAULT_VALUE,
  CREDIT_MAX_LIMIT,
  CREDIT_MIN_LIMIT,
  PRICE_PER_CREDIT,
} from "@/lib/api-limit";

const NEXT_PUBLIC_REDIRECT_URL = process.env.NEXT_PUBLIC_REDIRECT_URL!;

export const UpgradeModal = () => {
  const { user } = useUser();
  const { isOpen, closeModal } = useUpgradeModal();
  const { open: openSignInModal } = useSignInModal();
  const [selectedCredits, setSelectedCredits] = useState(CREDIT_DEFAULT_VALUE);

  const [loading, setLoading] = useState(false);

  const createPayPalOrder = useAction(api.paymentAction.createPayPalOrder);
  const totalPrice = selectedCredits * PRICE_PER_CREDIT;

  const onCreateOrder = async () => {
    if (!user) {
      openSignInModal();
      return;
    }
    setLoading(true);
    try {
      const paypalApprovalUrl = await createPayPalOrder({
        amount: totalPrice,
        userId: user.id,
        credits: selectedCredits,
        redirectUrl: NEXT_PUBLIC_REDIRECT_URL,
      });
      // Step 2: Redirect the user to PayPal for payment
      window.location.href = paypalApprovalUrl;
    } catch (error) {
      console.log(error);
      const errorMessage =
        error instanceof ConvexError && error.data?.message
          ? error.data.message
          : "Failed to  create order.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Buy Credits
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-1">
          <div
            className="flex items-start gap-2 bg-red-50 p-3 rounded-lg
           text-primary"
          >
            <InfoIcon className="w-4 h-4 mt-1.5 shrink-0" />
            <p className="text-sm">
              Each credit allows you to use AI for jobs, interviews, or feedback
              task.
            </p>
          </div>
          {/* Credit Purchase Slider */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Buy Credits</span>
              <span>{selectedCredits} credits</span>
            </div>
            <Slider
              value={[selectedCredits]}
              onValueChange={(value) => setSelectedCredits(value[0])}
              min={CREDIT_MIN_LIMIT}
              max={CREDIT_MAX_LIMIT}
              step={10}
            />
          </div>

          {/* Buy Credits Button */}
          <Button
            onClick={onCreateOrder}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white
             disabled:opacity-50
            "
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Buy {selectedCredits} Credits for ${totalPrice.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
