import { Icon } from "@iconify/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  BadgeIcon,
  BadgeValue,
  BadgeWrapper,
} from "../../app/components/gamification"

const meta: Meta<typeof BadgeWrapper> = {
  title: "Components/Gamification/Badge",
  component: BadgeWrapper,
}

export default meta
type Story = StoryObj<typeof BadgeWrapper>

export const XP: Story = {
  args: {
    children: (
      <>
        <BadgeIcon>
          <Icon icon="mdi:star" width={20} height={20} />
        </BadgeIcon>
        <BadgeValue>1.250 XP</BadgeValue>
      </>
    ),
  },
}

export const Streak: Story = {
  args: {
    children: (
      <>
        <BadgeIcon>
          <Icon icon="mdi:fire" width={20} height={20} />
        </BadgeIcon>
        <BadgeValue>7 dias</BadgeValue>
      </>
    ),
  },
}

export const Level: Story = {
  args: {
    children: (
      <>
        <BadgeIcon>
          <Icon icon="mdi:shield-star" width={20} height={20} />
        </BadgeIcon>
        <BadgeValue>Nível 5</BadgeValue>
      </>
    ),
  },
}
