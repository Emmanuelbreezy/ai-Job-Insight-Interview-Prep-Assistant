"use client";
import { Loader, LogOutIcon, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SidebarFooterContentProps {
  isSignedIn: boolean;
  isLoaded: boolean;
  userName: string;
  userInitial: string;
  emailAddress: string;
  credits: number;
  loadingCredit: boolean;
  onUpgradeClick: () => void;
  onSignOut: () => void;
}

export const SidebarFooterContent = ({
  isSignedIn,
  isLoaded,
  userName,
  emailAddress,
  userInitial,
  credits,
  loadingCredit,
  onUpgradeClick,
  onSignOut,
}: SidebarFooterContentProps) => {
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center pb-5">
        <Loader size="2rem" className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {isSignedIn && (
        <div className="bg-gradient-to-r from-purple-600 to-primary rounded-lg p-4">
          <h3 className="text-white font-semibold text-sm mb-1">
            {loadingCredit ? (
              <Loader />
            ) : (
              `Credits Balance: ${credits?.toFixed(1)}`
            )}
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
            side="top"
            className="w-64 px-4 pt-5 pb-2 bg-[rgb(40,40,40)] !text-white border-gray-600"
            align="end"
          >
            <div className="space-y-2">
              <h4 className="font-semibold leading-none text-sm mb-1 pl-1">
                My Account
              </h4>
              {/* Sign Out Button */}
              <Button
                variant="ghost"
                className="w-full justify-start text-sm !pl-1 !ring-0"
                onClick={onSignOut}
              >
                <LogOutIcon className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
