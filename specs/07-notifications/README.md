# 07 — Notificações

E-mails transacionais (boas-vindas, recuperação de senha, inatividade) e jobs agendados. Isolado para que lentidão de envio nunca trave o resto do sistema.

## Status atual

### Backend (`apps/api/apps/notifications`)
- ✅ App NestJS provisionado com gRPC server + Health.
- ❌ Nenhum integration com SMTP/Resend/SendGrid.
- ❌ Nenhum BullMQ/queue.
- ❌ Nenhum consumer AMQP.
- ❌ Nenhum template engine.

## Escopo

1. Consumer AMQP de eventos que disparam e-mails:
   - `user.registered` → e-mail de boas-vindas.
   - `user.password_reset_requested` → e-mail com link de reset.
   - `achievement.unlocked` → e-mail celebrando (opt-in; batched diariamente?).
2. **Fila BullMQ (Redis)** para retry com backoff exponencial.
3. **Templates** com `react-email` ou `mjml-react` (HTML + texto).
4. Provider de envio configurável via env: começar com **Resend** (DX excelente) ou **SMTP genérico** (Mailpit em dev).
5. **Job agendado** (em fase futura): notificar usuários inativos por 3+ dias.

## Contratos

### Eventos consumidos

| Evento | Ação |
|---|---|
| `user.registered` | Enviar e-mail de boas-vindas para `email` com link para `/home`. |
| `user.password_reset_requested` | Enviar e-mail com link `/redefinir-senha/<token>` (token bruto vem no payload do evento — não persistido fora dele). |
| `achievement.unlocked` | Adicionar a um digest diário para o usuário (não envia 1 e-mail por conquista). |

### Estrutura

```
apps/api/apps/notifications/
└── src/
    ├── modules/
    │   ├── email/
    │   │   ├── email.module.ts
    │   │   ├── email.service.ts        # adapter (Resend, SMTP, Mailpit)
    │   │   └── templates/
    │   │       ├── welcome.tsx
    │   │       ├── password-reset.tsx
    │   │       └── achievement-digest.tsx
    │   ├── queue/
    │   │   ├── queue.module.ts         # BullMQ
    │   │   └── email.processor.ts
    │   └── consumers/
    │       ├── user-registered.consumer.ts
    │       ├── password-reset.consumer.ts
    │       └── achievement-unlocked.consumer.ts
    └── ...
```

### Fila

- Nome: `mio:emails`.
- Job: `{ to, subject, html, text }`.
- Retry: 5 tentativas, backoff exponencial (1s, 5s, 30s, 5min, 30min).

### Variáveis de ambiente

```
EMAIL_PROVIDER=resend|smtp
RESEND_API_KEY=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM="Mio <ola@mio.dev>"
APP_URL=http://localhost:3000
```

## Tarefas

### Notifications service
- [ ] Instalar `bullmq`, `@react-email/components`, `resend` (ou `nodemailer`).
- [ ] `QueueModule.forRoot()` com BullMQ apontando para Redis.
- [ ] `EmailService` com método `send({ to, subject, react })` que renderiza JSX → HTML e enfileira.
- [ ] Templates iniciais: `WelcomeEmail`, `PasswordResetEmail`, `AchievementDigestEmail`.
- [ ] Consumers AMQP para os 3 eventos listados.
- [ ] Processador BullMQ que chama o provider de envio.
- [ ] Logs estruturados (`emailId`, `template`, `to`, `attempts`).
- [ ] Testes: mocka provider e assegura que template renderiza e fila é populada.

### Infra
- [ ] Adicionar **Mailpit** ao `docker-compose.yml` para captura de e-mails em dev (porta 1025 SMTP, 8025 UI).
- [ ] `.env.example` com `EMAIL_PROVIDER=smtp` + Mailpit por padrão.

### Frontend
- [ ] Página `/redefinir-senha/[token]/page.tsx` (já listada em spec 01) — destino do link enviado por e-mail.
- [ ] Banner de "verifique seu e-mail" pós-cadastro (opcional).

## Critérios de aceite

- Cadastrar usuário gera evento `user.registered` → e-mail aparece no Mailpit em ≤ 3s.
- Solicitar reset gera e-mail com link funcional (`http://localhost:3000/redefinir-senha/<token>`).
- Forçar erro do provider faz a fila tentar 5 vezes antes de marcar como `failed`.
- Logs mostram caminho completo (`event received → job enqueued → job processed → email sent`).

## Riscos & decisões em aberto

- **Digest de conquistas**: complexidade extra (precisa de cron + agregação por usuário). Mover para **fase futura**; no MVP, enviar 1 e-mail por conquista é aceitável.
- **Bounce/unsubscribe**: começar sem isso; assim que tivermos volume real, integrar webhook do provider.
- **GDPR/LGPD**: precisamos de `EmailPreference` por usuário (campo `consentMarketing`) antes de qualquer e-mail não-transacional. Boas-vindas e reset são transacionais — OK.
