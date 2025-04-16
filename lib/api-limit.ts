export const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
} as const;

export const CREDIT_MIN_LIMIT = 10;
export const CREDIT_MAX_LIMIT = 200;

export const CREDIT_COST = {
  JOB_CREATION: 1, // Processing job description
  JOB_CHAT_MESSAGE: 0.5, // Each AI response in job explorer
  INTERVIEW_SESSION_CREATION: 2,
  INTERVIEW_CHAT_QUESTION: 0,
  INTERVIEW_FEEDBACK: 3, // Final comprehensive feedback
} as const;

export const FREE_TIER_CREDITS = 5;

// Recommendation
// Option 1 (Lower Cost Per Question): Best if users frequently stop sessions early.
// export const CREDIT_COST = {
//   JOB_CREATION: 2, // Higher cost for processing job descriptions
//   JOB_CHAT_MESSAGE: 0.5, // Lower cost for lightweight chat responses
//   INTERVIEW_SESSION_CREATION: 0, // No cost for session creation (database operation)
//   INTERVIEW_QUESTION: 0.2, // Lower cost per question (10 questions = 2 credits total)
//   INTERVIEW_FEEDBACK: 3, // Higher cost for comprehensive feedback
// } as const;

// Option 2 (Bundle Cost): Best if users typically complete all 10 questions.
// export const CREDIT_COST = {
//   JOB_CREATION: 2, // Higher cost for processing job descriptions
//   JOB_CHAT_MESSAGE: 0.5, // Lower cost for lightweight chat responses
//   INTERVIEW_SESSION_CREATION: 2, // Flat fee for the entire session (10 questions included)
//   INTERVIEW_QUESTION: 0, // No additional cost per question
//   INTERVIEW_FEEDBACK: 3, // Higher cost for comprehensive feedback
// } as const;

// Option 3 (Hybrid Model): Best for a balanced approach.
// export const CREDIT_COST = {
//   JOB_CREATION: 2, // Higher cost for processing job descriptions
//   JOB_CHAT_MESSAGE: 0.5, // Lower cost for lightweight chat responses
//   INTERVIEW_SESSION_CREATION: 1, // Lower upfront cost for session creation
//   INTERVIEW_QUESTION: 0.1, // Small fee per question (10 questions = 1 credit total)
//   INTERVIEW_FEEDBACK: 3, // Higher cost for comprehensive feedback
// } as const;
