import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Cadastro",
  description: "Crie sua conta no sistema de gestão de frotas.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Button variant="ghost" asChild className="absolute right-8 top-8">
        <Link href="/sign-in">Fazer login</Link>
      </Button>
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">
            Comece seu cadastro de frotas!
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
