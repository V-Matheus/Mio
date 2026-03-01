import { Icon } from "@iconify/react"
import { ButtonIcon, ButtonText, ButtonWrapper } from "./components/button"

export default function Home() {
  return (
    <main>
      <h1 className="text-[24px]">Mio</h1>
      <ButtonWrapper>
        <ButtonText>Primary Action</ButtonText>
      </ButtonWrapper>
      <ButtonWrapper variant="secondary">
        <ButtonText>Secondary Action</ButtonText>
      </ButtonWrapper>
      <ButtonWrapper variant="icon" colorScheme="success">
        <ButtonIcon>
          <Icon icon="lucide:check" />
        </ButtonIcon>
      </ButtonWrapper>
      <ButtonWrapper variant="icon" colorScheme="disabled">
        <ButtonIcon>
          <Icon icon="lucide:lock" />
        </ButtonIcon>
      </ButtonWrapper>

      <Icon icon="devicon:react" />
      <Icon icon="devicon:javascript" />
      <Icon icon="devicon:python" />
    </main>
  )
}
