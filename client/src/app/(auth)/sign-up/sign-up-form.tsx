// auth/sign-up/sign-up-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import {
  type Department,
  getDepartments,
} from "@/api/departments/get-departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUpAction } from "./actions";
import { signUpSchema } from "./validator";

const maskCPF = (value: string) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .substring(0, 14);
};

type SignUpFormValues = z.infer<typeof signUpSchema>;

export type SignUpFormProps = {
  onSuccess?: () => void;
  onClose?: () => void;
  /** se false, oculta o header (título/descrição) — útil quando o modal já exibe um header */
  showHeader?: boolean;
};

export function SignUpForm({ onSuccess, onClose }: SignUpFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      cpf: "",
      password: "",
      passwordConfirmation: "",
      departmentId: "",
    },
  });

  const {
    data: departments = [],
    isLoading: loadingDepartments,
    isError: errorDepartments,
  } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: getDepartments,
    staleTime: Number.POSITIVE_INFINITY,
  });

  async function handleSignUp(data: SignUpFormValues) {
    startTransition(async () => {
      const cleanedCpf = data.cpf.replace(/\D/g, "");

      const departmentId =
        !data.departmentId || data.departmentId === "__none"
          ? null
          : data.departmentId;

      try {
        const result = await signUpAction({
          name: data.name,
          email: data.email,
          cpf: cleanedCpf,
          password: data.password,
          passwordConfirmation: data.passwordConfirmation,
          departmentId,
        } as unknown as z.infer<typeof signUpSchema>);

        if (result?.success) {
          toast.success("Usuário cadastrado com sucesso!", {
            description: "Redirecionando para login...",
          });

          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/sign-in?email=${encodeURIComponent(data.email)}`);
          }

          onClose?.();
        } else {
          if (result?.errors) {
            const fieldErrors = result.errors as Record<string, string[]>;
            for (const key in fieldErrors) {
              const messages = fieldErrors[key];
              if (messages && messages.length > 0) {
                setError(key as keyof SignUpFormValues, {
                  message: messages[0],
                });
              }
            }
          }

          toast.error(result?.message ?? "Erro ao cadastrar usuário.");
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        toast.error("Erro ao conectar com o servidor. Tente novamente.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" type="text" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Seu e-mail</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-500">{String(errors.email.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf">Seu CPF</Label>
        <Controller
          name="cpf"
          control={control}
          render={({ field: { value, onChange, ref } }) => (
            <Input
              id="cpf"
              type="text"
              ref={ref}
              value={maskCPF(value ?? "")}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                onChange(raw);
              }}
            />
          )}
        />
        {errors.cpf && (
          <p className="text-sm text-red-500">{String(errors.cpf.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="departmentId">Departamento</Label>

        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <SelectTrigger aria-label="Selecionar departamento">
                <SelectValue
                  placeholder={
                    loadingDepartments
                      ? "Carregando..."
                      : errorDepartments
                        ? "Erro ao carregar"
                        : "Selecione um departamento"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {loadingDepartments && (
                  <SelectItem value="__loading" disabled>
                    Carregando...
                  </SelectItem>
                )}
                {errorDepartments && (
                  <SelectItem value="__error" disabled>
                    Erro ao carregar
                  </SelectItem>
                )}

                {!loadingDepartments && !errorDepartments && (
                  <>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__none">Nenhum</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          )}
        />

        {errors.departmentId && (
          <p className="text-sm text-red-500">
            {String(errors.departmentId.message)}
          </p>
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
          <p className="text-sm text-red-500">
            {String(errors.password.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passwordConfirmation">Confirme a senha</Label>
        <Input
          id="passwordConfirmation"
          type="password"
          {...register("passwordConfirmation")}
        />
        {errors.passwordConfirmation && (
          <p className="text-sm text-red-500">
            {String(errors.passwordConfirmation.message)}
          </p>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Aguarde..." : "Finalizar cadastro"}
      </Button>

      <p className="px-6 text-center text-sm leading-relaxed text-muted-foreground">
        Ao continuar, você concorda com nossos{" "}
        <Link href="/termos" className="underline underline-offset-4">
          termos de serviço
        </Link>{" "}
        e{" "}
        <Link href="/politicas" className="underline underline-offset-4">
          políticas de privacidade
        </Link>
      </p>

      <div className="text-center">
        <Link href="/sign-in" className="text-sm underline underline-offset-4">
          Já possui conta? Faça login
        </Link>
      </div>
    </form>
  );
}
