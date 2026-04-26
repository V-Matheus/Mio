import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { InputLabel } from "../../app/components/input"

const meta: Meta<typeof InputLabel> = {
  title: "Components/Input/InputLabel",
  component: InputLabel,
}

export default meta
type Story = StoryObj<typeof InputLabel>

export const Default: Story = {
  args: {
    htmlFor: "email",
    children: "Email",
  },
}

export const LongerCopy: Story = {
  args: {
    htmlFor: "feedback",
    children: "Conta-nos como podemos melhorar",
  },
}
