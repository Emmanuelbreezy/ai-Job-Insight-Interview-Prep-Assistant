"use client";
import { Loader, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";

interface UserUsage {
  portfoliosGenerated: number;
  messagesSent: number;
  planLimit: {
    portfolios: number;
    messages: number;
  };
}

interface SidebarFooterContentProps {
  isSignedIn: boolean;
  isLoaded: boolean;
  userName: string;
  userInitial: string;
  emailAddress: string;
  userPlan: "FREE" | "PRO";
  userUsage: UserUsage;
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
  userUsage,
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

  const portfolioProgress =
    (userUsage.portfoliosGenerated / userUsage.planLimit.portfolios) * 100;
  const messageProgress =
    (userUsage.messagesSent / userUsage.planLimit.messages) * 100;

  return (
    <div className="flex flex-col gap-3">
      {isSignedIn && userPlan === "FREE" && (
        <div className="bg-gradient-to-r from-purple-600 to-primary rounded-lg p-4">
          <h3 className="text-white font-semibold text-sm mb-1">
            Upgrade to Pro
          </h3>
          <p className="text-white/80 text-xs mb-2">Unlock premium features</p>
          <Button
            type="button"
            onClick={onUpgradeClick}
            className="w-full bg-white text-primary font-semibold hover:bg-white/90 text-sm"
          >
            <Sparkles />
            Upgrade Now
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
                    userPlan === "PRO"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {userPlan} Plan
                </span>
              </div>

              {/* Usage Statistics */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Portfolios Generated</span>
                    <span>
                      {userUsage.portfoliosGenerated}/
                      {userUsage.planLimit.portfolios}
                    </span>
                  </div>
                  <Progress value={portfolioProgress} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>AI Messages</span>
                    <span>
                      {userUsage.messagesSent}/{userUsage.planLimit.messages}
                    </span>
                  </div>
                  <Progress value={messageProgress} className="h-2" />
                </div>
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
