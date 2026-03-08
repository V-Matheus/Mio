import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CardDescription } from "../../app/components/card"

const meta: Meta<typeof CardDescription> = {
  title: "Components/Card/CardDescription",
  component: CardDescription,
}

export default meta
type Story = StoryObj<typeof CardDescription>

export const Default: Story = {
  args: {
    children: "Complete 3 exercícios de lógica",
  },
}
