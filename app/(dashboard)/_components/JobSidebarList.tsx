"use client";
import React from "react";
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
import { MessageSquareTextIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const JobSidebarList = (props: { userId: string }) => {
  const pathname = usePathname();
  const jobs = useQuery(api.job.getAllJobs, {
    userId: props.userId,
  });

  if (jobs === undefined) {
    return (
      <div className="w-full flex flex-col gap-3 px-2">
        <Skeleton className="h-[20px] w-full bg-gray-600" />
        <Skeleton className="h-[20px] w-full bg-gray-600" />
        <Skeleton className="h-[20px] w-full bg-gray-600" />
      </div>
    );
  }
  if (jobs?.length === 0) return null;

  return (
    <SidebarGroup className="pt-0">
      <SidebarGroupLabel className="text-white/80 mt-0">
        Job List
      </SidebarGroupLabel>
      <SidebarMenu
        className="min-h-[350px] max-h-[350px] 
      scrollbar overflow-y-auto pb-2"
      >
        {jobs?.map((item: any) => {
          const interviewPageUrl = `/job/${item._id}`;
          return (
            <SidebarMenuItem key={item._id} className="">
              <SidebarMenuButton
                className={cn(
                  `!bg-transparent !text-white hover:!bg-gray-700 
                transition-colors
                  `,
                  interviewPageUrl === pathname && "!bg-gray-700"
                )}
                asChild
              >
                <Link href={interviewPageUrl} className="text-white">
                  <MessageSquareTextIcon className="w-4 h-4" />
                  <span>{item.jobTitle}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default JobSidebarList;
