# Arquitetura de Gamificação e Ranking em Tempo Real no Mio

No desenvolvimento do Mio, uma plataforma de aprendizado por trilhas, implementei o microsserviço de Gamificação, responsável pela concessão de XP, cálculo de níveis e manutenção do ranking global dos alunos em tempo real.

O principal desafio desse tipo de funcionalidade em bancos relacionais (PostgreSQL) está no custo computacional de ordenação e cálculo de posição individual. Executar queries como `ORDER BY total_xp DESC` e `SELECT COUNT(*) + 1 WHERE total_xp > meu_xp` para milhares de usuários ativos satura CPU, locks e I/O de disco.

Para resolver o problema sem sobrecarregar o banco principal e garantindo respostas em menos de 1ms, estruturei o seguinte fluxo de dados:

```
[ Acao: Conclusao de Aula ]
            │
            ▼
[ Core Service (PostgreSQL) ]
            │
            ▼ (Transactional Outbox)
   [ RabbitMQ (AMQP: mio.events) ]
            │ (Fila: gamification.lesson.completed)
            ▼
[ Gamification Service (AMQP Consumer) ]
      │                               │
      ▼                               ▼
[ PostgreSQL (Gamification) ]     [ Redis Sorted Set (ZSET) ]
(UserXp, XpTransaction, XpRule)   (mio:xp:global - Ranking O(log N))
      │
      ▼ (Enriquecimento em lote via gRPC)
[ Core Service (BatchGetUsers) ]
      │
      ▼
[ GraphQL Gateway -> Web Application ]
```

A solucao se apoia em tres pilares:

1. Processamento Assíncrono com Idempotência Estrita
A conclusão de aulas no serviço Core emite eventos `lesson.completed` via RabbitMQ utilizando o Transactional Outbox Pattern. O consumidor de Gamificação processa a mensagem garantindo idempotência através de uma constraint única `(userCode, sourceId)` no PostgreSQL, impedindo duplicidade de pontos em caso de reentregas na rede.

2. Computação em Tempo Real com Redis Sorted Sets (ZSET)
Em vez de usar o Redis como cache passivo de chave-valor com TTL, ele atua como o motor ativo de cálculo do ranking:
- `ZADD mio:xp:global GT <score> <userCode>`: Atualiza a pontuação na árvore interna em O(log N) apenas se o novo score for maior.
- `ZREVRANK mio:xp:global <userCode>`: Retorna a posição exata do aluno (1º ao último colocado) em O(log N) em microssegundos, sem escanear tabelas SQL.
- `ZREVRANGE mio:xp:global 0 49 WITHSCORES`: Entrega a fatia do ranking paginado já ordenada.

3. Isolamento de Domínios via gRPC em Lote (Zero N+1)
O serviço de Gamificação armazena apenas o identificador (`userCode`) e a pontuação. Nomes e fotos pertencem exclusivamente ao serviço Core. Para montar a listagem final, o Gamification faz uma chamada gRPC em lote (`BatchGetUsers`) para o Core, que resolve os dados cadastrais em uma única query indexada, respeitando os limites dos microsserviços sem gerar o gargalo de consultas N+1.

O PostgreSQL permanece como a fonte da verdade permanente para auditoria e histórico de transações, enquanto o Redis absorve 100% da carga de computação e leitura em tempo real.

---

#BackendEngineering #SystemDesign #SoftwareArchitecture #Microservices #Redis #RabbitMQ #PostgreSQL #gRPC #NestJS #NodeJS #EventDrivenArchitecture #HighPerformance
