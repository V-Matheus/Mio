import { Icon } from "@iconify/react"
import { signInWithProvider } from "@/app/(auth)/_actions/auth"
import { ButtonText, ButtonWrapper } from "@/app/components/button"

const providers = [
  {
    id: "google",
    label: "Google",
    icon: "logos:google-icon",
  },
  {
    id: "github",
    label: "GitHub",
    icon: "mdi:github",
  },
] as const

export function SocialLogin() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map((provider) => (
        <form key={provider.id} action={signInWithProvider}>
          <input type="hidden" name="provider" value={provider.id} />
          <ButtonWrapper variant="social" type="submit" className="w-full">
            <Icon icon={provider.icon} width={22} height={22} />
            <ButtonText className="text-base">{provider.label}</ButtonText>
          </ButtonWrapper>
        </form>
      ))}
    </div>
  )
}
