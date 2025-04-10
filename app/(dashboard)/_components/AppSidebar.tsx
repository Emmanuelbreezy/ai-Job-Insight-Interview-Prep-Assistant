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
import FileDirectoryList from "./FileDirectoryList";

const AppSidebar = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const { openModal } = useUpgradeModal();

  const userId = user?.id || null;

  return (
    <>
      <Sidebar className="!bg-[rgb(33,33,33)] px-2">
        <SidebarHeader
          className="flex flex-row w-full items-center justify-between 
      m-[4px_0px_0px]"
        >
          <Link href="/" className="text-white text-xl">
            Resume2<b className="text-primary">Portfolio</b>
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
                  <span>New Portfoilo</span>
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* {File DirectoryList} */}
          {userId && <FileDirectoryList {...{ userId }} />}

          {/* {SignIn Prompt} */}
          {!isSignedIn && <SignInPrompt />}
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterContent
            isSignedIn={isSignedIn || false}
            isLoaded={isLoaded}
            userName={user?.fullName!}
            emailAddress={user?.primaryEmailAddress?.emailAddress!}
            userInitial={user?.firstName?.charAt(0) || ""}
            userPlan="FREE"
            userUsage={{
              portfoliosGenerated: 3,
              messagesSent: 15,
              planLimit: {
                portfolios: 5,
                messages: 20,
              },
            }}
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
