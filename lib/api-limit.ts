export const PLANS = {
  FREE: "FREE",
  PRO: "PRO",
} as const;

export const PLAN_LIMITS = {
  [PLANS.FREE]: { maxFiles: 2, maxMessages: 5 },
  [PLANS.PRO]: { maxFiles: 10, maxMessages: 100 },
};
