import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "שם משתמש לפחות 3 תווים")
  .max(20, "שם משתמש עד 20 תווים")
  .regex(/^[a-zA-Z0-9_\u0590-\u05FF]+$/, "תווים לא חוקיים");

export const scoreSchema = z.number().int().min(0).max(20);

export const matchPredictionSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: scoreSchema,
  awayScore: scoreSchema,
});

export const groupNameSchema = z
  .string()
  .min(2, "שם קבוצה לפחות 2 תווים")
  .max(50);

export const inviteCodeSchema = z
  .string()
  .min(6)
  .max(8)
  .transform((s) => s.toUpperCase());
