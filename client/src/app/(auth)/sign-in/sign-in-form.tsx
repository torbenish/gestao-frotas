"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { signIn } from "@/api/sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema } from "./validator";

type SignInFormType = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormType>({
    defaultValues: {
      email: searchParams?.get("email") ?? "",
    },
    resolver: zodResolver(signInSchema),
  });

  const { mutateAsync: authenticate, isPending } = useMutation({
    mutationFn: signIn,
    onSuccess: (token) => {
      try {
        if (token) localStorage.setItem("accessToken", token);
        toast.success("Login realizado com sucesso!");
      } catch {
        toast.success("Login realizado com sucesso!");
      }
      router.push("/");
    },
    onError: () => {
      toast.error("Credenciais inválidas.");
    },
  });

  async function handleSignIn(data: SignInFormType) {
    try {
      await authenticate(data);
    } catch (error) {
      console.error("Erro ao tentar fazer login:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Seu e-mail</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Sua senha</Label>
        <div className="relative flex items-center">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            className="pr-10"
            {...register("password")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <Button disabled={isPending} className="w-full" type="submit">
        {isPending ? "Acessando..." : "Acessar sistema"}
      </Button>

      <p className="px-6 text-center text-sm leading-relaxed text-muted-foreground">
        <Link
          href="/auth/request-password"
          className="underline underline-offset-4"
        >
          Esqueceu a senha?
        </Link>
      </p>
    </form>
  );
}
