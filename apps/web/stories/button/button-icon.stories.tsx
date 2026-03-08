import { Icon } from "@iconify/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ButtonIcon } from "../../app/components/button"

const meta: Meta<typeof ButtonIcon> = {
  title: "Components/Button/ButtonIcon",
  component: ButtonIcon,
  argTypes: {
    size: { control: "number" },
  },
}

export default meta
type Story = StoryObj<typeof ButtonIcon>

export const Default: Story = {
  args: {
    size: 24,
    children: <Icon icon="mdi:star" width={24} height={24} />,
  },
}

export const Large: Story = {
  args: {
    size: 40,
    children: <Icon icon="mdi:star" width={40} height={40} />,
  },
}
