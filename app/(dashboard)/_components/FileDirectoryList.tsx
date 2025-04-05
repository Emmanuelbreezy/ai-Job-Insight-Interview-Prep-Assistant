"use client";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type FileItem = {
  id: string;
  name: string;
  type: "file" | "directory";
  extension?: string;
};

const FileDirectoryList = () => {
  const pathname = usePathname();

  const items: FileItem[] = [
    {
      id: "HzAa5dLH1LHsuqAdUOS0t",
      name: "Kara_Resume(2).pdf",
      type: "file",
      extension: ".pdf",
    },
    {
      id: "HzAa5dLH1LHsuqAdUO399",
      name: "myNew_Resume.pdf",
      type: "file",
      extension: ".pdf",
    },
  ];

  console.log(pathname, "pathname");

  return (
    <SidebarGroup>
      <SidebarMenu className="min-h-[50px] scrollbar overflow-y-auto pb-2">
        {items.map((item) => {
          const portfolioUrl = `/portfolio/${item.id}`;
          return (
            <SidebarMenuItem key={item.id} className="">
              <SidebarMenuButton
                className={cn(
                  `*:
                  !bg-transparent !text-white hover:!bg-gray-700 
                transition-colors
                  `,
                  portfolioUrl === pathname && "!bg-gray-700"
                )}
                asChild
              >
                <Link href={portfolioUrl} className="text-white">
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
