import { render, screen } from "@testing-library/react"
import { AvatarImage, AvatarWrapper, getInitials } from "@/components/avatar"

describe("getInitials", () => {
  it("deriva primeira e última inicial", () => {
    expect(getInitials("Victor Matheus")).toBe("VM")
  })

  it("usa só a inicial quando há um único nome", () => {
    expect(getInitials("Victor")).toBe("V")
  })

  it("ignora espaços extras", () => {
    expect(getInitials("  Victor   Matheus  ")).toBe("VM")
  })

  it("retorna '?' quando não há nome", () => {
    expect(getInitials(null)).toBe("?")
    expect(getInitials("")).toBe("?")
  })
})

describe("AvatarImage", () => {
  it("renderiza a imagem quando há src", () => {
    render(
      <AvatarWrapper>
        <AvatarImage src="https://example.com/a.png" name="Victor Matheus" />
      </AvatarWrapper>,
    )

    const img = screen.getByRole("img")
    expect(img).toHaveAttribute("src", "https://example.com/a.png")
    expect(img).toHaveAttribute("alt", "Victor Matheus")
  })

  it("cai para as iniciais quando não há src", () => {
    render(
      <AvatarWrapper>
        <AvatarImage src={null} name="Victor Matheus" />
      </AvatarWrapper>,
    )

    expect(screen.queryByRole("img")).toBeNull()
    expect(screen.getByText("VM")).toBeInTheDocument()
  })
})
