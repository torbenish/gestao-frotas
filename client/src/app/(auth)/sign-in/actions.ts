"use client";

import { AxiosError } from "axios";
import type z from "zod";
import { signIn } from "@/api/sign-in";
import { signInSchema } from "./validator";

export async function signInAction(data: z.infer<typeof signInSchema>) {
  const validatedFields = signInSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dados inválidos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const token = await signIn({ email, password });

    if (!token) {
      return { success: false, message: "Token não recebido do servidor." };
    }

    if (typeof window !== "undefined")
      localStorage.setItem("accessToken", token);

    return {
      success: true,
      message: "Login realizado com sucesso!",
      errors: null,
    };
  } catch (err: unknown) {
    if (err instanceof AxiosError && err.response) {
      const message = err.response.data.message || "Credenciais inválidas.";
      return { success: false, message, errors: null };
    }

    console.error(err);
    return {
      success: false,
      message: "Não foi possível conectar ao servidor. Tente novamente.",
      errors: null,
    };
  }
}
