export const Role = {
  USER: "USER",
  AI: "AI",
} as const;

export type RoleType = keyof typeof Role;

export const AppMode = {
  JOB_INSIGHT: "JOB_INSIGHT",
  INTERVIEW_SESSION: "INTERVIEW_SESSION",
} as const;

export type AppModeType = keyof typeof AppMode;

export const InterviewStatus = {
  NOT_STARTED: "NOT_STARTED",
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
} as const;

export type InterviewStatusType = keyof typeof InterviewStatus;

export const QuestionType = {
  TEXT: "TEXT",
  CODE: "CODE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  ORAL: "ORAL",
  SCENARIO: "SCENARIO",
} as const;

export const MessageType = {
  SYSTEM: "SYSTEM",
  CHAT: "CHAT",
  QUESTION: "QUESTION",
  ANSWER: "ANSWER",
} as const;

export const JobStatus = {
  PROCESSING: "PROCESSING",
  READY: "READY",
  FAILED: "FAILED",
} as const;

export type JobStatus = keyof typeof JobStatus;

export const JobInsightsType = {
  JOB_INFO: "JOB_INFO",
  RESUME_TIP: "RESUME_TIP",
  INTERVIEW_TIP: "INTERVIEW_TIP",
  SKILL_ADVICE: "SKILL_ADVICE",
} as const;

export type JobInsightsType = keyof typeof JobInsightsType;

export const JobInsightStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type JobInsightStatusType = keyof typeof JobInsightStatus;
