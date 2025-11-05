import Link from "next/link";
import { Button } from "@/components/ui/button";
import SignInForm from "./sign-in-form";

export const metadata = {
  title: "Login",
  description: "Acesse sua conta no sistema de Gestão de Frotas",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Button variant="ghost" asChild className="absolute right-8 top-8">
        <Link href="/sign-up">Novo usuário</Link>
      </Button>

      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Acessar sistema
          </h1>
          <p className="text-sm text-muted-foreground">
            Solicite a sua viagem pelo gestao de frotas!
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
