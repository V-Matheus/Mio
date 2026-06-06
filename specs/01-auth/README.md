# 01 — Auth & Users

Cadastro, login (credenciais + OAuth), recuperação de senha, sessão segura e modelo de `User` no Core. Hoje o frontend já tem fluxo completo de UI/Server Actions, mas todo o backend ainda é stub.

## Status atual

### Frontend (`apps/web`)
- ✅ NextAuth v5 configurado em `apps/web/auth.ts` com providers `Google`, `GitHub`, `Credentials`.
- ✅ Página de login `app/(auth)/login/page.tsx` + `LoginForm` + `LoginSidePanel`.
- ✅ Página de cadastro `app/(auth)/cadastro/page.tsx` + `RegisterForm` + `RegisterSidePanel`.
- ✅ Página de recuperação `app/(auth)/recuperar-senha/page.tsx` + `ForgotPasswordForm` + `ForgotPasswordSidePanel`.
- ✅ `SocialLogin` component reaproveitado pelos 3 fluxos.
- ✅ Server Actions em `app/(auth)/_actions/auth.ts`: `signInWithProvider`, `loginAction`, `registerAction`, `forgotPasswordAction`.
- ✅ Validação com Zod em `lib/auth/schemas.ts` (login, register, forgot password).
- ✅ Proxy (`apps/web/proxy.ts`) redirecionando logado → `/home` e anônimo → `/login`.
- ✅ Tipagem custom `types/next-auth.d.ts`.
- ✅ Testes unitários para forms, actions e schemas (`apps/web/tests/unit/app/(auth)/...`).
- ✅ **Contrato `me(accessToken)` no `authService`** — retorna `MeUser` (`code`, `email`, `name`, `avatarUrl`). Stub hoje, GraphQL `query { me }` no futuro.
- ✅ **Contrato `upsertOAuthUser(input)` no `authService`** — recebe `{ provider, providerAccountId, email, name, avatarUrl }` e devolve `{ accessToken }`. Stub hoje, GraphQL mutation no futuro.
- ✅ **`MOCK_JWT` minimalista**: carrega apenas `sub` + `iat`. Dados do usuário vêm exclusivamente do `me()`.
- ✅ **Fluxo Credentials** (`authorize` em `auth.ts`): `login()` → `me(accessToken)` → devolve `User` com `id`/`name`/`email`/`image`/`accessToken`.
- ✅ **Fluxo OAuth** (`signIn` callback em `auth.ts`): para Google/GitHub chama `upsertOAuthUser` → `me(accessToken)` → muta `user` com `id`/`name`/`email`/`image`/`accessToken`. Outros providers retornam `false`.
- ✅ **Session como fonte canônica para leitura no Web** — decisão explícita: páginas/Server Components leem via `await auth()`, não chamam `me()` direto. `me()` só roda em momentos pontuais (login + refresh).
- ✅ **Refresh sob demanda** no callback `jwt`: ramo `trigger === "update"` rebusca `me()` e regrava `token.name`/`email`/`picture`. Acionado pelo client com `useSession().update()` após mutações que mudam o usuário.
- ✅ **`image` propagado** no JWT (`token.picture`) e na session (`session.user.image`).
- ✅ `lib/auth/service.ts` **integrado ao Gateway via GraphQL** (`graphql-request`): `login`/`register`/`requestPasswordReset`/`me`/`upsertOAuthUser` chamam o Gateway. Client server-side em `lib/gateway/client.ts` (`getGatewayClient(accessToken)` + `gatewayError`), endpoint via `GATEWAY_GRAPHQL_URL`. Domínio organizado em `lib/auth/{graphql,schemas,types}/` (1 arquivo por operação + barrel).
- ❌ Página `/home` referenciada pelo `redirectTo` não existe.
- ❌ Página de redefinição de senha (`/redefinir-senha/[token]`) não existe.

### Backend (`apps/api`)
- ✅ Schema Prisma do Core já possui `User` (`apps/api/apps/core/prisma/schema.prisma`).
- ❌ Nenhum módulo `users` ou `auth` no Core.
- ❌ Nenhuma mutation/query GraphQL no Gateway.
- ❌ Nenhum `.proto` para Users.
- ❌ Nenhuma estratégia de hash de senha (`argon2` ou `bcrypt`).
- ❌ Nenhuma emissão de JWT real.
- ❌ Token de password reset não persistido.

## Escopo

1. Criar módulo `users` no Core: CRUD básico, hash de senha, busca por email/code, validação de credenciais.
2. Criar módulo `auth` no Gateway com mutations GraphQL: `register`, `login`, `requestPasswordReset`, `resetPassword`.
3. Definir `.proto` `users` para comunicação Gateway ↔ Core.
4. Substituir `authService` stub no Web por chamadas reais ao Gateway via GraphQL.
5. Suportar **OAuth** (Google/GitHub): callback do NextAuth deve criar/recuperar `User` no Core (`signIn` callback ou Server Action dedicado).
6. Publicar eventos `user.registered` e `user.password_reset_requested` no RabbitMQ.

## Contratos

### Prisma (extensão do `User` existente)

```prisma
// apps/api/apps/core/prisma/schema.prisma
enum AuthProvider {
  CREDENTIALS
  GOOGLE
  GITHUB
}

model User {
  id        BigInt   @id @default(autoincrement())
  code      String   @unique          // identificador público estável (nanoid)
  email     String   @unique
  name      String
  avatarUrl String?
  passwordHash String?                // null para usuários OAuth puros
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  identities       UserIdentity[]
  passwordResets   PasswordReset[]
  enrollments      Enrollment[]
  progress         LessonProgress[]
}

model UserIdentity {
  id                BigInt       @id @default(autoincrement())
  userId            BigInt
  provider          AuthProvider
  providerAccountId String
  createdAt         DateTime     @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model PasswordReset {
  id        BigInt    @id @default(autoincrement())
  userId    BigInt
  tokenHash String    @unique  // hash do token enviado por email
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### gRPC (`apps/api/proto/users.proto`)

```proto
syntax = "proto3";
package mio.users.v1;

service UsersService {
  rpc Register(RegisterRequest) returns (UserResponse);
  rpc ValidateCredentials(ValidateCredentialsRequest) returns (UserResponse);
  rpc FindByEmail(FindByEmailRequest) returns (UserResponse);
  rpc UpsertOAuthUser(UpsertOAuthRequest) returns (UserResponse);
  rpc IssuePasswordReset(IssuePasswordResetRequest) returns (PasswordResetTokenResponse);
  rpc ConsumePasswordReset(ConsumePasswordResetRequest) returns (UserResponse);
}

message RegisterRequest {
  string email = 1;
  string name = 2;
  string password = 3;
}

message ValidateCredentialsRequest {
  string email = 1;
  string password = 2;
}

message UpsertOAuthRequest {
  string provider = 1;            // "google" | "github"
  string provider_account_id = 2;
  string email = 3;
  string name = 4;
  string avatar_url = 5;
}

message FindByEmailRequest { string email = 1; }

message IssuePasswordResetRequest { string email = 1; }
message ConsumePasswordResetRequest { string token = 1; string new_password = 2; }

message UserResponse {
  string code = 1;
  string email = 2;
  string name = 3;
  string avatar_url = 4;
}

message PasswordResetTokenResponse {
  string token = 1;          // token bruto (apenas em retorno; persistido como hash)
  string expires_at = 2;
}
```

### GraphQL (gateway)

```graphql
type User {
  code: ID!
  email: String!
  name: String!
  avatarUrl: String
}

type AuthPayload {
  accessToken: String!
  user: User!
}

input RegisterInput {
  email: String!
  name: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

input UpsertOAuthInput {
  provider: String!            # "google" | "github"
  providerAccountId: String!
  email: String!
  name: String!
  avatarUrl: String
}

type Mutation {
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  upsertOAuthUser(input: UpsertOAuthInput!): AuthPayload!
  requestPasswordReset(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!
}

type Query {
  me: User
}
```

### JWT

- Algoritmo: `HS256` (sufficient para começo; trocar por RS256 quando houver chaves rotativas).
- Claims: **apenas `sub` = `user.code` + `iat` + `exp` (1h) + `iss` = `mio-gateway`**. Não carregar `email`/`name` para evitar redundância — dados do usuário sempre via `query { me }`.
- Refresh do **acesso ao Gateway**: ainda **fora de escopo** desta spec. Sessão NextAuth de 24h cuida do prazo curto.
- Refresh dos **dados do usuário na session NextAuth**: cliente chama `useSession().update()` após mutações; o callback `jwt` rebusca `me()` (já implementado).

### Sessão (frontend)

- **Fonte canônica de leitura**: `session` (cookie NextAuth) — `await auth()` em Server Components, `useSession()` em Client Components.
- **Quando chamar `me()`**: apenas em transições de identidade (login Credentials, login OAuth) e em refresh sob demanda. Nunca para renderizar componentes regulares — usa-se `session.user`.
- **JWT NextAuth** carrega `accessToken` (= JWT do Gateway), `id` (= `user.code`), `name`, `email`, `picture`.
- **Para chamar o Gateway**: `await auth()` → `session.accessToken` → `Authorization: Bearer <token>`.

## Tarefas

### Core (`apps/api/apps/core`)
- [ ] Criar migration para `UserIdentity` e `PasswordReset` (estender `User` com `passwordHash`).
- [ ] Criar `modules/users/users.module.ts`, `users.service.ts`, `users.controller.ts` (gRPC).
- [ ] Hash de senha com `argon2id` (`argon2` package).
- [ ] Geração de `User.code` com `nanoid(12)`.
- [ ] Gerar token de password reset (URL-safe random + hash do token).
- [ ] Após `Register` e `IssuePasswordReset`, publicar evento via `EventBus` (ver `00-foundations`).
- [ ] Testes unitários (`users.service.test.ts`) e e2e (cobrindo migration + serviço).

### Gateway (`apps/api/apps/gateway`)
- [ ] Configurar GraphQL (depende de `00-foundations`).
- [ ] `modules/auth/auth.module.ts`, `auth.resolver.ts`, `auth.service.ts`.
- [ ] `ClientGrpc` para o pacote `mio.users.v1`.
- [ ] Emitir JWT após `register` / `login`.
- [ ] Guard `GqlAuthGuard` que decodifica JWT e popula `context.userCode`.
- [ ] Resolver `me` consultando Core via gRPC.
- [ ] Tratamento de erros: mapear `INVALID_CREDENTIALS`, `EMAIL_IN_USE`, `PASSWORD_RESET_EXPIRED` em `GraphQLError` com `extensions.code`.
- [x] Mutation `upsertOAuthUser(input: UpsertOAuthInput!): AuthPayload!` — exige o fluxo OAuth do Web (o client gRPC já tinha `upsertOAuthUser`, faltava expor no GraphQL).

### Web (`apps/web`)
- [x] Definir contrato `me(accessToken): MeResult` no `authService` (stub) — `lib/auth/service.ts`.
- [x] Definir contrato `upsertOAuthUser(input): UpsertOAuthResult` no `authService` (stub) — `lib/auth/service.ts`.
- [x] Simplificar `MOCK_JWT` para carregar apenas `sub` + `iat`.
- [x] Fluxo Credentials: `authorize()` chama `login` + `me` e devolve `User` com `id`/`name`/`email`/`image`/`accessToken`.
- [x] Fluxo OAuth (Google/GitHub): `signIn` callback chama `upsertOAuthUser` + `me` e muta `user` antes de aceitar a sessão.
- [x] Callback `jwt` propaga `picture` (image) além de `accessToken`/`id`/`name`/`email`.
- [x] Callback `session` expõe `image` em `session.user`.
- [x] Branch `trigger === "update"` no `jwt` callback que rebusca `me()` e atualiza o token.
- [x] Testes unitários para `me` e `upsertOAuthUser` em `tests/unit/lib/auth/service.test.ts`.
- [x] Substituir corpo dos métodos do `authService` (`login`, `register`, `requestPasswordReset`, `me`, `upsertOAuthUser`) por chamadas GraphQL ao Gateway via `graphql-request`. Forma dos retornos não muda.
- [x] Usar `accessToken` da session nos headers do GraphQL client server-side (`getGatewayClient(accessToken)` em `lib/gateway/client.ts`).
- [ ] Criar tela básica `/home` (stub) para o `redirectTo` ter destino válido (overlap com spec 08).
- [ ] Página de reset de senha `app/(auth)/redefinir-senha/[token]/page.tsx` (faltava — apenas `recuperar-senha` existe).
- [x] Atualizar testes que mockam `authService` para o novo client GraphQL.

## Critérios de aceite

- Cadastrar via formulário cria registro em `User` + `UserIdentity(CREDENTIALS)` e envia evento `user.registered`.
- Login com credenciais retorna JWT válido por 1h, decodificável no gateway.
- Login com Google/GitHub cria automaticamente `User` (se novo) e `UserIdentity` correspondente, sem duplicar `email`.
- Solicitar reset envia evento `user.password_reset_requested` com token; usar o token em `/redefinir-senha/[token]` atualiza `passwordHash` e invalida o token.
- Acessar `/home` sem cookie redireciona para `/login`; com cookie válido, mostra a página.

## Decisões de implementação (1ª iteração do backend)

- **Contratos gRPC no pacote `@mio/grpc-contracts`** (`packages/grpc-contracts`), não em `apps/api/proto/` nem co-localizados no módulo: cada domínio tem `src/<domínio>/<x>.proto` + `<x>.contract.ts` (`{ package, service, clientToken, protoPath: join(__dirname, …) }`). Servidor (core) e cliente (gateway) importam o **mesmo** descritor (fonte única). Resolvido via node_modules (workspace) em dev e prod. Cada app agrega em `src/grpc/registry.ts`. **Nada de arquivos soltos.** (Tentamos co-localizar dentro do módulo, mas o build tsc-sem-webpack do gateway não alcançava o proto do core — daí o pacote.) Build do pacote: `tsc + copy-protos.mjs`; `incremental:false`; turbo `check-types` passou a depender de `^build`; GraphQL exigiu `@as-integrations/express5`.
- **Eventos pertencem ao módulo**: os eventos `user.*` vivem em `apps/core/src/modules/users/events/` (publisher AMQP self-contained), não num módulo `events` no topo. Quando a spec 00 criar o `EventBusModule` compartilhado, o publisher passa a delegar nele.
- **`health.proto` migrado para `@mio/grpc-contracts`** (`src/health/`, `healthContract`): `apps/api/proto/` deixou de existir. Os 5 microsserviços servem e o gateway consome via o contrato compartilhado. `clientToken` é opcional no `GrpcContract` (health serve vários alvos sem token único).
- **`FindByCode` adicionado ao `UsersService`**: o JWT carrega `sub = user.code` e o resolver `me` resolve o usuário por `code` (a spec só previa `FindByEmail`).
- **Hash com `@node-rs/argon2`** (argon2id) em vez do pacote `argon2`: binários pré-compilados, sem toolchain nativa na imagem Alpine.
- **Variáveis de ambiente novas** — API (`apps/api/.env`/`.env.example`): `JWT_SECRET`, `JWT_ISSUER` (default `mio-gateway`), `JWT_EXPIRES_IN` (default `1h`), `RABBITMQ_URL` (ex.: `amqp://rabbitmq:5672`), `INTERNAL_API_SECRET` (segredo server-to-server). Web (`apps/web/.env`/`.env.example`): `GATEWAY_GRAPHQL_URL` (default `http://localhost:3333/graphql`) — endpoint do Gateway usado pelo `getGatewayClient`; `INTERNAL_API_SECRET` (mesmo valor da API). Em dev, `csrfPrevention` do Apollo fica **desligado** (`csrfPrevention: isProduction`) — o segredo interno é a barreira; em prod fica ligado.
- **Gateway só aceita tráfego server-to-server**: guard global `InternalSecretGuard` exige header `x-internal-secret` == `INTERNAL_API_SECRET` em **toda** operação GraphQL (contextos REST como health passam direto). O `getGatewayClient` (web, server-only) envia o header automaticamente; o browser nunca recebe o segredo. Ferramentas de teste (Postman/Sandbox) precisam enviar o header manualmente. Isso fecha o buraco de `upsertOAuthUser` ser um oráculo de tokens — agora só o front confiável alcança o Gateway.

## Riscos & decisões em aberto

- **Conflito de email entre provedores**: usuário cadastrado por credenciais que depois loga com Google de mesmo email. Política inicial: **vincular automaticamente** (cria `UserIdentity` ligado ao `User` existente). Avaliar fluxo de confirmação posterior.
- **Proto cross-app em produção**: ✅ resolvido pelo pacote `@mio/grpc-contracts` — o `.proto` é copiado pro `dist` do pacote e resolvido via `node_modules` (symlink do workspace) tanto em dev quanto em prod, sem `tsconfig-paths`.
- **Refresh token**: fora do MVP. Sessão NextAuth (cookie) cuida do prazo curto; expiração do JWT força re-login após 1h. Aceitável até termos endpoint dedicado.
- **Rate limiting** de `requestPasswordReset` e `login`: tratar no gateway via `@nestjs/throttler` antes de ir pra produção.

## Threat model & hardening futuro

O `InternalSecretGuard` (header `x-internal-secret`) fecha **acesso direto ao Gateway** (incl. o oráculo de tokens do `upsertOAuthUser`) e, de quebra, neutraliza CSRF no endpoint GraphQL (header custom exige CORS preflight). **Não é bala de prata** — vetores que permanecem ou surgem, em ordem de risco, para endereçar em iterações futuras:

1. **Next.js vira a "joia da coroa"** 🔴 — o `web` detém o `INTERNAL_API_SECRET` e portanto pode forjar identidade de qualquer usuário (via `upsertOAuthUser`). Comprometer o `web` (SSRF/RCE/dep vuln, ou Server Action que deixe o usuário controlar params do `upsertOAuthUser`) = bypass total. Mitigação: disciplina no que chama `upsertOAuthUser` (hoje só o callback `signIn`, com dados de provider verificado — manter), deps atualizadas, secret em secret manager.
2. **Vazamento/gestão do segredo** 🔴 — `INTERNAL_API_SECRET` é estático, compartilhado e sem expiração; um vazamento (log, erro, `git`, `docker inspect`, CI) reabre o oráculo. Mitigação: nunca logar; garantir que não seja `NEXT_PUBLIC_*`; rotação periódica; secret manager.
3. **Ataques "público via front" continuam** 🟠 — o segredo bloqueia acesso direto, mas o público ainda alcança `login`/`register`/`forgot-password` **através** do `web` (que repassa com o secret): brute force de senha, enumeração de usuários (`EMAIL_IN_USE`), flood de password reset. → resolver com `@nestjs/throttler` (ver acima), por IP/email.
4. **JWT** 🟠 — HS256 com `JWT_SECRET` compartilhado: se vazar, forja token de qualquer `sub` (= `user.code`, público). Sem revogação (janela de 1h; logout **não** invalida o `accessToken` do Gateway, só o cookie NextAuth). O `GqlAuthGuard` faz `jwt.verify` **sem** fixar `algorithms`/`issuer` — pinar `{ algorithms: ['HS256'], issuer: 'mio-gateway' }`.
5. **`upsertOAuthUser` confia cegamente no input + account linking por email** 🟠 — pre-account-takeover (criar conta credenciais com email da vítima antes do OAuth dela), email não-verificado pelo provider. Mitigação: só vincular se o provider marca email como verificado; avaliar fluxo de confirmação (ver "Conflito de email" acima).
6. **Rede/transporte** 🟡 — tráfego `web ↔ gateway` em HTTP puro expõe secret + JWT a sniffing interno; usar TLS/mTLS (mTLS substituiria o secret por identidade de cert). **Não expor a porta `3333` publicamente** em prod (hoje o compose mapeia pro host só em dev) — só o `web` deve alcançar o gateway (segmentação de rede).
7. **Comparação não constant-time** 🟡 — `InternalSecretGuard` usa `!==`; idem o compare de `tokenHash` no password reset. Usar `crypto.timingSafeEqual`.
8. **`csrfPrevention` desligado em dev** 🟢 — redundante dado o header custom, mas garantir `NODE_ENV=production` real em prod.

**Quick wins de baixo custo** (itens 7, 4, 3): `crypto.timingSafeEqual` no guard; pinar `algorithms`/`issuer` no `jwt.verify`; `@nestjs/throttler` nas mutations sensíveis.
