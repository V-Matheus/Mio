import type { Meta, StoryObj } from "@storybook/nextjs-vite"

const colors = [
  {
    name: "Primary",
    variable: "--color-primary",
    value: "#FF9100",
    class: "bg-primary",
  },
  {
    name: "Secondary",
    variable: "--color-secondary",
    value: "#FBBF24",
    class: "bg-secondary",
  },
  {
    name: "Accent",
    variable: "--color-accent",
    value: "#38BDF8",
    class: "bg-accent",
  },
  {
    name: "Success",
    variable: "--color-success",
    value: "#10B981",
    class: "bg-success",
  },
  {
    name: "Background",
    variable: "--color-background",
    value: "#FDF5EE",
    class: "bg-background",
  },
  {
    name: "Foreground",
    variable: "--color-foreground",
    value: "#332D28",
    class: "bg-foreground",
  },
  {
    name: "Primary Shadow",
    variable: "--color-primary-shadow",
    value: "#CC3300",
    class: "bg-primary-shadow",
  },
  {
    name: "Success Shadow",
    variable: "--color-success-shadow",
    value: "#0A8C62",
    class: "bg-success-shadow",
  },
  {
    name: "Disabled",
    variable: "--color-disabled",
    value: "#D4D4D4",
    class: "bg-disabled",
  },
  {
    name: "Disabled Foreground",
    variable: "--color-disabled-foreground",
    value: "#9E9E9E",
    class: "bg-disabled-foreground",
  },
  {
    name: "Disabled Shadow",
    variable: "--color-disabled-shadow",
    value: "#B0B0B0",
    class: "bg-disabled-shadow",
  },
]

function ColorSwatch({
  name,
  variable,
  value,
  className,
}: {
  name: string
  variable: string
  value: string
  className: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "8px 0",
      }}
    >
      <div
        className={className}
        style={{
          width: 64,
          height: 64,
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{name}</span>
        <span
          style={{ fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}
        >
          {variable}
        </span>
        <span
          style={{ fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

const stackColors = [
  {
    name: "Front-End",
    value: "#FF9100",
    hsl: "34 100% 50%",
    icon: "</>",
    description: "Laranja: Energia, interface e criatividade visual.",
  },
  {
    name: "Back-End",
    value: "#3B82F6",
    hsl: "217 91% 60%",
    icon: ">_",
    description: "Azul: Lógica, servidores e robustez de dados.",
  },
  {
    name: "Mobile",
    value: "#A855F7",
    hsl: "271 91% 65%",
    icon: "📱",
    description: "Roxo: Inovação e experiências em movimento.",
  },
  {
    name: "DevOps",
    value: "#10B981",
    hsl: "160 84% 39%",
    icon: "∞",
    description: "Verde: Fluxo, automação e estabilidade.",
  },
  {
    name: "Design",
    value: "#EC4899",
    hsl: "330 81% 60%",
    icon: "🎨",
    description: "Rosa: Estética, UX e harmonia visual.",
  },
]

function StackCard({
  name,
  value,
  hsl,
  icon,
  description,
}: (typeof stackColors)[number]) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 8, width: 180 }}
    >
      <div
        style={{
          backgroundColor: value,
          width: "100%",
          height: 120,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 40, color: "white", opacity: 0.9 }}>
          {icon}
        </span>
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{name}</p>
        <p
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontFamily: "monospace",
            margin: "2px 0",
          }}
        >
          {value} · {hsl}
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  )
}

function ColorPalette() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {colors.map((color) => (
        <ColorSwatch
          key={color.name}
          name={color.name}
          variable={color.variable}
          value={color.value}
          className={color.class}
        />
      ))}
    </div>
  )
}

function StackPalette() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      {stackColors.map((color) => (
        <StackCard key={color.name} {...color} />
      ))}
    </div>
  )
}

const meta: Meta = {
  title: "Foundations/Colors",
  component: ColorPalette,
}

export default meta

export const Palette: StoryObj = {}

export const Stacks: StoryObj = {
  render: () => <StackPalette />,
}
