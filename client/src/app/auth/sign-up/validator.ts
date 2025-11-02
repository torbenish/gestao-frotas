import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "O nome precisa ter pelo menos 3 caracteres." }),
    email: z
      .string()
      .email({ message: "Por favor, forneça um e-mail válido." }),
    cpf: z
      .string()
      .refine((cpf) => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(cpf), {
        message: "CPF inválido. Use o formato 000.000.000-00.",
      }),
    password: z
      .string()
      .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
    passwordConfirmation: z.string(),
    departmentId: z.string().nullable().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  });
