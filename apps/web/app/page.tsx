import { Icon } from "@iconify/react"
import { ButtonIcon, ButtonText, ButtonWrapper } from "./components/button"
import {
  CardDescription,
  CardIcon,
  CardTitle,
  CardWrapper,
} from "./components/card"

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

      <div className="flex gap-4">
        <CardWrapper variant="reward">
          <CardIcon colorScheme="secondary">
            <Icon icon="lucide:trophy" />
          </CardIcon>
          <CardTitle>Reward Card</CardTitle>
          <CardDescription>+50 XP</CardDescription>
        </CardWrapper>

        <CardWrapper variant="active">
          <CardIcon colorScheme="primary-solid">
            <Icon icon="mdi:play" />
          </CardIcon>
          <CardTitle className="font-bold text-primary">
            Active Module Item
          </CardTitle>
        </CardWrapper>
      </div>

      <Icon icon="devicon:react" />
      <Icon icon="devicon:javascript" />
      <Icon icon="devicon:python" />
    </main>
  )
}
