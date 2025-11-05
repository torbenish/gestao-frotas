import { api } from "@/lib/axios";

export type Profile = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: "EMPLOYEE" | "COORDINATOR" | "MANAGER" | "ADMIN";
  departmentId?: string | null;
  departmentCode?: string | null;
  departmentName?: string | null;
};

export async function getProfile(): Promise<Profile> {
  const res = await api.get<Profile>("/auth/me");
  return res.data;
}
