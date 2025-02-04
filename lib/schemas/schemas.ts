import * as z from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(6, "La contraseña es requerida")
    .regex(/[a-z]/, "La contraseña debe incluir al menos una letra minúscula")
    .regex(/[A-Z]/, "La contraseña debe incluir al menos una letra mayúscula"),
  rememberMe: z.boolean().default(false),
});

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Correo electrónico inválido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[a-z]/, "La contraseña debe incluir al menos una letra minúscula")
      .regex(/[A-Z]/, "La contraseña debe incluir al menos una letra mayúscula")
      .regex(
        /[!@#$%^&*()\-_=+{};:,<.>]/,
        "La contraseña debe incluir al menos un carácter especial"
      ),
    confirmPassword: z.string().min(1, "Por favor confirma tu contraseña"),
    nickName: z
      .string()
      .min(3, "El nombre y el apellido debe tener al menos 8 caracteres")
      .max(20, "El y el apellido no puede tener más de 35 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido"),
});

export const verificationSchema = z.object({
  code: z
    .string()
    .min(6, "El código debe tener al menos 6 caracteres")
    .max(6, "El código no puede tener más de 6 caracteres"),
});

export const confirmResetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(6, "El código debe tener al menos 6 caracteres")
      .max(6, "El código no puede tener más de 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .regex(/[a-z]/, "La contraseña debe incluir al menos una letra minúscula")
      .regex(
        /[A-Z]/,
        "La contraseña debe incluir al menos una letra mayúscula"
      ),
    confirmPassword: z.string().min(1, "Por favor confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
export type ConfirmResetPasswordFormData = z.infer<
  typeof confirmResetPasswordSchema
>;
