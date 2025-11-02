// src/components/sign-up-modal.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SignUpForm } from "@/app/auth/sign-up/sign-up-form";

type SignUpModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
};

export function SignUpModal({
  open,
  onOpenChange,
  triggerLabel = "Criar conta",
}: SignUpModalProps) {
  const [localOpen, setLocalOpen] = React.useState(false);

  const isControlled =
    typeof open === "boolean" && typeof onOpenChange === "function";

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setLocalOpen(next);
      }
    },
    [isControlled, onOpenChange],
  );

  return (
    <Dialog
      open={isControlled ? open : localOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crie sua conta</DialogTitle>
          <DialogDescription>
            Comece sua jornada conosco hoje mesmo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {/* Aqui o TypeScript já entende as props porque SignUpFormProps foi exportado */}
          <SignUpForm
            onSuccess={() => handleOpenChange(false)}
            onClose={() => handleOpenChange(false)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
