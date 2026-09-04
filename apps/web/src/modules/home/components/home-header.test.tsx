import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { HomeHeader } from "./home-header"

describe("HomeHeader", () => {
  it("deve renderizar a saudação com o primeiro nome do usuário", () => {
    render(
      <HomeHeader
        user={{
          code: "123",
          name: "Júnior Dev",
          email: "junior@mio.dev",
          avatarUrl: null,
          roles: ["STUDENT"],
        }}
      />,
    )

    expect(screen.getByText(/Olá, Júnior! 👋/i)).toBeInTheDocument()
    expect(
      screen.getByText(
        /Continue sua jornada de aprendizado e alcance novos objetivos/i,
      ),
    ).toBeInTheDocument()
  })

  it("deve renderizar fallback 'Dev' quando o nome for vazio", () => {
    render(
      <HomeHeader
        user={{
          code: "123",
          name: "",
          email: "dev@mio.dev",
          avatarUrl: null,
          roles: ["STUDENT"],
        }}
      />,
    )

    expect(screen.getByText(/Olá, Dev! 👋/i)).toBeInTheDocument()
  })
})
