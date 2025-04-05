"use client";
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
import { FolderPlusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import SignInPrompt from "./_common/SignInPrompt";
import { SidebarFooterContent } from "./_common/SidebarFooterContent";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { UpgradeModal } from "./UpgradeModal";
import FileDirectoryList from "./FileDirectoryList";

const AppSidebar = () => {
  const { openModal } = useUpgradeModal();

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
          <SidebarGroup className="mb-3">
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
              <Button
                className="w-full !bg-transparent !text-white border
                border-[rgba(255,255,255,0.2)] mt-3 !h-10 !rounded-lg 
                !font-medium text-sm hover:!bg-gray-700 transition-colors"
                variant="outline"
              >
                <FolderPlusIcon className="w-4 h-4" />
                <span>New Folder</span>
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* {File DirectoryList} */}
          <FileDirectoryList />

          {/* {SignIn Prompt} */}
          <SignInPrompt />
        </SidebarContent>
        <SidebarFooter>
          <SidebarFooterContent
            userName="John Doe"
            emailAddress="johndoe@gmail.com"
            userInitial="J"
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
            onSignOut={() => console.log("Log out")}
          />
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
