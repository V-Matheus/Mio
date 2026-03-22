import { Icon } from "@iconify/react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import {
  ButtonIcon,
  ButtonText,
  ButtonWrapper,
} from "../../app/components/button"

const meta: Meta<typeof ButtonWrapper> = {
  title: "Components/Button/ButtonWrapper",
  component: ButtonWrapper,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "icon"],
    },
    colorScheme: {
      control: "select",
      options: ["primary", "success", "disabled"],
    },
    disabled: { control: "boolean" },
  },
}

export default meta
type Story = StoryObj<typeof ButtonWrapper>

export const Primary: Story = {
  args: {
    variant: "primary",
    children: <ButtonText>Começar</ButtonText>,
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: <ButtonText>Cancelar</ButtonText>,
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: <ButtonText>Criar conta gratuita</ButtonText>,
  },
  decorators: [
    (Story) => (
      <div className="bg-primary p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

export const IconPrimary: Story = {
  args: {
    variant: "icon",
    colorScheme: "primary",
    "aria-label": "Play",
    children: (
      <ButtonIcon>
        <Icon icon="mdi:play" width={24} height={24} />
      </ButtonIcon>
    ),
  },
}

export const IconSuccess: Story = {
  args: {
    variant: "icon",
    colorScheme: "success",
    "aria-label": "Confirm",
    children: (
      <ButtonIcon>
        <Icon icon="mdi:check" width={24} height={24} />
      </ButtonIcon>
    ),
  },
}

export const IconDisabled: Story = {
  args: {
    variant: "icon",
    colorScheme: "disabled",
    "aria-label": "Locked",
    children: (
      <ButtonIcon>
        <Icon icon="mdi:lock" width={24} height={24} />
      </ButtonIcon>
    ),
  },
}

export const PrimaryDisabled: Story = {
  args: {
    variant: "primary",
    disabled: true,
    children: <ButtonText>Desabilitado</ButtonText>,
  },
}
