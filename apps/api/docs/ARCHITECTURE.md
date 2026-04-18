# Arquitetura do Backend — Mio

> Visão geral da arquitetura de microserviços da plataforma Mio.

![Diagrama de Arquitetura](./architecture.png)

---

## Visão Geral

A plataforma adota uma **arquitetura orientada a eventos com microserviços desacoplados**. O fluxo principal segue o padrão:

1. O cliente se comunica com o **API Gateway** via HTTPS/GraphQL.
2. O Gateway roteia as requisições para os serviços internos via **gRPC**.
3. Os serviços se comunicam entre si de forma assíncrona através do **RabbitMQ** (AMQP).
4. Atualizações em tempo real chegam ao cliente via **SSE** (Server-Sent Events).

---

## Componentes

### 1. API Gateway (Ponto de Entrada)

| | |
|---|---|
| **Tecnologia** | NestJS |
| **Papel** | Roteamento, autenticação e repasse de requisições |
| **Estado** | Stateless — não mantém estado em memória ou banco |

O Gateway é a "casca" do sistema. Ele **não possui lógica de negócio**, apenas inteligência de roteamento. Recebe as chamadas do front-end (GraphQL/REST), autentica o usuário e repassa a tarefa para o serviço interno correto.

**Conexão interna:** utiliza o protocolo **gRPC** (binário e rápido) para se comunicar com os microserviços.

---

### 2. Serviço de Catálogo e Ensino (Core)

| | |
|---|---|
| **Responsabilidade** | Gerenciar aulas, trilhas e progresso do aluno |
| **Banco de dados** | PostgreSQL (dados relacionais e complexos) |

É o **dono da verdade** sobre o conteúdo e o progresso. Gerencia aulas, trilhas e registra que o aluno "concluiu a aula X".

**Fluxo de saída:** assim que salva a conclusão no banco, faz um **PUB** (publica) do evento `lesson.completed` no RabbitMQ via protocolo AMQP.

> **Mindset:** ele não sabe nada sobre pontos de XP ou badges. Apenas avisa que a aula terminou.

---

### 3. Serviço de Gamificação (Ranking & XP)

| | |
|---|---|
| **Responsabilidade** | Traduzir ações em recompensas (XP, ranking) |
| **Banco de dados** | Híbrido — PostgreSQL (histórico de transações) + Redis Sorted Sets (ranking global em tempo real) |

O motor matemático e de engajamento. Traduz ações do aluno em recompensas.

**Conexão:** dá **SUB** (escuta) no evento `lesson.completed`.

**Fluxo de saída:** após calcular o XP, publica o evento `xp.rewarded`.

---

### 4. Serviço de Conquistas (Achievements)

| | |
|---|---|
| **Responsabilidade** | Validar regras de troféus e medalhas |

O validador de regras de troféus. Analisa se o comportamento do aluno desbloqueia medalhas.

**Conexão:** dá **SUB** em dois eventos:
- `lesson.completed` — para metas de quantidade de aulas.
- `xp.rewarded` — para metas de pontuação.

**Fluxo de saída:** se o aluno bater a meta, publica `achievement.unlocked`.

---

### 5. Serviço de Comunicação e Real-time (Messenger)

| | |
|---|---|
| **Responsabilidade** | Empurrar dados para a tela do aluno em tempo real |
| **Tecnologia de saída** | SSE (Server-Sent Events) — túnel unidirecional constante |
| **Escalabilidade** | Redis Pub/Sub para coordenar múltiplas instâncias |

O único serviço que mantém uma **conexão "viva"** com o usuário. Empurra dados para a tela do aluno sem que ele precise recarregar a página.

**Conexão:** escuta os eventos `xp.rewarded` e `achievement.unlocked` para notificar o front-end na hora.

---

### 6. Serviço de Notificações Externas (Email & Jobs)

| | |
|---|---|
| **Responsabilidade** | Enviar e-mails e agendar tarefas futuras |
| **Fila interna** | Redis (BullMQ) para gerenciar retentativas de envio |

O gestor de overflow e comunicações assíncronas lentas. Envia e-mails e agenda tarefas futuras (ex: "avisar após 3 dias de inatividade").

**Por que separado?** Para que a lentidão de enviar um e-mail não trave a gamificação ou o front-end.

---

## Fluxo de Eventos

```
┌──────────┐   HTTPS/GraphQL   ┌─────────────┐
│  Client  │ ◄───────────────► │ API Gateway  │
└──────────┘                   └──────┬───────┘
      ▲                               │ gRPC
      │ SSE                           ▼
      │                  ┌────────────────────────┐
      │                  │  Serviço de Catálogo    │
      │                  │     e Ensino (Core)     │
      │                  └───────────┬────────────┘
      │                              │ PUB lesson.completed
      │                              ▼
      │                     ┌─────────────────┐
      │                     │    RabbitMQ      │
      │                     │  (Message Broker)│
      │                     └───┬────┬────┬───┘
      │                         │    │    │
      │            SUB          │    │    │  SUB
      │        lesson.completed │    │    │  lesson.completed
      │                         ▼    │    │  xp.rewarded
      │           ┌──────────────┐   │    ▼
      │           │ Gamificação  │   │  ┌──────────────┐
      │           │ (Ranking/XP) │   │  │  Conquistas  │
      │           └──────┬───────┘   │  │(Achievements)│
      │                  │           │  └──────┬───────┘
      │       PUB xp.rewarded       │   PUB achievement.unlocked
      │                  │           │         │
      │                  ▼           ▼         ▼
      │            ┌──────────────────────────────┐
      │            │        RabbitMQ (volta)       │
      │            └──────┬──────────────┬────────┘
      │                   │              │
      │                   ▼              ▼
      │         ┌──────────────┐  ┌─────────────────┐
      │         │  Messenger   │  │  Notificações    │
      └─────────│  (Real-time) │  │  (Email & Jobs)  │
           SSE  └──────────────┘  └─────────────────┘
```

---

## Resumo dos Protocolos

| Conexão | Protocolo | Tipo |
|---|---|---|
| Client → Gateway | HTTPS / GraphQL | Síncrono |
| Gateway → Serviços | gRPC | Síncrono / Rápido |
| Serviço → Message Broker | AMQP (RabbitMQ) | Assíncrono / Seguro |
| Messenger → Client | SSE | Real-time / Unidirecional |
| Inter-instâncias (Messenger) | Redis Pub/Sub | Sinalização interna |

---

## Por que essa estrutura é poderosa?

A arquitetura prioriza **resiliência e desacoplamento**:

- Se o **Serviço de E-mail** cair, o aluno continua ganhando XP e vendo o ranking subir.
- Se o **Serviço de Gamificação** ficar lento por excesso de usuários, o aluno ainda consegue concluir as aulas normalmente no Core, e o XP aparecerá alguns segundos depois (**Consistência Eventual**).

Cada serviço pode ser **escalado, deployado e atualizado independentemente**, sem afetar os demais.
