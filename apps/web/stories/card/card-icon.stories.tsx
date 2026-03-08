import { Icon } from "@iconify/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CardIcon } from "../../app/components/card"

const meta: Meta<typeof CardIcon> = {
  title: "Components/Card/CardIcon",
  component: CardIcon,
  argTypes: {
    colorScheme: {
      control: "select",
      options: ["primary", "primary-solid", "success", "secondary"],
    },
    size: { control: "number" },
  },
}

export default meta
type Story = StoryObj<typeof CardIcon>

export const Primary: Story = {
  args: {
    colorScheme: "primary",
    size: 48,
    children: <Icon icon="mdi:star" width={28} height={28} />,
  },
}

export const PrimarySolid: Story = {
  args: {
    colorScheme: "primary-solid",
    size: 48,
    children: <Icon icon="mdi:trophy" width={28} height={28} />,
  },
}

export const Success: Story = {
  args: {
    colorScheme: "success",
    size: 48,
    children: <Icon icon="mdi:check-circle" width={28} height={28} />,
  },
}

export const Secondary: Story = {
  args: {
    colorScheme: "secondary",
    size: 48,
    children: <Icon icon="mdi:lightbulb" width={28} height={28} />,
  },
}
