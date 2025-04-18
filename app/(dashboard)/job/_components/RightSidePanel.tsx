"use client";
import React from "react";
import { useAppContext } from "@/context/AppProvider";
import { AppMode } from "@/lib/constant";
import InterviewSessionsHistory from "./_common/InterviewSessionsHistory";
import JobDetails from "./_common/JobDetails";

const RightSidePanel = (props: { jobId: string }) => {
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

export default RightSidePanel;
