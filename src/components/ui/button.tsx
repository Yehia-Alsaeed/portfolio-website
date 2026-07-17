import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border-2 border-accent bg-accent text-accent-ink hover:brightness-110",
        outline: "border-2 border-line bg-transparent text-ink hover:bg-ink hover:text-paper",
        quiet: "border-2 border-transparent bg-transparent text-dim hover:text-ink",
      },
      size: {
        default: "min-h-11 px-6 py-3",
        icon: "size-11",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "primary",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ asChild = false, className, size, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ className, size, variant }))} {...props} />;
}

export { buttonVariants };
