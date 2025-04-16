"use client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { InfoIcon, Sparkles } from "lucide-react";
import { useState } from "react";

const CREDIT_MIN_LIMIT = 10;
const CREDIT_MAX_LIMIT = 200;

const DEFAULT_VALUE = 100;

export const UpgradeModal = () => {
  const { isOpen, closeModal } = useUpgradeModal();
  const [selectedCredits, setSelectedCredits] = useState(DEFAULT_VALUE); // Default to 10 credits

  const pricePerCredit = 0.1; // $0.10 per credit
  const totalPrice = selectedCredits * pricePerCredit;

  const onUpgrade = () => {
    // Handle credit purchase logic here
    console.log(
      `Purchased ${selectedCredits} credits for $${totalPrice.toFixed(2)}`
    );
    closeModal();
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
            {/* <div className="flex justify-between text-sm">
              <span>Total Price</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div> */}
          </div>

          {/* Buy Credits Button */}
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90"
          >
            Buy {selectedCredits} Credits for ${totalPrice.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
