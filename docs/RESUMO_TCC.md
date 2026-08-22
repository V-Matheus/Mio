# Resumo do TCC — Projeto Mio

**Curso:** Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (TADS)  
**Tema:** Projeto, Implementação e Avaliação de Desempenho de uma Arquitetura de Microsserviços Orientada a Eventos para Sistemas de Alta Concorrência  
**Caso de Estudo:** Plataforma Mio  

---

## 1. Resumo Estruturado (Português)

O avanço de plataformas digitais interativas e gamificadas exige arquiteturas de software capazes de sustentar altos volumes de acessos simultâneos sem comprometer a estabilidade do sistema. Nesse cenário, combinar operações transacionais acadêmicas com o processamento de recompensas e rankings em tempo real impõe severos desafios de consistência e latência sob picos de concorrência. Arquiteturas monolíticas e abordagens convencionais de persistência sofrem com gargalos de I/O no cálculo de classificações, sobrecarga de serialização na rede e riscos de inconsistência por dupla escrita em operações distribuídas. Para solucionar esse problema, foi projetada e implementada a arquitetura da plataforma Mio, baseada em microsserviços desacoplados e orientados a eventos via RabbitMQ com o padrão Transactional Outbox, integrando comunicação interna síncrona em gRPC sobre HTTP/2, um API Gateway GraphQL em NestJS e persistência híbrida com PostgreSQL e Redis Sorted Sets. A avaliação experimental por meio de testes de carga e estresse demonstrou alta vazão de escrita, tempos de resposta sub-milissegundo para rankings globais e resiliência a falhas, validando a escalabilidade da infraestrutura para ambientes de alta concorrência.

**Palavras-chave:** Sistemas Distribuídos; Arquitetura de Microsserviços; Arquitetura Orientada a Eventos; gRPC; Transactional Outbox; Redis Sorted Sets; Testes de Carga; Escalabilidade.

---

### Mapeamento do Formato:

- **Contexto (2 frases):**
  > *"O avanço de plataformas digitais interativas e gamificadas exige arquiteturas de software capazes de sustentar altos volumes de acessos simultâneos sem comprometer a estabilidade do sistema. Nesse cenário, combinar operações transacionais acadêmicas com o processamento de recompensas e rankings em tempo real impõe severos desafios de consistência e latência sob picos de concorrência."*

- **Problema (1 frase):**
  > *"Arquiteturas monolíticas e abordagens convencionais de persistência sofrem com gargalos de I/O no cálculo de classificações, sobrecarga de serialização na rede e riscos de inconsistência por dupla escrita em operações distribuídas."*

- **Solução Implementada (1 frase):**
  > *"Para solucionar esse problema, foi projetada e implementada a arquitetura da plataforma Mio, baseada em microsserviços desacoplados e orientados a eventos via RabbitMQ com o padrão Transactional Outbox, integrando comunicação interna síncrona em gRPC sobre HTTP/2, um API Gateway GraphQL em NestJS e persistência híbrida com PostgreSQL e Redis Sorted Sets."*

- **Resultado (1 frase):**
  > *"A avaliação experimental por meio de testes de carga e estresse demonstrou alta vazão de escrita, tempos de resposta sub-milissegundo para rankings globais e resiliência a falhas, validando a escalabilidade da infraestrutura para ambientes de alta concorrência."*

---

## 2. Abstract (Inglês)

The advancement of interactive and gamified digital platforms requires software architectures capable of sustaining high volumes of concurrent users without compromising system stability. In this scenario, combining strict academic transactional operations with real-time rewards and leaderboard processing poses severe consistency and latency challenges during concurrency spikes. Monolithic architectures and conventional persistence approaches suffer from I/O bottlenecks in ranking calculations, network serialization overhead, and distributed dual-write inconsistencies. To address this problem, the Mio platform architecture was designed and implemented based on decoupled event-driven microservices via RabbitMQ using the Transactional Outbox pattern, combining synchronous internal gRPC over HTTP/2 communication, a NestJS GraphQL API Gateway, and hybrid persistence with PostgreSQL and Redis Sorted Sets. Experimental performance evaluation through load and stress testing demonstrated high write throughput, sub-millisecond global leaderboard response times, and fault resilience, validating the infrastructure's scalability for high-concurrency environments.

**Keywords:** Distributed Systems; Microservices Architecture; Event-Driven Architecture; gRPC; Transactional Outbox; Redis Sorted Sets; Load Testing; Scalability.
