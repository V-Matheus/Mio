import { Icon } from "@iconify/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  InputAdornment,
  InputControl,
  InputField,
} from "../../app/components/input"

const meta: Meta<typeof InputAdornment> = {
  title: "Components/Input/InputAdornment",
  component: InputAdornment,
  decorators: [
    (Story) => (
      <div className="w-96">
        <InputField>
          <InputControl
            name="password"
            type="password"
            placeholder="••••••••"
          />
          <Story />
        </InputField>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof InputAdornment>

export const ShowPassword: Story = {
  args: {
    "aria-label": "Mostrar senha",
    children: <Icon icon="mdi:eye-outline" width={20} height={20} />,
  },
}

export const HidePassword: Story = {
  args: {
    "aria-label": "Ocultar senha",
    children: <Icon icon="mdi:eye-off-outline" width={20} height={20} />,
  },
}

export const ClearField: Story = {
  args: {
    "aria-label": "Limpar campo",
    children: <Icon icon="mdi:close-circle" width={20} height={20} />,
  },
}

export const Search: Story = {
  args: {
    "aria-label": "Buscar",
    type: "submit",
    children: <Icon icon="mdi:magnify" width={20} height={20} />,
  },
}
