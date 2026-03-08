import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { CardTitle } from "../../app/components/card"

const metaTitle: Meta<typeof CardTitle> = {
  title: "Components/Card/CardTitle",
  component: CardTitle,
}

export default metaTitle
type TitleStory = StoryObj<typeof CardTitle>

export const Title: TitleStory = {
  args: {
    children: "Missão do dia",
  },
}
