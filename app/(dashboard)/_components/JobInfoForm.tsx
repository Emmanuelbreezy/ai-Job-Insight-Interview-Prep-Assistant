"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, Send } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { Button } from "@/components/ui/button";
import { useSignInModal } from "@/hooks/use-signin-modal";

const JobInfoForm = () => {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { open: openSignInModal } = useSignInModal();

  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createJob = useMutation(api.job.createJob);

  const handleChange = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setJobDescription(event.target.value);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    if (!isSignedIn || !user) {
      e.preventDefault();
      openSignInModal(); // Open the sign-in modal
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setIsSubmitting(true);
    try {
      const jobId = await createJob({
        userId: user.id,
        jobDescription: jobDescription.trim(),
      });
      router.push(`/job/${jobId}`);
    } catch (error) {
      toast.error("Failed to create interview. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-3 mb-3 z-10 mx-auto w-full max-w-2xl">
      <div
        className="flex flex-col border-[0.5px] 
        border-zinc-300 mx-2 md:mx-0 items-stretch transition-all
        duration-200 relative shadow-md
         hover:border-border-200
         rounded-2xl bg-white"
      >
        <div className="flex flex-col gap-3.5 m-3.5">
          <AutosizeTextarea
            rows={3}
            maxHeight={180}
            minHeight={100}
            value={jobDescription}
            onChange={handleChange}
            disabled={false}
            placeholder="Paste Job title & description"
            className="resize-none pr-12 text-base !border-0 font-normal
                  !shadow-none !ring-0 focus-visible:!ring-offset-0 
                  focus-visible:!ring-0"
          />
        </div>
        <div
          className="flex w-full items-center
         justify-end px-5 py-2"
        >
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={isSubmitting || !jobDescription.trim()}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobInfoForm;
