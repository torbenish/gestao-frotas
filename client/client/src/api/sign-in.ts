import { api } from "@/lib/axios";

interface SignInBody {
  email: string;
  password: string;
}

export async function signIn({ email, password }: SignInBody) {
  const response = await api.post<{ access_token: string }>("/auth/login", {
    email,
    password,
  });
  return response.data.access_token;
}
