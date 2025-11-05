"use server";

import { AxiosError } from "axios";
import type { z } from "zod";
import { signUp } from "@/api/sign-up";
import { signUpSchema } from "./validator";

export async function signUpAction(data: z.infer<typeof signUpSchema>) {
  const validatedFields = signUpSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dados inválidos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, cpf, departmentId } = validatedFields.data;
  const cleanedCpf = cpf.replace(/[^\d]/g, "");

  try {
    await signUp({
      name,
      email,
      password,
      cpf: cleanedCpf,
      departmentId: departmentId ?? null,
    });
  } catch (err) {
    if (err instanceof AxiosError && err.response) {
      const message = err.response.data.message || "Ocorreu um erro.";
      return { success: false, message, errors: null };
    }

    console.error(err);
    return {
      success: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
      errors: null,
    };
  }

  return { success: true, message: "Conta criada com sucesso!", errors: null };
}
