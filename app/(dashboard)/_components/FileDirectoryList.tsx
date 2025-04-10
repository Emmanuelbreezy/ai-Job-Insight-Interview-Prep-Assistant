"use client";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const FileDirectoryList = (props: { userId: string }) => {
  const pathname = usePathname();
  const files = useQuery(api.files.getFilesByUserId, { userId: props.userId });

  return (
    <SidebarGroup className="pt-0">
      <SidebarGroupLabel className="text-white/80 mt-0">
        Resume
      </SidebarGroupLabel>
      <SidebarMenu
        className="min-h-[350px] max-h-[350px] 
      scrollbar overflow-y-auto pb-2"
      >
        {files?.map((item) => {
          const filePageUrl = `/file/${item._id}`;
          return (
            <SidebarMenuItem key={item._id} className="">
              <SidebarMenuButton
                className={cn(
                  `!bg-transparent !text-white hover:!bg-gray-700 
                transition-colors
                  `,
                  filePageUrl === pathname && "!bg-gray-700"
                )}
                asChild
              >
                <Link href={filePageUrl} className="text-white">
                  <FileTextIcon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default FileDirectoryList;
