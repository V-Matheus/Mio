import { SectionKind } from ".prisma/core"
import type { TrackEntry } from "./seed-content"

/**
 * Fixtures de desenvolvimento/demonstração do catálogo. São dados, não arquivos:
 * o conteúdo (markdown) vive em `Section.contentMarkdown` no Postgres. Em
 * produção, trilhas e aulas serão criadas pela interface de admin (spec 09).
 */
export const catalogFixtures: TrackEntry[] = [
  {
    slug: "front-end",
    title: "Fundamentos de Front-end",
    description:
      "HTML e CSS do zero: a base para construir qualquer interface web.",
    lessons: [
      {
        slug: "intro-html",
        title: "Introdução ao HTML",
        position: 1,
        sections: [
          {
            slug: "o-que-e-html",
            title: "O que é HTML",
            position: 1,
            kind: SectionKind.TEXT,
            contentMarkdown: `# O que é HTML

HTML (**H**yper**T**ext **M**arkup **L**anguage) é a linguagem de marcação que estrutura todo o conteúdo da web. Não é uma linguagem de programação: ela não tem lógica, condições ou loops — ela **descreve** o que cada pedaço da página é.

## Como o navegador enxerga uma página

Quando você abre um site, o navegador baixa um documento HTML e o transforma numa árvore de elementos (o DOM). Cada elemento diz o que aquele trecho significa:

\`\`\`html
<!doctype html>
<html lang="pt-BR">
  <head>
    <title>Minha primeira página</title>
  </head>
  <body>
    <h1>Olá, mundo!</h1>
    <p>Esta é a minha primeira página.</p>
  </body>
</html>
\`\`\`

- \`<head>\` guarda metadados: título da aba, encoding, links para CSS.
- \`<body>\` guarda o que aparece na tela.
- \`<h1>\` é o título principal; \`<p>\` é um parágrafo.

## Por que semântica importa

Usar a tag certa para cada coisa não é frescura: leitores de tela, mecanismos de busca e o próprio navegador dependem dessa estrutura para entender a página. Um \`<button>\` de verdade é focável pelo teclado; uma \`<div>\` fingindo ser botão, não.

Na próxima seção você conhece as tags mais usadas no dia a dia.
`,
          },
          {
            slug: "tags-basicas",
            title: "Tags básicas",
            position: 2,
            kind: SectionKind.TEXT,
            contentMarkdown: `# Tags básicas

Um punhado de tags resolve a maior parte das páginas. Vamos às essenciais.

## Textos

\`\`\`html
<h1>Título principal — um por página</h1>
<h2>Subtítulo</h2>
<p>Parágrafo de texto corrido.</p>
<strong>importante</strong> e <em>ênfase</em>
\`\`\`

Os headings vão de \`<h1>\` a \`<h6>\` e formam o esqueleto do documento — não pule níveis só pelo tamanho da fonte.

## Listas

\`\`\`html
<ul>
  <li>Item sem ordem</li>
  <li>Outro item</li>
</ul>

<ol>
  <li>Primeiro passo</li>
  <li>Segundo passo</li>
</ol>
\`\`\`

## Links e imagens

\`\`\`html
<a href="https://developer.mozilla.org">Documentação MDN</a>
<img src="foto.png" alt="Descrição da imagem para quem não a vê" />
\`\`\`

O atributo \`alt\` é obrigatório na prática: é o que leitores de tela anunciam e o que aparece se a imagem quebrar.

## Agrupamento

\`\`\`html
<header>Topo da página</header>
<main>Conteúdo principal</main>
<footer>Rodapé</footer>
<section>Um bloco temático</section>
<div>Agrupamento genérico, sem significado</div>
\`\`\`

Regra de bolso: use \`<div>\` só quando nenhuma tag semântica servir.
`,
          },
          {
            slug: "praticando-html",
            title: "Praticando: sua primeira página",
            position: 3,
            kind: SectionKind.EXERCISE,
            contentMarkdown: `# Praticando: sua primeira página

Hora de colocar a mão na massa. Monte uma página de perfil pessoal usando apenas HTML:

1. Um \`<h1>\` com o seu nome.
2. Um parágrafo de apresentação com um trecho em \`<strong>\`.
3. Uma lista (\`<ul>\`) com três hobbies.
4. Um link (\`<a>\`) para um site que você gosta.
5. Uma imagem (\`<img>\`) com \`alt\` descritivo.

> Exercícios interativos chegam em breve — por enquanto, monte a página no seu editor e abra o arquivo no navegador.
`,
          },
        ],
      },
      {
        slug: "intro-css",
        title: "Introdução ao CSS",
        position: 2,
        sections: [
          {
            slug: "o-que-e-css",
            title: "O que é CSS",
            position: 1,
            kind: SectionKind.TEXT,
            contentMarkdown: `# O que é CSS

CSS (**C**ascading **S**tyle **S**heets) é a linguagem que dá aparência ao HTML: cores, espaçamentos, fontes e layout. O HTML diz *o que* cada coisa é; o CSS diz *como* ela aparece.

## Anatomia de uma regra

\`\`\`css
h1 {
  color: rebeccapurple;
  font-size: 2rem;
}
\`\`\`

- \`h1\` é o **seletor**: quais elementos a regra atinge.
- \`color\` e \`font-size\` são **propriedades**.
- \`rebeccapurple\` e \`2rem\` são os **valores**.

## Onde o CSS vive

A forma recomendada é um arquivo separado, linkado no \`<head>\`:

\`\`\`html
<link rel="stylesheet" href="styles.css" />
\`\`\`

Também dá para escrever dentro de uma tag \`<style>\` ou no atributo \`style=""\` de um elemento — útil para testes, ruim para manutenção.

## A cascata

"Cascading" está no nome: quando duas regras disputam o mesmo elemento, vence a mais **específica**; em empate, vence a que aparece **por último**. Entender essa ordem evita a maior parte das brigas com CSS.
`,
          },
          {
            slug: "seletores",
            title: "Seletores",
            position: 2,
            kind: SectionKind.TEXT,
            contentMarkdown: `# Seletores

Seletores são o "endereço" dos elementos que você quer estilizar.

## Os três fundamentais

\`\`\`css
p {
  /* por tag: todos os <p> */
}

.destaque {
  /* por classe: class="destaque" */
}

#cabecalho {
  /* por id: id="cabecalho" (único na página) */
}
\`\`\`

No dia a dia, **classes dominam**: são reutilizáveis e têm especificidade previsível. Ids são melhores para âncoras e JavaScript do que para estilo.

## Combinando seletores

\`\`\`css
article p {
  /* descendente: <p> dentro de <article> */
}

ul > li {
  /* filho direto */
}

a:hover {
  /* pseudo-classe: estado do elemento */
}
\`\`\`

## Especificidade em uma linha

Inline > id > classe/pseudo-classe > tag. Quando um estilo "não pega", quase sempre há um seletor mais específico ganhando a disputa — inspecione o elemento no DevTools para ver quem venceu.
`,
          },
          {
            slug: "praticando-css",
            title: "Praticando: estilizando seu perfil",
            position: 3,
            kind: SectionKind.EXERCISE,
            contentMarkdown: `# Praticando: estilizando seu perfil

Pegue a página de perfil do exercício anterior e dê vida a ela:

1. Crie um \`styles.css\` e linke no \`<head>\`.
2. Mude a cor e a fonte do \`<h1>\`.
3. Dê um fundo e um espaçamento interno (\`padding\`) ao parágrafo de apresentação.
4. Estilize os itens da lista com uma classe \`.hobby\`.
5. Faça o link mudar de cor no \`:hover\`.

> Exercícios interativos chegam em breve — por enquanto, edite os arquivos localmente e recarregue o navegador para ver o resultado.
`,
          },
        ],
      },
    ],
  },
]
