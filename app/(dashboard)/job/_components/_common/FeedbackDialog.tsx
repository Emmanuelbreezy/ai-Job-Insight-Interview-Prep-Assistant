"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader } from "lucide-react";

interface FeedbackDialogProps {
  sessionId: Id<"interviewSessions">;
  children: React.ReactNode;
}

const FeedbackDialog = ({ sessionId, children }: FeedbackDialogProps) => {
  const feedbackData = useQuery(api.interviewSession.getInterviewFeedback, {
    sessionId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Session Feedback</DialogTitle>
        </DialogHeader>
        <div
          className="w-full flex flex-col items-center justify-start 
        min-h-[30vh] pt-4"
        >
          {feedbackData === undefined && (
            <Loader className="h-8 w-8 animate-spin mx-auto" />
          )}
          {feedbackData && (
            <div className=" w-full space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Total Score: {feedbackData?.totalScore} /{" "}
                  {feedbackData?.feedbackList?.length * 100}
                </p>
                <Progress
                  value={feedbackData?.totalPercentage}
                  className="h-2"
                />
              </div>
              {/* Feedback List */}
              {feedbackData?.feedbackList?.map((feedback, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium text-gray-700">Q{index + 1}</p>
                  <div className="text-sm text-gray-600">
                    <p>
                      <strong>Score:</strong> {feedback.score}
                    </p>
                    <p>
                      <strong>Grade:</strong> {feedback.grade}
                    </p>
                    <p>
                      <strong>Improvements:</strong>{" "}
                      {feedback.improvements.join(", ")}
                    </p>
                    <p>
                      <strong>Feedback:</strong> {feedback.feedback}
                    </p>
                  </div>
                  {index < feedbackData?.feedbackList?.length - 1 && (
                    <hr className="my-4" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
