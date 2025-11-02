import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Por favor, forneça um e-mail válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }), 
});
