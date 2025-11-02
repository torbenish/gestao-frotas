import Image from "next/image";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <Image
          src="/placeholder.svg"
          alt="Imagem de fundo da autenticação"
          width={1920}
          height={1080}
          className="h-full w-full object-cover dark:brightness-[0.3]"
        />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tighter">
              Acesse sua conta
            </h1>
            <p className="text-sm text-muted-foreground">
              Bem-vindo de volta! Insira suas credenciais.
            </p>
          </div>

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
