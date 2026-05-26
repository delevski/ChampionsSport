import he from "./he.json";

export type Messages = typeof he;
export const defaultLocale = "he" as const;
export const messages = { he } as const;

export function getMessages(locale: keyof typeof messages = "he"): Messages {
  return messages[locale];
}
