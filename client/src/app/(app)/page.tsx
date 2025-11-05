// app/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. TORNE A FUNÇÃO DO COMPONENTE "async"
export default async function HomePage() {
  // 2. ADICIONE "await" ao chamar cookies()
  //
  // O TypeScript acha que 'cookies()' retorna uma Promise,
  // então 'await' vai satisfazê-lo.
  //
  // Em tempo de execução, 'cookies()' é síncrono,
  // mas 'await' em um valor síncrono funciona
  // perfeitamente (ele "desembrulha" o valor na hora).
  const cookieStore = await cookies();

  // 3. O resto do seu código funciona exatamente igual
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    // O redirect() funciona perfeitamente dentro
    // de um Server Component async.
    redirect("/sign-in");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard Principal</h1>
      <p>Bem-vindo ao sistema de Gestão de Frotas!</p>
      {/* ... Todo o conteúdo da sua dashboard vem aqui ...
       */}
    </div>
  );
}
