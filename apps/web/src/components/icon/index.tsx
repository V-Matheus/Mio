"use client"

import { addIcon, Icon as IconifyIcon, type IconProps } from "@iconify/react"
import deviconGit from "@iconify-icons/devicon/git"
import deviconHtml5 from "@iconify-icons/devicon/html5"
import deviconJavascript from "@iconify-icons/devicon/javascript"
import deviconNodejs from "@iconify-icons/devicon/nodejs"
import deviconPostgresql from "@iconify-icons/devicon/postgresql"
import deviconPython from "@iconify-icons/devicon/python"
import deviconReact from "@iconify-icons/devicon/react"
import deviconTypescript from "@iconify-icons/devicon/typescript"
import logosGoogleIcon from "@iconify-icons/logos/google-icon"
import lucideBookOpen from "@iconify-icons/lucide/book-open"
import lucideChevronUp from "@iconify-icons/lucide/chevron-up"
import lucideHome from "@iconify-icons/lucide/home"
import lucideLogOut from "@iconify-icons/lucide/log-out"
import lucideMenu from "@iconify-icons/lucide/menu"
import lucideUser from "@iconify-icons/lucide/user"
import mdiAccountGroupOutline from "@iconify-icons/mdi/account-group-outline"
import mdiAccountStarOutline from "@iconify-icons/mdi/account-star-outline"
import mdiArrowLeft from "@iconify-icons/mdi/arrow-left"
import mdiCertificateOutline from "@iconify-icons/mdi/certificate-outline"
import mdiCheck from "@iconify-icons/mdi/check"
import mdiCheckBold from "@iconify-icons/mdi/check-bold"
import mdiCheckCircle from "@iconify-icons/mdi/check-circle"
import mdiClockOutline from "@iconify-icons/mdi/clock-outline"
import mdiCloseCircle from "@iconify-icons/mdi/close-circle"
import mdiCodeBraces from "@iconify-icons/mdi/code-braces"
import mdiEmailOutline from "@iconify-icons/mdi/email-outline"
import mdiEyeOffOutline from "@iconify-icons/mdi/eye-off-outline"
import mdiEyeOutline from "@iconify-icons/mdi/eye-outline"
import mdiFacebook from "@iconify-icons/mdi/facebook"
import mdiFire from "@iconify-icons/mdi/fire"
import mdiGithub from "@iconify-icons/mdi/github"
import mdiInstagram from "@iconify-icons/mdi/instagram"
import mdiLeaf from "@iconify-icons/mdi/leaf"
import mdiLightbulb from "@iconify-icons/mdi/lightbulb"
import mdiLinkedin from "@iconify-icons/mdi/linkedin"
import mdiLock from "@iconify-icons/mdi/lock"
import mdiMagnify from "@iconify-icons/mdi/magnify"
import mdiPlay from "@iconify-icons/mdi/play"
import mdiSeedOutline from "@iconify-icons/mdi/seed-outline"
import mdiShieldStar from "@iconify-icons/mdi/shield-star"
import mdiSproutOutline from "@iconify-icons/mdi/sprout-outline"
import mdiStar from "@iconify-icons/mdi/star"
import mdiStarOutline from "@iconify-icons/mdi/star-outline"
import mdiTreeOutline from "@iconify-icons/mdi/tree-outline"
import mdiTrophy from "@iconify-icons/mdi/trophy"
import mdiTrophyOutline from "@iconify-icons/mdi/trophy-outline"
import mdiTwitter from "@iconify-icons/mdi/twitter"
import mdiUpdate from "@iconify-icons/mdi/update"
import { useId } from "react"

/**
 * Registro central de ícones. Renderiza offline (síncrono) só os ícones que o
 * projeto usa — cada um vem como módulo ESM próprio de `@iconify-icons/<set>`,
 * então só os listados aqui entram no bundle (os pacotes são devDependencies).
 *
 * Por que existe: o `@iconify/react` busca cada SVG na API em runtime e inicia
 * com `mounted=false`, renderizando um `<span/>` vazio até o `useEffect` do
 * cliente — é o que fazia os ícones "piscarem" ao recarregar. Aqui registramos
 * os dados offline (`addIcon`) e passamos `ssr`, então o SVG sai já no HTML do
 * servidor e no 1º render. (`@iconify/react` é client-only — daí o `"use client"`.)
 *
 * Para adicionar um ícone: `yarn add -D @iconify-icons/<set>` (se o set ainda
 * não estiver instalado), importe-o de `@iconify-icons/<set>/<nome>` e registre
 * uma linha em `registry`. O uso continua `<Icon icon="set:nome" />`.
 */
const registry: Record<string, IconProps["icon"]> = {
  "devicon:git": deviconGit,
  "devicon:html5": deviconHtml5,
  "devicon:javascript": deviconJavascript,
  "devicon:nodejs": deviconNodejs,
  "devicon:postgresql": deviconPostgresql,
  "devicon:python": deviconPython,
  "devicon:react": deviconReact,
  "devicon:typescript": deviconTypescript,
  "logos:google-icon": logosGoogleIcon,
  "lucide:book-open": lucideBookOpen,
  "lucide:chevron-up": lucideChevronUp,
  "lucide:home": lucideHome,
  "lucide:log-out": lucideLogOut,
  "lucide:menu": lucideMenu,
  "lucide:user": lucideUser,
  "mdi:account-group-outline": mdiAccountGroupOutline,
  "mdi:account-star-outline": mdiAccountStarOutline,
  "mdi:arrow-left": mdiArrowLeft,
  "mdi:certificate-outline": mdiCertificateOutline,
  "mdi:check": mdiCheck,
  "mdi:check-bold": mdiCheckBold,
  "mdi:check-circle": mdiCheckCircle,
  "mdi:clock-outline": mdiClockOutline,
  "mdi:close-circle": mdiCloseCircle,
  "mdi:code-braces": mdiCodeBraces,
  "mdi:email-outline": mdiEmailOutline,
  "mdi:eye-off-outline": mdiEyeOffOutline,
  "mdi:eye-outline": mdiEyeOutline,
  "mdi:facebook": mdiFacebook,
  "mdi:fire": mdiFire,
  "mdi:github": mdiGithub,
  "mdi:instagram": mdiInstagram,
  "mdi:leaf": mdiLeaf,
  "mdi:lightbulb": mdiLightbulb,
  "mdi:linkedin": mdiLinkedin,
  "mdi:lock": mdiLock,
  "mdi:magnify": mdiMagnify,
  "mdi:play": mdiPlay,
  "mdi:seed-outline": mdiSeedOutline,
  "mdi:shield-star": mdiShieldStar,
  "mdi:sprout-outline": mdiSproutOutline,
  "mdi:star": mdiStar,
  "mdi:star-outline": mdiStarOutline,
  "mdi:tree-outline": mdiTreeOutline,
  "mdi:trophy": mdiTrophy,
  "mdi:trophy-outline": mdiTrophyOutline,
  "mdi:twitter": mdiTwitter,
  "mdi:update": mdiUpdate,
}

for (const [name, data] of Object.entries(registry)) {
  addIcon(name, data as Parameters<typeof addIcon>[1])
}

export function Icon({ ssr = true, id, ...props }: IconProps) {
  const stableId = useId()
  return <IconifyIcon ssr={ssr} id={id ?? stableId} {...props} />
}
