import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const sampleText =
  "A jornada de mil linhas de código começa com um único commit."

function TypographyShowcase() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <section>
        <h3
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 12,
            fontFamily: "monospace",
          }}
        >
          font-display (Outfit) — Títulos e destaques
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-3xl font-bold
            </span>
            <p className="font-display text-3xl font-bold text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-2xl font-bold
            </span>
            <p className="font-display text-2xl font-bold text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-xl font-bold
            </span>
            <p className="font-display text-xl font-bold text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-lg font-bold
            </span>
            <p className="font-display text-lg font-bold text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-sm font-bold
            </span>
            <p className="font-display text-sm font-bold text-foreground">
              {sampleText}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 12,
            fontFamily: "monospace",
          }}
        >
          font-body (Plus Jakarta Sans) — Corpo de texto
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-base font-normal
            </span>
            <p className="font-body text-base font-normal text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-base font-semibold
            </span>
            <p className="font-body text-base font-semibold text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-sm font-normal
            </span>
            <p className="font-body text-sm font-normal text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-sm font-semibold
            </span>
            <p className="font-body text-sm font-semibold text-foreground">
              {sampleText}
            </p>
          </div>
          <div>
            <span
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontFamily: "monospace",
              }}
            >
              text-xs font-normal
            </span>
            <p className="font-body text-xs font-normal text-foreground">
              {sampleText}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginBottom: 12,
            fontFamily: "monospace",
          }}
        >
          Uso nos componentes
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 160,
                fontSize: 12,
                color: "#6b7280",
                fontFamily: "monospace",
              }}
            >
              ButtonText
            </span>
            <span className="font-display text-xl font-bold leading-none text-foreground">
              Começar Agora
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 160,
                fontSize: 12,
                color: "#6b7280",
                fontFamily: "monospace",
              }}
            >
              CardTitle
            </span>
            <span className="text-sm font-semibold text-foreground leading-tight">
              Missão do dia
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 160,
                fontSize: 12,
                color: "#6b7280",
                fontFamily: "monospace",
              }}
            >
              CardDescription
            </span>
            <span className="font-display text-lg font-bold text-foreground leading-tight">
              Complete 3 exercícios
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 160,
                fontSize: 12,
                color: "#6b7280",
                fontFamily: "monospace",
              }}
            >
              BadgeValue
            </span>
            <span className="font-display text-sm font-bold text-foreground leading-none">
              1.250 XP
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

const meta: Meta = {
  title: "Foundations/Typography",
  component: TypographyShowcase,
}

export default meta

export const Showcase: StoryObj = {}
