"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        // Chama o backend para buscar o usuário autenticado
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err: any) {
        console.error("Erro ao buscar /auth/me:", err);
        setError("Token inválido ou expirado. Redirecionando para login...");
        setTimeout(() => router.push("/auth/sign-in"), 1500);
      }
    }

    fetchUser();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-2xl font-semibold">Usuário autenticado ✅</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm">
        {JSON.stringify(user, null, 2)}
      </pre>
      <Button
        onClick={() => {
          localStorage.removeItem("accessToken");
          router.push("/auth/sign-in");
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sair
      </Button>
    </div>
  );
}
