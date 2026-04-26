import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { InputControl, InputField } from "../../app/components/input"

const meta: Meta<typeof InputControl> = {
  title: "Components/Input/InputControl",
  component: InputControl,
  decorators: [
    (Story) => (
      <div className="w-96">
        <InputField>
          <Story />
        </InputField>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InputControl>

export const Default: Story = {
  args: {
    name: "email",
    type: "email",
    placeholder: "voce@email.com",
  },
}

export const WithValue: Story = {
  args: {
    name: "email",
    type: "email",
    defaultValue: "victor@example.com",
  },
}

export const Password: Story = {
  args: {
    name: "password",
    type: "password",
    defaultValue: "supersecret",
  },
}

export const Disabled: Story = {
  args: {
    name: "email",
    type: "email",
    placeholder: "Indisponível",
    disabled: true,
  },
}
