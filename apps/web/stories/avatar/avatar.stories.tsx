import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { AvatarImage, AvatarWrapper } from "@/components/avatar"

const meta: Meta<typeof AvatarWrapper> = {
  title: "Components/Avatar",
  component: AvatarWrapper,
  args: {
    size: "lg",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg", "xl"],
    },
  },
}

export default meta
type Story = StoryObj<typeof AvatarWrapper>

export const WithImage: Story = {
  render: (args) => (
    <AvatarWrapper {...args}>
      <AvatarImage
        src="https://avatars.githubusercontent.com/u/9919?v=4"
        name="Victor Matheus"
      />
    </AvatarWrapper>
  ),
}

export const Fallback: Story = {
  render: (args) => (
    <AvatarWrapper {...args}>
      <AvatarImage src={null} name="Victor Matheus" />
    </AvatarWrapper>
  ),
}

export const FallbackUnknown: Story = {
  render: (args) => (
    <AvatarWrapper {...args}>
      <AvatarImage src={null} name={null} />
    </AvatarWrapper>
  ),
}
