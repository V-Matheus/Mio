import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Icon } from "./index"

describe("Icon registry", () => {
  it("renderiza ícones do ranking e gamificação sem erros", () => {
    const rankingIcons = [
      "lucide:crown",
      "lucide:trophy",
      "lucide:medal",
      "lucide:award",
      "lucide:zap",
      "lucide:sprout",
      "lucide:compass",
      "lucide:shield",
      "lucide:flame",
    ]

    for (const icon of rankingIcons) {
      const { container } = render(
        <Icon icon={icon} data-testid={`icon-${icon}`} />,
      )
      expect(container.querySelector("svg")).toBeInTheDocument()
    }
  })
})
