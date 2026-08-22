import type { Metadata } from "next"
import { CatalogView } from "@/modules/catalog"

export const metadata: Metadata = {
  title: "Trilhas | Mio",
  description:
    "Explore as trilhas de conhecimento e aprenda programação do zero.",
}

export default function TrilhasPage() {
  return <CatalogView />
}
