"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { CheckCircle, Sparkles } from "lucide-react";

export const UpgradeModal = () => {
  const { isOpen, closeModal } = useUpgradeModal();
  const onUpgrade = () => {};
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-3">
          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">Unlimited Portfolio Generations</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">Priority AI Processing</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm">Advanced Customization Options</span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Monthly Plan</h4>
                <p className="text-sm text-muted-foreground">Billed monthly</p>
              </div>
              <span className="font-semibold">$9.99</span>
            </div>
          </div>

          {/* Upgrade Button */}
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white hover:opacity-90"
          >
            Upgrade Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
