import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "lucide-react";

const JobDetails = ({ jobId }: { jobId: Id<"jobs"> }) => {
  const job = useQuery(api.jobInsightConversation.getJob, { jobId });

  if (job === undefined) {
    return (
      <div className="w-full flex justify-center gap-2 p-5">
        <Loader className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (!job) return <div className="space-y-4 px-5">Job not found</div>;

  return (
    <div className="space-y-4 px-4 pb-5">
      <div className="w-full shadow-lg border-gray-500 rounded-lg p-3 pt-4">
        <h2 className="text-xl font-semibold mb-1">{job.jobTitle}</h2>
        <div className="prose !text-[15px]">
          <div
            dangerouslySetInnerHTML={{
              __html: job.htmlFormatDescription || job.originalDescription,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
