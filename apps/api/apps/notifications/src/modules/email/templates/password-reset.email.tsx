import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type PasswordResetEmailProps = {
  resetToken: string
  appUrl: string
  expiresAt: string
}

export function PasswordResetEmail({
  resetToken,
  appUrl,
  expiresAt,
}: PasswordResetEmailProps) {
  const resetUrl = `${appUrl}/redefinir-senha/${resetToken}`

  return (
    <Html>
      <Head />
      <Preview>Redefinição de Senha - Mio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Redefinição de Senha</Heading>
          <Text style={text}>
            Você solicitou a redefinição de senha para sua conta no Mio. Clique
            no botão abaixo para escolher uma nova senha:
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={resetUrl}>
              Redefinir Senha
            </Link>
          </Section>
          <Text style={text}>
            Este link expira em: <strong>{expiresAt}</strong>.
          </Text>
          <Text style={subtext}>
            Se você não solicitou a alteração de senha, ignore este e-mail.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
}

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  padding: "0 40px",
}

const subtext = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "left" as const,
  padding: "0 40px",
  marginTop: "16px",
}

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#ef4444",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}
