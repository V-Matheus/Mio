import type { ComponentProps } from "react"
import { AvatarFallback } from "./avatar-fallback"

interface AvatarImageProps extends Omit<ComponentProps<"img">, "src"> {
  src?: string | null
  /** Nome usado para derivar as iniciais quando não há imagem. */
  name?: string | null
}

/**
 * Imagem do avatar. Usa `<img>` (não `next/image`) porque as URLs vêm de
 * provedores OAuth arbitrários (Google, GitHub) e não queremos manter uma
 * allowlist de domínios no `next.config`. Sempre dentro de `AvatarWrapper`,
 * que recorta no formato redondo.
 *
 * Quando não há `src`, cai para `AvatarFallback` com as iniciais de `name`.
 */
export function AvatarImage({
  src,
  name,
  className = "",
  alt,
  ...props
}: AvatarImageProps) {
  if (!src) {
    return <AvatarFallback name={name} className={className} />
  }

  const classes = ["size-full object-cover", className]
    .filter(Boolean)
    .join(" ")

  return (
    // biome-ignore lint/performance/noImgElement: URLs OAuth arbitrárias; sem allowlist de domínios no next.config.
    <img
      className={classes}
      src={src}
      alt={alt ?? name ?? "Avatar"}
      referrerPolicy="no-referrer"
      {...props}
    />
  )
}
