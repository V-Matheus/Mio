# 06 — Messenger (Real-time / SSE)

Túnel unidirecional servidor → browser para empurrar XP, conquistas e outros eventos sem reload. Único serviço backend que mantém conexão "viva" com o cliente.

## Status atual

### Backend (`apps/api/apps/messenger`)
- ✅ App NestJS provisionado, com gRPC server e Health.
- ❌ Nenhum endpoint HTTP/SSE.
- ❌ Nenhum consumer AMQP.
- ❌ Nenhuma integração com Redis Pub/Sub.
- ❌ Nenhuma autenticação na conexão SSE.

### Gateway
- ❌ Nenhum proxy/expose do Messenger para o browser.
- ❌ Nenhuma rota `/events` ou `/sse`.

### Frontend (`apps/web`)
- ❌ Nenhum hook `useRealtime()` ou wrapper de `EventSource`.

## Escopo

1. Endpoint HTTP **SSE** no Messenger (`GET /sse`) que abre conexão `text/event-stream` por usuário autenticado.
2. **Autenticação**: cookie/JWT da sessão do gateway propagado para o Messenger. Endpoint público no domínio do gateway, mas roteado para o Messenger (ou subdomínio próprio com CORS).
3. Consumer AMQP de `xp.rewarded` e `achievement.unlocked` que publica no Redis Pub/Sub `mio:user:<userCode>`.
4. Cada instância de Messenger assina o Redis Pub/Sub do `userCode` apenas para usuários conectados naquela instância (filtragem em memória).
5. Frontend abre `EventSource` ao logar; reabre com backoff em queda.

## Arquitetura

```
RabbitMQ ──► Messenger (AMQP consumer) ──► Redis Pub/Sub ──► Messenger ──SSE──► Browser
                                              (mio:user:<code>)        (instância correta)
```

Por que Redis Pub/Sub no meio? Múltiplas instâncias de Messenger não sabem em qual delas o usuário está conectado. AMQP entrega o evento em **uma** instância; ela publica no Redis com `userCode`; **todas** recebem; só a instância onde o usuário está conectado encaminha.

## Contratos

### Endpoint SSE

`GET /sse` (no domínio do gateway; reverse-proxy para Messenger):

- Header `Authorization: Bearer <jwt>` **ou** cookie de sessão.
- Resposta `Content-Type: text/event-stream`.
- Cada mensagem:
  ```
  id: <ulid>
  event: <type>
  data: <json>

  ```
- Tipos (payload real publicado pela Gamification/Achievements — ver `@mio/events` `domain-event.ts`, atualizado na entrega da spec 05):
  - `xp.rewarded` → `{ userCode, amount, reason, sourceId?, totalAfter, level, streakCurrent, awardedAt }`
  - `achievement.unlocked` → `{ userCode, achievementSlug, title, iconUrl, unlockedAt, xpReward }`
  - `ping` → `{ ts }` a cada 25s (heartbeat).

### Redis Pub/Sub

- Canal: `mio:user:<userCode>`.
- Mensagem: JSON `{ type, payload, ts }`.

### Cliente

```ts
// apps/web/lib/realtime/client.ts
export type RealtimeEvent =
  | { type: "xp.rewarded"; payload: { amount: number; totalAfter: number; level: string; reason: string; streakCurrent: number } }
  | { type: "achievement.unlocked"; payload: { achievementSlug: string; title: string; iconUrl: string | null; xpReward: number } }
  | { type: "ping"; payload: { ts: number } }
```

## Tarefas

### Messenger service
- [ ] Trocar bootstrap atual (gRPC microservice) para **híbrido** (HTTP + gRPC) usando `app.connectMicroservice` + `app.listen`.
- [ ] Endpoint `GET /sse` em `modules/sse/sse.controller.ts`:
  - Guard que valida JWT (mesmo segredo do gateway).
  - Mantém `Map<userCode, Set<Response>>` em memória.
  - Escreve `ping` a cada 25s.
- [ ] Consumer AMQP de `xp.rewarded` e `achievement.unlocked` → publica em `mio:user:<userCode>` no Redis.
- [ ] Subscriber Redis Pub/Sub que distribui para `Response`s locais correspondentes ao `userCode`.
- [ ] Cleanup de conexões mortas (timeout + `req.on("close")`).
- [ ] Testes: simular AMQP message → asserir entrega via stream HTTP.

### Gateway
- [ ] Proxy reverso `/sse` → Messenger (`apps/gateway/src/modules/sse/sse.proxy.ts` ou usar Nginx em produção e bypass em dev).
- [ ] Garantir que cookie/JWT seja repassado.

### Web
- [ ] `lib/realtime/client.ts` exportando `connectRealtime(userCode, onEvent)`.
- [ ] Provider client-side `RealtimeProvider` (`app/components/realtime/realtime-provider.tsx`) montado dentro do layout autenticado.
- [ ] Hook `useRealtime(handlers)` registrando handlers por tipo.
- [ ] Toast/animação quando recebe `xp.rewarded` (badge animado no header) e `achievement.unlocked` (modal/celebration).
- [ ] Reconexão com backoff exponencial (1s → 2s → 4s → 8s → cap 30s).

## Critérios de aceite

- Cliente logado abre `EventSource` para `/sse` e recebe `ping` a cada 25s.
- Concluir uma lição (spec 03) faz aparecer notificação de XP na UI em ≤ 3s **sem reload**.
- Conquista desbloqueada (spec 05) aparece com modal/animação na UI em ≤ 3s.
- Fechar a conexão e reabrir: backoff funciona, eventos perdidos durante a queda **não são** redespachados (aceitável — não temos buffering).
- Múltiplas instâncias do Messenger conseguem ser escaladas horizontalmente sem perder eventos para usuários conectados.

## Riscos & decisões em aberto

- **Eventos perdidos durante reconexão**: aceito no MVP. Compensa-se com `revalidatePath` ao retornar da Server Action que disparou a ação.
- **Compatibilidade SSE em browsers**: universal; sem necessidade de fallback. WebSocket fica reservado para quando precisarmos bidirecional.
- **Quota de conexões**: cada instância suporta ~10k conexões SSE; com Redis Pub/Sub o "fan-out" entre instâncias é barato (mensagem é leve). Monitorar.
- **Autenticação**: opção mais simples é JWT em query string (`/sse?token=...`) porque `EventSource` não suporta headers customizados. Em produção, idealmente cookies HTTP-only + same-site. Decidir antes da implementação.
