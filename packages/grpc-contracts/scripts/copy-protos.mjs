// Copia os arquivos .proto de src/ para dist/ preservando a estrutura, já que o
// `tsc` só emite JS/d.ts. Mantém o `.proto` ao lado do descritor compilado para
// que `join(__dirname, "<x>.proto")` resolva no pacote publicado.
import { cpSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

cpSync(join(root, "src"), join(root, "dist"), {
  recursive: true,
  filter: (source) => !source.endsWith(".ts"),
})
