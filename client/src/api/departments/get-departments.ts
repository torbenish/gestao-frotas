import { api } from "@/lib/axios";

export type Department = {
  id: string;
  name: string;
  code?: string | null;
  priority?: number;
};

export async function getDepartments(): Promise<Department[]> {
  const res = await api.get<{ departments: Department[] }>("/departments");
  return res.data.departments;
}
