"use client";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SignInPrompt from "./_common/SignInPrompt";
import { SidebarFooterContent } from "./_common/SidebarFooterContent";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import JobSidebarList from "./JobSidebarList";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FREE_TIER_CREDITS } from "@/lib/api-limit";

const AppSidebar = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { openModal } = useUpgradeModal();
  const userId = user?.id || null;

  const apiLimits = useQuery(api.apiLimits.getUserCredits, {
    userId: user?.id || "",
  });

  const isLoading = apiLimits === undefined;
  const credits =
    apiLimits?.credits !== undefined ? apiLimits.credits : FREE_TIER_CREDITS;

  return (
    <>
      <Sidebar className="!bg-[rgb(33,33,33)] px-2">
        <SidebarHeader
          className="flex flex-row w-full items-center justify-between 
      m-[4px_0px_0px]"
        >
          <Link href="/" className="text-white text-xl">
            Job<b className="text-primary">Assistant</b>.ai
          </Link>
          <SidebarTrigger className="!text-white !p-0 !bg-gray-800"></SidebarTrigger>
        </SidebarHeader>
        <SidebarContent className="overflow-hidden">
          <SidebarGroup>
            <SidebarGroupContent>
              <Link href="/">
                <Button
                  className="w-full !bg-transparent !text-white border
                border-[rgba(255,255,255,0.2)] mt-3 !h-10 !rounded-lg 
                !font-medium text-sm hover:!bg-gray-700 transition-colors"
                  variant="outline"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Job</span>
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* {File DirectoryList} */}
          {userId && <JobSidebarList {...{ userId }} />}

          {/* {SignIn Prompt} */}
          {!isSignedIn && isLoaded ? <SignInPrompt /> : null}
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterContent
            isSignedIn={isSignedIn || false}
            isLoaded={isLoaded}
            userName={user?.fullName!}
            emailAddress={user?.primaryEmailAddress?.emailAddress!}
            userInitial={user?.firstName?.charAt(0) || ""}
            credits={credits}
            loadingCredit={isLoading}
            onUpgradeClick={() => openModal()}
            onSignOut={() =>
              signOut({
                redirectUrl: "/",
              })
            }
          />
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
