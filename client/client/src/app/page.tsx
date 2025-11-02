"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <h2>Hello World</h2>
      <Button onClick={() => toast.success("Toaster funcionando!")}>
        Testar Toaster
      </Button>
    </div>
  );
}
