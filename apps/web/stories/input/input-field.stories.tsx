import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Icon } from "@/components/icon"
import {
  InputAdornment,
  InputControl,
  InputField,
  InputLabel,
  InputWrapper,
} from "@/components/input"

const meta: Meta<typeof InputField> = {
  title: "Components/Input/InputField",
  component: InputField,
  argTypes: {
    colorScheme: {
      control: "select",
      options: ["primary", "success", "disabled"],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InputField>

export const Primary: Story = {
  args: {
    colorScheme: "primary",
    children: (
      <InputControl name="email" type="email" placeholder="voce@email.com" />
    ),
  },
}

export const Success: Story = {
  args: {
    colorScheme: "success",
    children: (
      <InputControl
        name="email"
        type="email"
        defaultValue="victor@example.com"
      />
    ),
  },
}

export const Disabled: Story = {
  args: {
    colorScheme: "disabled",
    children: (
      <InputControl
        name="email"
        type="email"
        placeholder="Indisponível"
        disabled
      />
    ),
  },
}

export const WithPasswordAdornment: Story = {
  args: {
    colorScheme: "primary",
    children: (
      <>
        <InputControl name="password" type="password" placeholder="••••••••" />
        <InputAdornment aria-label="Mostrar senha">
          <Icon icon="mdi:eye-outline" width={20} height={20} />
        </InputAdornment>
      </>
    ),
  },
}

export const Composed: Story = {
  render: () => (
    <InputWrapper>
      <InputLabel htmlFor="email-composed">Email</InputLabel>
      <InputField>
        <InputControl
          id="email-composed"
          name="email"
          type="email"
          placeholder="voce@email.com"
        />
      </InputField>
    </InputWrapper>
  ),
}
