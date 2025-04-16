"use client";
import { Loader, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PLANS } from "@/lib/api-limit";

interface SidebarFooterContentProps {
  isSignedIn: boolean;
  isLoaded: boolean;
  userName: string;
  userInitial: string;
  emailAddress: string;
  userPlan: "FREE" | "PRO";
  credits: number;
  onUpgradeClick: () => void;
  onSignOut: () => void;
}

export const SidebarFooterContent = ({
  isSignedIn,
  isLoaded,
  userName,
  emailAddress,
  userInitial,
  userPlan,
  credits,
  onUpgradeClick,
  onSignOut,
}: SidebarFooterContentProps) => {
  /// Calculates portfolio and message usage percentages
  // based on user's current usage vs plan limits

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center pb-5">
        <Loader size="2rem" className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isSignedIn && userPlan === "FREE" && (
        <div className="bg-gradient-to-r from-purple-600 to-primary rounded-lg p-4">
          <h3 className="text-white font-semibold text-sm mb-1">
            Credits Balance: {credits?.toFixed(1)}
          </h3>
          <p className="text-white/80 text-xs mb-2">Unlock premium features</p>
          <Button
            type="button"
            onClick={onUpgradeClick}
            className="w-full bg-white text-primary font-semibold hover:bg-white/90 text-sm"
          >
            <Sparkles />
            Buy Credits
          </Button>
        </div>
      )}

      {/* User Profile Popover (Only for logged-in users) */}
      {isSignedIn && (
        <Popover>
          <PopoverTrigger asChild>
            <div
              role="button"
              className="flex items-center gap-3 p-2 rounded-lg 
      hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-800 border text-primary-foreground">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{userName}</p>
                <p className="text-muted-foreground text-xs">{emailAddress}</p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            sideOffset={20}
            className="w-80 p-4 drop-shadow-2xl"
            align="end"
          >
            <div className="space-y-4">
              {/* Plan Information */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Plan</span>
                <span
                  className={`text-sm ${
                    userPlan === PLANS.PRO
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {userPlan} Plan
                </span>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={onSignOut}
              >
                Sign Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
