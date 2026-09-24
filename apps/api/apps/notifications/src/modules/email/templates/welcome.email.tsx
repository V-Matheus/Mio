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

type WelcomeEmailProps = {
  name: string
  appUrl: string
}

export function WelcomeEmail({ name, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bem-vindo ao Mio!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Olá, {name}!</Heading>
          <Text style={text}>
            Seja muito bem-vindo ao Mio. Sua conta foi criada com sucesso!
          </Text>
          <Section style={btnContainer}>
            <Link style={button} href={`${appUrl}/home`}>
              Acessar a Plataforma
            </Link>
          </Section>
          <Text style={text}>
            Se você tiver qualquer dúvida, basta responder a este e-mail.
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

const btnContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
}

const button = {
  backgroundColor: "#6366f1",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
}
