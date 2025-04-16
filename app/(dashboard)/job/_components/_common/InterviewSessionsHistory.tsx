"use client";
import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedbackDialog from "./FeedbackDialog";

const InterviewSessionsHistory = ({ jobId }: { jobId: Id<"jobs"> }) => {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const data = useQuery(api.interviewSession.getInterviewSessionsByJobId, {
    jobId,
  });

  if (data === undefined) {
    return (
      <div className="w-full flex justify-center gap-2 p-5">
        <Loader className="h-8 w-8 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full px-4">
      <div className="w-full border-gray-500 p-3 pb-0">
        <h2 className="text-xl font-semibold">Interview Sessions History</h2>
      </div>

      <div className="w-full">
        {data?.data?.length === 0 && (
          <p className="px-3 text-gray-700">No history yet</p>
        )}
        {data?.data && (
          <Accordion
            type="single"
            collapsible
            value={expandedSession || ""}
            onValueChange={setExpandedSession}
          >
            {data?.data?.map((session) => (
              <AccordionItem
                key={session?._id}
                value={session?._id}
                className="mb-2"
              >
                <AccordionTrigger
                  className="!bg-gray-50 p-4 rounded-lg 
              !no-underline w-full relative"
                >
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant="outline"
                      className="bg-primary/10 !border-primary/50 text-primary"
                    >
                      Session
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(session?.createdAt),
                        "MMM dd, yyyy hh:mm a"
                      )}
                    </span>
                  </div>
                  <FeedbackDialog sessionId={session._id}>
                    <Button
                      variant="outline"
                      className="absolute right-10"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent accordion from toggling
                      }}
                    >
                      View Feedback
                    </Button>
                  </FeedbackDialog>
                </AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  {session?.messages?.map((message, index) => (
                    <div key={index} className="relative pl-6">
                      <div className="absolute left-2 top-0 h-full w-px bg-gray-200" />
                      <div
                        className="absolute left-1 top-2 h-2 w-2 rounded-full border-2
                     border-primary bg-primary"
                      />
                      <div className="space-y-2">
                        <p className="font-medium text-gray-700">
                          {message?.question?.text}
                        </p>
                        <p className="w-full text-sm text-gray-500 line-clamp-2">
                          {message?.answer?.text}
                        </p>
                      </div>
                      {index < session?.messages?.length - 1 && (
                        <div className="h-4" />
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <br />
        <br />
      </div>
    </div>
  );
};

export default InterviewSessionsHistory;
