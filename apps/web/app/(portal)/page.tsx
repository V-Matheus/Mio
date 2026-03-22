import { Icon } from "@iconify/react"
import Image from "next/image"
import { ButtonText, ButtonWrapper } from "../components/button"

const levels = [
  {
    title: "Leigo",
    description: "Toda grande jornada começa com uma aventura. Comece aqui!",
    icon: "mdi:seed-outline",
  },
  {
    title: "Iniciante",
    description: "Cada linha de código é uma nova ideia. Vem comigo!",
    icon: "mdi:sprout-outline",
  },
  {
    title: "Júnior",
    description: "Você está construindo o futuro, um código de cada vez.",
    icon: "mdi:leaf",
  },
  {
    title: "Pleno",
    description: "Continue construindo! O caminho está longo até aqui.",
    icon: "mdi:tree-outline",
  },
  {
    title: "Sênior",
    description: "Agora você é o mago. Inspire outros!",
    icon: "mdi:star-outline",
  },
  {
    title: "Especialista",
    description: "Para a infinito e além! O que vamos criar agora?",
    icon: "mdi:trophy-outline",
  },
]

const steps = [
  {
    number: "1",
    title: "Escolha seu nível",
    description:
      "Comece de onde você está. Temos conteúdos para todos os níveis de conhecimento.",
  },
  {
    number: "2",
    title: "Aprenda fazendo",
    description:
      "Pratique com exercícios interativos e projetos reais enquanto aprende.",
  },
  {
    number: "3",
    title: "Evolua constantemente",
    description:
      "Acompanhe seu progresso e avance para o próximo nível no seu ritmo.",
  },
]

const technologies = [
  { name: "JavaScript", icon: "devicon:javascript" },
  { name: "Python", icon: "devicon:python" },
  { name: "React", icon: "devicon:react" },
  { name: "Node.js", icon: "devicon:nodejs" },
  { name: "HTML/CSS", icon: "devicon:html5" },
  { name: "TypeScript", icon: "devicon:typescript" },
  { name: "Git", icon: "devicon:git" },
  { name: "SQL", icon: "devicon:postgresql" },
]

const benefits = [
  { text: "Aprenda no seu próprio ritmo", icon: "mdi:clock-outline" },
  { text: "Conteúdo atualizado constantemente", icon: "mdi:update" },
  { text: "Exercícios práticos e projetos reais", icon: "mdi:code-braces" },
  { text: "Comunidade ativa de estudantes", icon: "mdi:account-group-outline" },
  { text: "Certificados de conclusão", icon: "mdi:certificate-outline" },
  { text: "Suporte de mentores experientes", icon: "mdi:account-star-outline" },
]

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-28 text-center px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Image
              src="/mio-ok.png"
              alt="Mio mascote"
              width={400}
              height={360}
            />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Olá, eu sou <span className="text-primary">Mio!</span>
          </h1>
          <p className="text-foreground/60 text-lg mb-8 max-w-xl mx-auto">
            Pronto para começar sua aventura no mundo da tecnologia? Estou aqui
            para te guiar. Vamos aprender e crescer juntos!
          </p>
          <ButtonWrapper>
            <ButtonText>Começa minha jornada →</ButtonText>
          </ButtonWrapper>
        </div>
      </section>

      {/* Journey Levels Section */}
      <section className="py-16 px-6" id="niveis">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
            Sua jornada começa agora
          </h2>
          <p className="text-center text-foreground/60 mb-12 max-w-lg mx-auto">
            Escolha seu nível e comece a aprender no seu ritmo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <div
                key={level.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon
                    icon={level.icon}
                    width={24}
                    height={24}
                    className="text-primary"
                  />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {level.title}
                </h3>
                <p className="text-sm text-foreground/60">
                  {level.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <ButtonWrapper>
              <ButtonText>Começa agora</ButtonText>
            </ButtonWrapper>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-6 bg-white" id="como-funciona">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
            Como funciona?
          </h2>
          <p className="text-center text-foreground/60 mb-12 max-w-lg mx-auto">
            Aprenda programação de forma simples e divertida
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary text-white font-display font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-foreground/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="py-16 px-6" id="tecnologias">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
            Tecnologias que você vai dominar
          </h2>
          <p className="text-center text-foreground/60 mb-12 max-w-lg mx-auto">
            Aprenda as linguagens e ferramentas mais usadas no mercado
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {technologies.map((tech) => (
              <span
                key={tech.name}
                className="bg-white border border-gray-200 rounded-full px-6 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:shadow-sm transition-all cursor-default inline-flex items-center gap-2"
              >
                <Icon icon={tech.icon} width={20} height={20} />
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-white" id="beneficios">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Por que escolher o Mio?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon
                    icon={benefit.icon}
                    width={20}
                    height={20}
                    className="text-primary"
                  />
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-white/80 mb-8">
            Junte-se a milhares de estudantes que já estão aprendendo com o Mio
          </p>
          <ButtonWrapper variant="outline">
            <ButtonText>Criar conta gratuita</ButtonText>
          </ButtonWrapper>
        </div>
      </section>
    </>
  )
}
