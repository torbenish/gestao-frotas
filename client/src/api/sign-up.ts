import { api } from "@/lib/axios";

interface SignUpBody {
  name: string;
  email: string;
  cpf: string;
  password: string;
  departmentId?: string | null;
}

export async function signUp({
  name,
  email,
  cpf,
  password,
  departmentId,
}: SignUpBody) {
  await api.post("/accounts", { name, email, cpf, password, departmentId });
}
