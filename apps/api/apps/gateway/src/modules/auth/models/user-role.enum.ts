import { registerEnumType } from "@nestjs/graphql"

export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
}

registerEnumType(UserRole, {
  name: "UserRole",
  description: "Perfil de acesso do usuário",
})
