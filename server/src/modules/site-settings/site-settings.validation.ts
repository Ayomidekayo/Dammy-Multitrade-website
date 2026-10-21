import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).nullable().optional();

const optionalUrl = z
  .union([z.string().trim().url(), z.literal(""), z.null()])
  .optional()
  .transform((value) => value === "" ? null : value);

export const updateSiteSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  slogan: optionalText(200),
  description: optionalText(2000),
  phone: optionalText(40),
  secondaryPhone: optionalText(40),
  whatsapp: optionalText(40),
  email: z.union([z.string().trim().email(), z.literal(""), z.null()]).optional()
    .transform((value) => value === "" ? null : value),
  address: optionalText(300),
  city: optionalText(100),
  state: optionalText(100),
  country: optionalText(100),
  openingHours: optionalText(500),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  youtubeUrl: optionalUrl,
}).strict();

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
