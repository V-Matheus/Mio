import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "../../app/components/input"

const meta: Meta<typeof InputWrapper> = {
  title: "Components/Input/InputWrapper",
  component: InputWrapper,
}

export default meta
type Story = StoryObj<typeof InputWrapper>

export const Default: Story = {
  args: {
    children: (
      <>
        <InputLabel htmlFor="email">Email</InputLabel>
        <InputField>
          <InputControl
            id="email"
            name="email"
            type="email"
            placeholder="voce@email.com"
          />
        </InputField>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export const WithCustomClassName: Story = {
  args: {
    className: "gap-4",
    children: (
      <>
        <InputLabel htmlFor="email">Email com gap maior</InputLabel>
        <InputField>
          <InputControl id="email" name="email" placeholder="voce@email.com" />
        </InputField>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}
