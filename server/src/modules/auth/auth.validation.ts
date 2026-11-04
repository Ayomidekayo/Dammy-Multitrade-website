import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password is too long."),
});

export type LoginInput = z.infer<typeof loginSchema>;



export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required.")
      .max(128),

    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password must contain at least one letter and one number.",
      ),

    confirmPassword: z.string().min(1),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "Choose a different password.",
      path: ["newPassword"],
    },
  );

export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>;