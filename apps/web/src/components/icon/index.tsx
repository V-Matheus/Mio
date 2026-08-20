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
import lucideActivity from "@iconify-icons/lucide/activity"
import lucideAlertCircle from "@iconify-icons/lucide/alert-circle"
import lucideAlertTriangle from "@iconify-icons/lucide/alert-triangle"
import lucideArrowLeft from "@iconify-icons/lucide/arrow-left"
import lucideArrowRight from "@iconify-icons/lucide/arrow-right"
import lucideAward from "@iconify-icons/lucide/award"
import lucideBold from "@iconify-icons/lucide/bold"
import lucideBookOpen from "@iconify-icons/lucide/book-open"
import lucideCheck from "@iconify-icons/lucide/check"
import lucideChevronDown from "@iconify-icons/lucide/chevron-down"
import lucideChevronRight from "@iconify-icons/lucide/chevron-right"
import lucideChevronUp from "@iconify-icons/lucide/chevron-up"
import lucideClock from "@iconify-icons/lucide/clock"
import lucideCode from "@iconify-icons/lucide/code"
import lucideCode2 from "@iconify-icons/lucide/code-2"
import lucideCompass from "@iconify-icons/lucide/compass"
import lucideCrown from "@iconify-icons/lucide/crown"
import lucideEye from "@iconify-icons/lucide/eye"
import lucideFeather from "@iconify-icons/lucide/feather"
import lucideFileText from "@iconify-icons/lucide/file-text"
import lucideFlame from "@iconify-icons/lucide/flame"
import lucideFolderOpen from "@iconify-icons/lucide/folder-open"
import lucideFolderPlus from "@iconify-icons/lucide/folder-plus"
import lucideGamepad2 from "@iconify-icons/lucide/gamepad-2"
import lucideGraduationCap from "@iconify-icons/lucide/graduation-cap"
import lucideHistory from "@iconify-icons/lucide/history"
import lucideHome from "@iconify-icons/lucide/home"
import lucideInfo from "@iconify-icons/lucide/info"
import lucideItalic from "@iconify-icons/lucide/italic"
import lucideLayers from "@iconify-icons/lucide/layers"
import lucideLayoutDashboard from "@iconify-icons/lucide/layout-dashboard"
import lucideLink from "@iconify-icons/lucide/link"
import lucideList from "@iconify-icons/lucide/list"
import lucideLogOut from "@iconify-icons/lucide/log-out"
import lucideMedal from "@iconify-icons/lucide/medal"
import lucideMenu from "@iconify-icons/lucide/menu"
import lucideMessageSquare from "@iconify-icons/lucide/message-square"
import lucideMoreVertical from "@iconify-icons/lucide/more-vertical"
import lucidePencil from "@iconify-icons/lucide/pencil"
import lucidePlay from "@iconify-icons/lucide/play"
import lucidePlus from "@iconify-icons/lucide/plus"
import lucidePlusCircle from "@iconify-icons/lucide/plus-circle"
import lucideQuote from "@iconify-icons/lucide/quote"
import lucideSave from "@iconify-icons/lucide/save"
import lucideSearch from "@iconify-icons/lucide/search"
import lucideShield from "@iconify-icons/lucide/shield"
import lucideShieldAlert from "@iconify-icons/lucide/shield-alert"
import lucideShieldCheck from "@iconify-icons/lucide/shield-check"
import lucideSprout from "@iconify-icons/lucide/sprout"
import lucideStar from "@iconify-icons/lucide/star"
import lucideTarget from "@iconify-icons/lucide/target"
import lucideTrash2 from "@iconify-icons/lucide/trash-2"
import lucideTrendingUp from "@iconify-icons/lucide/trending-up"
import lucideTrophy from "@iconify-icons/lucide/trophy"
import lucideUser from "@iconify-icons/lucide/user"
import lucideX from "@iconify-icons/lucide/x"
import lucideZap from "@iconify-icons/lucide/zap"
import mdiAccountGroupOutline from "@iconify-icons/mdi/account-group-outline"
import mdiAccountStarOutline from "@iconify-icons/mdi/account-star-outline"
import mdiArrowLeft from "@iconify-icons/mdi/arrow-left"
import mdiBookmark from "@iconify-icons/mdi/bookmark"
import mdiBookmarkOutline from "@iconify-icons/mdi/bookmark-outline"
import mdiCertificateOutline from "@iconify-icons/mdi/certificate-outline"
import mdiCheck from "@iconify-icons/mdi/check"
import mdiCheckBold from "@iconify-icons/mdi/check-bold"
import mdiCheckCircle from "@iconify-icons/mdi/check-circle"
import mdiClockOutline from "@iconify-icons/mdi/clock-outline"
import mdiClose from "@iconify-icons/mdi/close"
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
import mdiLockAlert from "@iconify-icons/mdi/lock-alert"
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
  "lucide:activity": lucideActivity,
  "lucide:alert-circle": lucideAlertCircle,
  "lucide:alert-triangle": lucideAlertTriangle,
  "lucide:arrow-left": lucideArrowLeft,
  "lucide:arrow-right": lucideArrowRight,
  "lucide:award": lucideAward,
  "lucide:bold": lucideBold,
  "lucide:book-open": lucideBookOpen,
  "lucide:check": lucideCheck,
  "lucide:chevron-down": lucideChevronDown,
  "lucide:chevron-right": lucideChevronRight,
  "lucide:chevron-up": lucideChevronUp,
  "lucide:clock": lucideClock,
  "lucide:code": lucideCode,
  "lucide:code-2": lucideCode2,
  "lucide:compass": lucideCompass,
  "lucide:crown": lucideCrown,
  "lucide:eye": lucideEye,
  "lucide:feather": lucideFeather,
  "lucide:file-text": lucideFileText,
  "lucide:flame": lucideFlame,
  "lucide:folder-open": lucideFolderOpen,
  "lucide:folder-plus": lucideFolderPlus,
  "lucide:gamepad-2": lucideGamepad2,
  "lucide:graduation-cap": lucideGraduationCap,
  "lucide:history": lucideHistory,
  "lucide:home": lucideHome,
  "lucide:info": lucideInfo,
  "lucide:italic": lucideItalic,
  "lucide:layers": lucideLayers,
  "lucide:layout-dashboard": lucideLayoutDashboard,
  "lucide:link": lucideLink,
  "lucide:list": lucideList,
  "lucide:log-out": lucideLogOut,
  "lucide:medal": lucideMedal,
  "lucide:menu": lucideMenu,
  "lucide:message-square": lucideMessageSquare,
  "lucide:more-vertical": lucideMoreVertical,
  "lucide:pencil": lucidePencil,
  "lucide:play": lucidePlay,
  "lucide:plus": lucidePlus,
  "lucide:plus-circle": lucidePlusCircle,
  "lucide:quote": lucideQuote,
  "lucide:save": lucideSave,
  "lucide:search": lucideSearch,
  "lucide:shield": lucideShield,
  "lucide:shield-alert": lucideShieldAlert,
  "lucide:shield-check": lucideShieldCheck,
  "lucide:sprout": lucideSprout,
  "lucide:star": lucideStar,
  "lucide:target": lucideTarget,
  "lucide:trash-2": lucideTrash2,
  "lucide:trending-up": lucideTrendingUp,
  "lucide:trophy": lucideTrophy,
  "lucide:user": lucideUser,
  "lucide:x": lucideX,
  "lucide:zap": lucideZap,
  "mdi:account-group-outline": mdiAccountGroupOutline,
  "mdi:account-star-outline": mdiAccountStarOutline,
  "mdi:arrow-left": mdiArrowLeft,
  "mdi:bookmark": mdiBookmark,
  "mdi:bookmark-outline": mdiBookmarkOutline,
  "mdi:certificate-outline": mdiCertificateOutline,
  "mdi:check": mdiCheck,
  "mdi:check-bold": mdiCheckBold,
  "mdi:check-circle": mdiCheckCircle,
  "mdi:clock-outline": mdiClockOutline,
  "mdi:close": mdiClose,
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
  "mdi:lock-alert": mdiLockAlert,
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
