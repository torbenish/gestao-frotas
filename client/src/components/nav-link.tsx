"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export type NavLinkProps = ComponentProps<typeof Link> & {
  className?: string;
};

export function NavLink({ className, ...props }: NavLinkProps) {
  const pathname = usePathname();

  const href = props.href.toString();
  const isCurrent = pathname === href;

  return (
    <Link
      data-current={isCurrent}
      className={twMerge(
        "flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground data-[current=true]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}
