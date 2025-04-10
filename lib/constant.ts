export const Role = {
  USER: "USER",
  AI: "AI",
} as const;

export type RoleType = keyof typeof Role;
