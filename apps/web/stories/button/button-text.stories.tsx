import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ButtonText } from "../../app/components/button"

const meta: Meta<typeof ButtonText> = {
  title: "Components/Button/ButtonText",
  component: ButtonText,
}

export default meta
type Story = StoryObj<typeof ButtonText>

export const Default: Story = {
  args: {
    children: "Começar Agora",
  },
}

export const CustomClass: Story = {
  args: {
    children: "Texto Personalizado",
    className: "text-primary",
  },
}
