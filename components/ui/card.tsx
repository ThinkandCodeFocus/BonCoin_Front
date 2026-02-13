import * as React from 'react'

import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border py-6 shadow-sm card-lift',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

/* ============================================
   CARD PREMIUM VARIANTS
   ============================================ */

/* Glass Card */
function CardGlass({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl',
        className,
      )}
      {...props}
    />
  )
}

/* Card with glow effect */
function CardGlow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl border border-border/60 card-glow',
        className,
      )}
      {...props}
    />
  )
}

/* Feature Card */
function CardFeature({ className, icon: Icon, title, description, ...props }: React.ComponentProps<'div'> & {
  icon?: React.ComponentType<{ className?: string }>
  title?: string
  description?: string
}) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 flex flex-col items-center text-center card-animate',
        className,
      )}
      {...props}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-accent" />
        </div>
      )}
      {title && (
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  )
}

/* Listing Card */
function CardListing({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'overflow-hidden group cursor-pointer border-border/60 bg-card rounded-xl card-lift card-glow',
        className,
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardGlass,
  CardGlow,
  CardFeature,
  CardListing,
}

