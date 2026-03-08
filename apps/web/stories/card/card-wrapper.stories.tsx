import { Icon } from "@iconify/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  CardDescription,
  CardIcon,
  CardTitle,
  CardWrapper,
} from "../../app/components/card"

const meta: Meta<typeof CardWrapper> = {
  title: "Components/Card/CardWrapper",
  component: CardWrapper,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "reward", "active"],
    },
  },
}

export default meta
type Story = StoryObj<typeof CardWrapper>

export const Default: Story = {
  args: {
    variant: "default",
    children: (
      <div className="flex flex-col gap-2">
        <CardTitle>Missão do dia</CardTitle>
        <CardDescription>Complete 3 exercícios</CardDescription>
      </div>
    ),
  },
}

export const Reward: Story = {
  args: {
    variant: "reward",
    children: (
      <>
        <CardIcon colorScheme="primary-solid" size={48}>
          <Icon icon="mdi:trophy" width={28} height={28} />
        </CardIcon>
        <div className="flex flex-col gap-1">
          <CardTitle>Recompensa</CardTitle>
          <CardDescription>+50 XP</CardDescription>
        </div>
      </>
    ),
  },
}

export const Active: Story = {
  args: {
    variant: "active",
    children: (
      <>
        <CardIcon colorScheme="primary" size={48}>
          <Icon icon="mdi:code-braces" width={28} height={28} />
        </CardIcon>
        <div className="flex flex-col gap-1">
          <CardTitle>Em progresso</CardTitle>
          <CardDescription>Variáveis em Python</CardDescription>
        </div>
      </>
    ),
  },
}
