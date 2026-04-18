# Conversão de Design para Componentes React

Analise o design anexado (screenshot ou frame do Figma) e converta para componentes React seguindo os padrões abaixo.

---

## Stack

- **React 19** (sem `forwardRef`)
- **TypeScript** strict
- **Tailwind CSS v4** com `@theme` e CSS variables
- **Tailwind Variants** (`tailwind-variants`) para variantes
- **Tailwind Merge** (`tailwind-merge`) para merge de classes
- **Lucide React** ou **Phosphor Icons** para ícones

---

## Nomenclatura

- Arquivos: **PascalCase** → `UserCard.tsx`, `UseModal.ts`
- **Sempre named exports**, nunca default export
- Não criar barrel files (`index.ts`) para pastas internas

---

## Estrutura de Componente

```tsx
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export const buttonVariants = tv({
    base: [
        'inline-flex cursor-pointer items-center justify-center font-medium rounded-lg border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    ],
    variants: {
        variant: {
            primary: 'border-primary bg-primary text-primary-foreground hover:bg-primary-hover',
            secondary: 'border-border bg-secondary text-secondary-foreground hover:bg-muted',
            ghost: 'border-transparent bg-transparent text-muted-foreground hover:text-foreground',
            destructive: 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90',
        },
        size: {
            sm: 'h-6 px-2 gap-1.5 text-xs [&_svg]:size-3',
            md: 'h-7 px-3 gap-2 text-sm [&_svg]:size-3.5',
            lg: 'h-9 px-4 gap-2.5 text-base [&_svg]:size-4',
        },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
})

export interface ButtonProps
    extends ComponentProps<'button'>,
        VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, disabled, children, ...props }: ButtonProps) {
    return (
        <button
            type="button"
            data-slot="button"
            data-disabled={disabled ? '' : undefined}
            className={twMerge(buttonVariants({ variant, size }), className)}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}
```

---

## Compound Components

```tsx
import { twMerge } from 'tailwind-merge'
import type { ComponentProps } from 'react'

export interface CardProps extends ComponentProps<'div'> {}

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            data-slot="card"
            className={twMerge('bg-surface flex flex-col gap-6 rounded-xl border border-border p-6 shadow-sm', className)}
            {...props}
        />
    )
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-header" className={twMerge('flex flex-col gap-1.5', className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
    return <h3 data-slot="card-title" className={twMerge('text-lg font-semibold', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
    return <div data-slot="card-content" className={className} {...props} />
}
```

---

## Cores (Tailwind Tokens — definidos em `app/globals.css`)

O projeto usa dois temas (light `:root` e dark `[data-theme="dark"]`) com CSS variables mapeadas para Tailwind via `@theme inline`. **Nunca use cores hardcoded** — sempre use os tokens abaixo.

### Primary (accent / brand)
```
bg-primary              → ações principais, CTAs
bg-primary-dim          → gradientes (from)
bg-primary-container    → gradientes (to), containers de destaque
text-primary-text       → texto com cor de accent
text-on-primary         → texto sobre bg-primary
text-on-primary-fixed   → texto branco fixo sobre primary
```

### Surfaces (hierarquia de fundos — do mais profundo ao mais elevado)
```
bg-background                  → fundo da página (body)
bg-surface                     → canvas padrão
bg-surface-dim                 → áreas rebaixadas
bg-surface-bright              → glassmorphism, floating elements
bg-surface-container-lowest    → hero sections (dark: #000, light: #fff)
bg-surface-container-low       → zonas de conteúdo, sidebar
bg-surface-container           → containers intermediários
bg-surface-container-high      → cards elevados, fly-out menus
bg-surface-container-highest   → cards interativos, hover states
```

### Texto
```
text-on-surface           → texto principal
text-on-surface-variant   → texto secundário, metadata
```

### Outline (bordas — usar com parcimônia, preferir separação por surface tiers)
```
border-outline            → bordas padrão (evitar)
border-outline-variant    → ghost borders (usar com opacity baixa)
ring-primary              → focus ring
```

### Feedback (error / success / warning)
```
bg-error / text-error                     → erros inline
bg-error-container / text-on-error-container → áreas de erro (mais sutil)
bg-success / text-success                 → sucesso
bg-success-container / text-on-success-container
bg-warning / text-warning                 → avisos
bg-warning-container / text-on-warning-container
```

### Shadows
```
shadow-ambient    → sombra difusa (cards, containers)
shadow-elevated   → sombra para elementos flutuantes (modals, dropdowns)
```

### Border Radius
```
rounded-sm       → 0.25rem
rounded-DEFAULT  → 0.5rem (padrão para buttons/cards)
rounded-md       → 0.75rem
rounded-lg       → 1rem
rounded-xl       → 1.5rem (hero cards, featured)
rounded-full     → pill shapes (chips, tags)
```

### Regras de Design
- **No-Line Rule:** Nunca usar `border` para separar seções. Usar hierarquia de surfaces.
- **Ghost Border:** Se acessibilidade exigir borda, usar `border-outline-variant` com opacity baixa (15-20%).
- **Gradientes:** CTAs primários usam `bg-gradient-to-br from-primary-dim to-primary`.
- **Glassmorphism:** Floating elements usam `bg-surface-bright/60 backdrop-blur-[24px]` (dark) ou `bg-surface-bright/80 backdrop-blur-[16px]` (light).

---

## TypeScript

```tsx
// ✅ Estender ComponentProps + VariantProps
export interface ButtonProps
    extends ComponentProps<'button'>,
        VariantProps<typeof buttonVariants> {}

// ✅ Import type para tipos
import type { ComponentProps } from 'react'
import type { VariantProps } from 'tailwind-variants'

// ❌ Não usar React.FC nem any
```

---

## Padrões Importantes

```tsx
// Sempre usar twMerge
className={twMerge('classes-base', className)}

// Sempre usar data-slot
<div data-slot="card">

// Estados com data-attributes
data-disabled={disabled ? '' : undefined}
className="data-[disabled]:opacity-50 data-[selected]:bg-primary"

// Focus visible
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

// Ícones com tamanho
<Check className="size-4" />
'[&_svg]:size-3.5' // em variantes

// Botões de ícone precisam de aria-label
<button aria-label="Fechar"><X className="size-4" /></button>

// Props spread no final
{...props}
```

---

## Checklist

- [ ] Arquivo PascalCase
- [ ] Named export
- [ ] `ComponentProps<'elemento'>` + `VariantProps`
- [ ] Variantes com `tv()`, classes com `twMerge()`
- [ ] `data-slot` para identificação
- [ ] Estados via `data-[state]:`
- [ ] Cores do tema (não hardcoded)
- [ ] Focus visible em interativos
- [ ] `aria-label` em botões de ícone
- [ ] `{...props}` no final

---

Agora analise o design anexado e gere o código do componente.
