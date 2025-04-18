import { Button } from "@/components/ui/button";
import { useRef } from "react";

const prompts = [
  "Summarize this job description",
  "Draft a cover letter",
  "Draft a resume",
  "What skills should I show?",
];

export const JobInsightPrompts = ({
  onSubmit,
  isDisabled,
}: {
  onSubmit: (value: string) => void;
  isDisabled: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handlePromptClick = (prompt: string) => {
    onSubmit(prompt); // Trigger the submit action
  };

  return (
    <div className="relative w-full mb-1.5">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-8 pl-0"
      >
        {prompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            disabled={isDisabled}
            className="whitespace-nowrap rounded-full font-light 
            !text-[12.5px] hover:bg-gray-50"
            onClick={() => handlePromptClick(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};
