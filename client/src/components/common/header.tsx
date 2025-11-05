"use client";

import {
  AlertOctagon,
  Car,
  ClipboardCheck,
  DollarSign,
  FileText,
  History,
  Home,
  LayoutDashboard,
  ListChecks,
  Menu,
  Network,
  PlusCircle,
  Receipt,
  Send,
  Settings,
  Truck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getDepartments } from "@/api/departments/get-departments";
import brasaoImage from "@/assets/badge-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { AccountMenu } from "@/components/user/account-menu";
import { api } from "@/lib/axios";
import { NavLink } from "../nav-link";
import { ThemeToggle } from "../theme/theme-toggle";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

type Profile = {
  id: string;
  name?: string | null;
  role?: "EMPLOYEE" | "COORDINATOR" | "MANAGER" | "ADMIN";
  departmentId?: string | null;
  departmentCode?: string | null;
};

// ... (as funções mapRole e formatName permanecem iguais) ...
function mapRole(role?: Profile["role"]) {
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

function formatName(full?: string | null) {
  if (!full) return "";
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  if (parts[1].toLowerCase() === "de" && parts.length >= 3) {
    return `${parts[0]} ${parts[1]} ${parts[2]}`;
  }
  return `${parts[0]} ${parts[1]}`;
}

export function Header() {
  const [me, setMe] = useState<Profile | null>(null);
  const [deptCode, setDeptCode] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { data } = await api.get<Profile>("/auth/me");
        if (!mounted) return;
        setMe(data);

        if (data.departmentCode) {
          setDeptCode(data.departmentCode);
          return;
        }

        if (data.departmentId) {
          try {
            const departments = await getDepartments();
            if (!mounted) return;
            const found = departments.find((d) => d.id === data.departmentId);
            setDeptCode(found?.code ?? null);
          } catch {
            setDeptCode(null);
          }
        }
      } catch {
        setMe(null);
        setDeptCode(null);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const displayName = formatName(me?.name);
  const roleLabel = mapRole(me?.role);
  const rightText = [displayName, roleLabel, deptCode]
    .filter(Boolean)
    .join(" - ");

  return (
    <header className="border-b">
      <div className="flex h-16 items-center gap-6 px-6">
        <div className="flex items-center gap-4">
          <Image src={brasaoImage} alt="Brasão" className="h-10 w-auto" />
          <Separator orientation="vertical" className="h-6" />
        </div>

        {/* =================================== */}
        {/* ========= Navegação Desktop ========= */}
        {/* =================================== */}
        <nav className="hidden md:flex items-center gap-2">
          {/* O NavLink aqui provavelmente já tem 'gap' em sua definição, por isso o 'mr-2' não é necessário */}
          <NavLink href="/app/dashboard">
            <Home className="h-4 w-4" /> Início
          </NavLink>

          {/* === MENU VIAGENS (Todos os perfis) === */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5">
                <Send className="h-4 w-4" />
                Viagens
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* --- Apenas Coordenador --- */}
              {me?.role === "COORDINATOR" && (
                <DropdownMenuItem asChild>
                  <NavLink href="/app/trips/department-approvals">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Aprovações do Setor
                  </NavLink>
                </DropdownMenuItem>
              )}

              {/* --- Apenas Gestor ou Admin --- */}
              {(me?.role === "MANAGER" || me?.role === "ADMIN") && (
                <>
                  <DropdownMenuItem asChild>
                    <NavLink href="/app/trips/manage/approvals">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Aprovações
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink href="/app/trips/manage/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Painel de Viagens
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <NavLink href="/app/trips/manage/history">
                      <History className="mr-2 h-4 w-4" />
                      Histórico de Viagens
                    </NavLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* --- Para Todos --- */}
              <DropdownMenuItem asChild>
                <NavLink href="/app/trips/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Solicitar Viagem
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink href="/app/trips/my-requests">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Minhas Solicitações
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* === MENU FROTA (Apenas Gestor ou Admin) === */}
          {(me?.role === "MANAGER" || me?.role === "ADMIN") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5">
                  <Truck className="h-4 w-4" />
                  Frota
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/fleet/vehicles">
                    <Car className="mr-2 h-4 w-4" />
                    Veículos
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/fleet/drivers">
                    <Users className="mr-2 h-4 w-4" />
                    Motoristas
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/fleet/maintenance">
                    <Wrench className="mr-2 h-4 w-4" />
                    Manutenções
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* === MENU FINANCEIRO (Apenas Gestor ou Admin) === */}
          {(me?.role === "MANAGER" || me?.role === "ADMIN") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Financeiro
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/financials/charges">
                    <Receipt className="mr-2 h-4 w-4" />
                    Despesas
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/financials/infractions">
                    <AlertOctagon className="mr-2 h-4 w-4" />
                    Infrações
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* === MENU ADMINISTRAÇÃO (Apenas Admin) === */}
          {me?.role === "ADMIN" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1.5">
                  <Settings className="h-4 w-4" />
                  Administração
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/admin/users">
                    <UserCog className="mr-2 h-4 w-4" />
                    Usuários
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/admin/departments">
                    <Network className="mr-2 h-4 w-4" />
                    Departamentos
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <NavLink href="/app/admin/audit-logs">
                    <FileText className="mr-2 h-4 w-4" />
                    Logs de Auditoria
                  </NavLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          {/* ... (rightText, ThemeToggle, AccountMenu) ... */}
          {rightText ? (
            <span className="text-sm text-muted-foreground">{rightText}</span>
          ) : null}

          <ThemeToggle />

          <AccountMenu profile={me} />

          {/* =================================== */}
          {/* ========= Navegação Mobile ========== */}
          {/* =================================== */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="mt-10 flex flex-col gap-6">
                {/* O NavLink aqui é o container flex. 
                  Adicionamos 'mr-2' ao ícone para consistência.
                */}
                <NavLink href="/app/dashboard">
                  <Home className="mr-2 h-4 w-4" /> Início
                </NavLink>

                {/* --- Links de Viagens --- */}
                <span className="text-sm font-medium text-muted-foreground">
                  Viagens
                </span>
                {me?.role === "COORDINATOR" && (
                  <NavLink href="/app/trips/department-approvals">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Aprovações do Setor
                  </NavLink>
                )}
                {(me?.role === "MANAGER" || me?.role === "ADMIN") && (
                  <>
                    <NavLink href="/app/trips/manage/approvals">
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Aprovações
                    </NavLink>
                    <NavLink href="/app/trips/manage/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Painel de Viagens
                    </NavLink>
                    <NavLink href="/app/trips/manage/history">
                      <History className="mr-2 h-4 w-4" />
                      Histórico de Viagens
                    </NavLink>
                  </>
                )}
                <NavLink href="/app/trips/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Solicitar Viagem
                </NavLink>
                <NavLink href="/app/trips/my-requests">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Minhas Solicitações
                </NavLink>

                {/* --- Links de Frota --- */}
                {(me?.role === "MANAGER" || me?.role === "ADMIN") && (
                  <>
                    <span className="text-sm font-medium text-muted-foreground">
                      Frota
                    </span>
                    <NavLink href="/app/fleet/vehicles">
                      <Car className="mr-2 h-4 w-4" />
                      Veículos
                    </NavLink>
                    <NavLink href="/app/fleet/drivers">
                      <Users className="mr-2 h-4 w-4" />
                      Motoristas
                    </NavLink>
                    <NavLink href="/app/fleet/maintenance">
                      <Wrench className="mr-2 h-4 w-4" />
                      Manutenções
                    </NavLink>
                  </>
                )}

                {/* --- Links Financeiros --- */}
                {(me?.role === "MANAGER" || me?.role === "ADMIN") && (
                  <>
                    <span className="text-sm font-medium text-muted-foreground">
                      Financeiro
                    </span>
                    <NavLink href="/app/financials/charges">
                      <Receipt className="mr-2 h-4 w-4" />
                      Despesas
                    </NavLink>
                    <NavLink href="/app/financials/infractions">
                      <AlertOctagon className="mr-2 h-4 w-4" />
                      Infrações
                    </NavLink>
                  </>
                )}

                {/* --- Links de Administração --- */}
                {me?.role === "ADMIN" && (
                  <>
                    <span className="text-sm font-medium text-muted-foreground">
                      Administração
                    </span>
                    <NavLink href="/app/admin/users">
                      <UserCog className="mr-2 h-4 w-4" />
                      Usuários
                    </NavLink>
                    <NavLink href="/app/admin/departments">
                      <Network className="mr-2 h-4 w-4" />
                      Departamentos
                    </NavLink>
                    <NavLink href="/app/admin/audit-logs">
                      <FileText className="mr-2 h-4 w-4" />
                      Logs de Auditoria
                    </NavLink>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
