"use client";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useAppContext } from "@/context/AppProvider";
import { AppMode } from "@/lib/constant";
import InterviewSessionsHistory from "./_common/InterviewSessionsHistory";
import JobDetails from "./_common/JobDetails";

const JobView = (props: { jobId: Id<"jobs"> }) => {
  const { jobMode } = useAppContext();
  return (
    <div className="flex w-full h-screen overflow-y-auto ">
      <div className="w-full">
        {jobMode === AppMode.JOB_INSIGHT ? (
          <JobDetails jobId={props.jobId} />
        ) : (
          <InterviewSessionsHistory jobId={props.jobId} />
        )}
      </div>
    </div>
  );
};

export default JobView;
