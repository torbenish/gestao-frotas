"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { History, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { getProfile, type Profile } from "@/api/user/get-profile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "@/api/sign-out";
import { queryClient } from "@/lib/react-query";

function mapRoleLabel(role?: Profile["role"]) {
  switch (role) {
    case "COORDINATOR":
      return "Coordenador";
    case "MANAGER":
      return "Gestor de Frota";
    case "ADMIN":
      return "Administrador";
    default:
      return "Colaborador";
  }
}

type Props = {
  profile?: Profile | null;
};

export function AccountMenu({ profile }: Props) {
  const router = useRouter();

  const { data: profileFromQuery, isLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: !profile,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const currentProfile = profile ?? profileFromQuery;

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onMutate: () => {
      // se você quiser usar queryClient, mantenha essa chamada
      // queryClient.cancelQueries({ queryKey: ['profile'] })
    },
    onSuccess: () => {
      if (typeof window !== "undefined") localStorage.removeItem("accessToken");
      // exemplo de uso do queryClient para limpar cache:
      queryClient.clear();
      router.push("/sign-in");
    },
    onError: () => {
      if (typeof window !== "undefined") localStorage.removeItem("accessToken");
      router.push("/sign-in");
    },
  });

  const isSigningOut = (() => {
    // se o objeto tiver isLoading (algumas versões), use
    if ("isLoading" in signOutMutation) {
      // cast seguro para any apenas aqui para acessar a prop runtime
      return (signOutMutation as any).isLoading === true;
    }

    // caso contrário verifique status que pode ser 'pending' (v5) ou 'loading' (outras)
    const status = signOutMutation.status as unknown as string;
    return status === "pending" || status === "loading";
  })();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
          {isLoading && !currentProfile ? (
            <Skeleton className="h-4 w-4 rounded-full" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col">
          {isLoading && !currentProfile ? (
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : (
            <>
              <span className="font-medium">{currentProfile?.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {currentProfile?.email}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {mapRoleLabel(currentProfile?.role)}
              </span>
            </>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil do usuário</span>
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogContent>
            <div className="p-4">
              {isLoading && !currentProfile ? (
                <>
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium">
                    {currentProfile?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentProfile?.email}
                  </p>
                  <p className="text-sm">
                    {mapRoleLabel(currentProfile?.role)}
                  </p>
                  <p className="text-sm">
                    {currentProfile?.departmentCode ?? ""}
                  </p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <History className="mr-2 h-4 w-4" />
          <span>Histórico</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* SAIR */}
        <DropdownMenuItem
          asChild
          className="text-rose-500 dark:text-rose-400"
          disabled={isSigningOut}
        >
          <button
            className="w-full text-left"
            onClick={() => signOutMutation.mutate()}
            type="button"
          >
            <LogOut className="mr-2 h-4 w-4 inline" />
            <span>Sair</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
