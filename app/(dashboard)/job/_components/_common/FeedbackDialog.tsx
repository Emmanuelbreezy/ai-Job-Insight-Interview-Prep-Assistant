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
import { Badge } from "@/components/ui/badge";

interface FeedbackDialogProps {
  sessionId: Id<"interviewSessions">;
  children: React.ReactNode;
}

const getGradeColor = (grade: string) => {
  switch (grade.toLowerCase()) {
    case "excellent":
      return "bg-green-600 text-white";
    case "good":
      return "bg-blue-500 text-white";
    case "average":
      return "bg-yellow-500 text-black";
    case "poor":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const FeedbackDialog = ({ sessionId, children }: FeedbackDialogProps) => {
  const feedbackData = useQuery(api.interviewSession.getInterviewFeedback, {
    sessionId,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl px-6 py-8 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            Interview Feedback Summary
          </DialogTitle>

          {feedbackData && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Overall Score: {feedbackData.totalPercentage}%
              </p>
              <Progress
                value={feedbackData.totalPercentage}
                className="h-2.5 bg-gray-200"
              />
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-2">
          {feedbackData === undefined ? (
            <div className="flex justify-center items-center h-40">
              <Loader className="h-8 w-8 animate-spin text-muted" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {feedbackData.feedbackList.map((fb, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-xl bg-muted/30 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-md font-semibold text-gray-800">
                      Question {index + 1}
                    </h3>
                    <Badge className={getGradeColor(fb.grade)}>
                      {fb.grade}
                    </Badge>
                  </div>

                  <Progress value={fb.score * 10} className="h-2 mb-3" />

                  <div className="text-sm space-y-1 text-gray-700">
                    <p>
                      <strong>Score:</strong> {fb.score} / 10
                    </p>
                    <p>
                      <strong>Feedback:</strong> {fb.feedback}
                    </p>
                    {fb.improvements.length > 0 && (
                      <p>
                        <strong>Suggested Improvements:</strong>{" "}
                        {fb.improvements.join(", ")}
                      </p>
                    )}
                  </div>
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
