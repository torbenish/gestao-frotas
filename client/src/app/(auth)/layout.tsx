import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import brasaoImage from "@/assets/badge-icon.png";
import Logo from "@/components/common/logo";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (token) {
    redirect("/");
  }
  return (
    <div className="min-h-screen grid md:grid-cols-2 antialiased">
      <div className="hidden h-full border-r border-foreground/5 bg-muted p-10 text-muted-foreground md:flex flex-col justify-between">
        <div className="flex items-center gap-3 text-lg font-medium text-foreground">
          <Image
            src={brasaoImage}
            alt="Brasão do Sistema"
            className="h-10 w-auto object-contain"
          />
          <span className="font-semibold">gestão.frotas</span>
        </div>
        <Logo />
        <footer className="text-sm">
          Painel do parceiro &copy; gestão.frotas - {new Date().getFullYear()}
        </footer>
      </div>

      <div className="flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
