import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { ProgressBar } from "../../app/components/gamification"

const meta: Meta<typeof ProgressBar> = {
  title: "Components/Gamification/ProgressBar",
  component: ProgressBar,
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: "number" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ProgressBar>

export const Empty: Story = {
  args: {
    value: 0,
    max: 100,
  },
}

export const Quarter: Story = {
  args: {
    value: 25,
    max: 100,
  },
}

export const Half: Story = {
  args: {
    value: 50,
    max: 100,
  },
}

export const AlmostComplete: Story = {
  args: {
    value: 85,
    max: 100,
  },
}

export const Complete: Story = {
  args: {
    value: 100,
    max: 100,
  },
}

export const CustomMax: Story = {
  args: {
    value: 3,
    max: 5,
  },
}
