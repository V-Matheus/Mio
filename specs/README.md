# Specs — Mio

Specs de desenvolvimento da plataforma Mio. Cada pasta concentra uma área do produto com **contexto, status atual, contratos, tarefas pendentes e critérios de aceite**.

A organização é **por feature**, não por sprint — a ordem de execução está descrita no roadmap abaixo.

## Documentação de referência

- [`/README.md`](../README.md) — visão de produto
- [`/ARCHITECTURE.md`](../ARCHITECTURE.md) — visão técnica de alto nível
- [`/apps/api/docs/ARCHITECTURE.md`](../apps/api/docs/ARCHITECTURE.md) — arquitetura backend (microserviços, eventos)
- [`/apps/web/docs/ARCHITECTURE.md`](../apps/web/docs/ARCHITECTURE.md) — arquitetura frontend
- [`/apps/api/CLAUDE.md`](../apps/api/CLAUDE.md) — convenções da API
- [`/apps/web/CLAUDE.md`](../apps/web/CLAUDE.md) — convenções do Web

## Legenda de status

- ✅ Implementado
- ⏳ Parcial / stub
- ❌ Não iniciado

## Índice

| # | Área | Descrição | Status global |
|---|---|---|---|
| [00](./00-foundations/) | Foundations | Monorepo, Docker, CI, observabilidade, GraphQL no gateway, contratos gRPC, RabbitMQ wiring | ⏳ |
| [01](./01-auth/) | Auth & Users | Cadastro, login, recuperação de senha, sessão NextAuth, módulo `users` no Core | ⏳ |
| [02](./02-tracks-lessons/) | Trilhas & Aulas | Catálogo de trilhas, lições e seções (Core) + telas no Web | ⏳ |
| [03](./03-progress/) | Progresso | Marcar seção/aula como concluída, publicar `lesson.completed` | ❌ |
| [04](./04-gamification/) | Gamificação (XP & Ranking) | Consumir `lesson.completed`, calcular XP, manter Sorted Set no Redis, leaderboard | ❌ |
| [05](./05-achievements/) | Conquistas | Consumir eventos, validar regras, publicar `achievement.unlocked` | ❌ |
| [06](./06-messenger-sse/) | Messenger (Real-time) | Túnel SSE para o browser, Redis Pub/Sub inter-instâncias | ❌ |
| [07](./07-notifications/) | Notificações | E-mails transacionais e jobs agendados (BullMQ) | ❌ |
| [08](./08-web-shell/) | Web Shell autenticado | Layout interno, navegação, home dashboard, perfil, streak | ❌ |
| [09](./09-admin-content/) | Admin & Conteúdo | Perfil admin (professor) criando/editando trilhas e aulas via interface; conteúdo salvo no banco | ❌ |

## Roadmap sugerido

O roadmap respeita as dependências entre as features. Cada bloco abaixo é um marco de valor entregável.

### Fase 1 — Fundação (desbloqueia tudo)
- **00-foundations** — GraphQL no gateway, contratos `.proto` por domínio, conexão AMQP nos serviços, logger estruturado.
- **01-auth** (parte backend) — módulo `users` no Core, mutations `register` / `login` / `requestPasswordReset` no gateway, substituir `authService` stub do Web.

### Fase 2 — Conteúdo (MVP de aprendizado)
- **02-tracks-lessons** — Core publica catálogo via gRPC; Web lista trilhas, lições e exibe seção atual.
- **08-web-shell** (parte mínima) — layout autenticado, `/home`, navegação básica para destravar fluxo.

### Fase 3 — Loop de engajamento
- **03-progress** — Server Action de concluir seção/aula → mutation GraphQL → Core publica `lesson.completed`.
- **04-gamification** — primeiro consumidor de evento: XP + ranking funcionais.
- **05-achievements** — segundo consumidor: regras e troféus.

### Fase 4 — Real-time e comunicação
- **06-messenger-sse** — empurra `xp.rewarded` e `achievement.unlocked` para o cliente sem reload.
- **07-notifications** — e-mails de boas-vindas, recuperação de senha, inatividade.

### Fase 5 — Polimento
- **08-web-shell** (completo) — perfil rico, streak, histórico, leaderboard global, certificados.
- **09-admin-content** — role admin + CRUD de trilhas/aulas via interface (conteúdo no banco; desbloqueia autoria sem deploy).
- **00-foundations** (observabilidade completa) — Sentry equivalente, métricas Prometheus, dashboards.

## Como evoluir uma spec

1. Atualize o status (✅/⏳/❌) dos itens da seção **Status atual** quando concluir algo.
2. Marque tarefas no checklist `- [ ]` → `- [x]`.
3. Quando adicionar campos a um contrato (GraphQL/gRPC/evento), atualize a seção **Contratos** antes de codar.
4. Quando uma spec ficar 100% implementada, mova-a para a seção `## Concluídas` deste README e mantenha o arquivo histórico.

## Convenções

- Idioma: **português**.
- Contratos GraphQL em SDL, gRPC em `.proto`, eventos em JSON Schema simplificado.
- Tarefas marcadas com `- [ ]` (pendente) ou `- [x]` (feito).
- Sempre vincular para arquivos de código existentes via caminho relativo (ex.: `apps/api/apps/core/src/...`).
