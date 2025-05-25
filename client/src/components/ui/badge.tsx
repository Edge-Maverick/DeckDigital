import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        normal: "border-transparent bg-[hsl(var(--type-normal)/20)] text-[hsl(var(--type-normal))]",
        fire: "border-transparent bg-[hsl(var(--type-fire)/20)] text-[hsl(var(--type-fire))]",
        water: "border-transparent bg-[hsl(var(--type-water)/20)] text-[hsl(var(--type-water))]",
        electric: "border-transparent bg-[hsl(var(--type-electric)/20)] text-[hsl(var(--type-electric))]",
        grass: "border-transparent bg-[hsl(var(--type-grass)/20)] text-[hsl(var(--type-grass))]",
        ice: "border-transparent bg-[hsl(var(--type-ice)/20)] text-[hsl(var(--type-ice))]",
        fighting: "border-transparent bg-[hsl(var(--type-fighting)/20)] text-[hsl(var(--type-fighting))]",
        poison: "border-transparent bg-[hsl(var(--type-poison)/20)] text-[hsl(var(--type-poison))]",
        ground: "border-transparent bg-[hsl(var(--type-ground)/20)] text-[hsl(var(--type-ground))]",
        flying: "border-transparent bg-[hsl(var(--type-flying)/20)] text-[hsl(var(--type-flying))]",
        psychic: "border-transparent bg-[hsl(var(--type-psychic)/20)] text-[hsl(var(--type-psychic))]",
        bug: "border-transparent bg-[hsl(var(--type-bug)/20)] text-[hsl(var(--type-bug))]",
        rock: "border-transparent bg-[hsl(var(--type-rock)/20)] text-[hsl(var(--type-rock))]",
        ghost: "border-transparent bg-[hsl(var(--type-ghost)/20)] text-[hsl(var(--type-ghost))]",
        dragon: "border-transparent bg-[hsl(var(--type-dragon)/20)] text-[hsl(var(--type-dragon))]",
        dark: "border-transparent bg-[hsl(var(--type-dark)/20)] text-[hsl(var(--type-dark))]",
        steel: "border-transparent bg-[hsl(var(--type-steel)/20)] text-[hsl(var(--type-steel))]",
        fairy: "border-transparent bg-[hsl(var(--type-fairy)/20)] text-[hsl(var(--type-fairy))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
