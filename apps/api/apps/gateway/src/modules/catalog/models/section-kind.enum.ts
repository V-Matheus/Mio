import { registerEnumType } from "@nestjs/graphql"

export enum SectionKind {
  TEXT = "TEXT",
  EXERCISE = "EXERCISE",
}

registerEnumType(SectionKind, {
  name: "SectionKind",
  description: "Tipo de seção de uma lição",
})
