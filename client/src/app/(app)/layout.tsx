import type { ReactNode } from "react";
import { Header } from "@/components/common/header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-8 pt-6">{children}</main>
    </div>
  );
}
