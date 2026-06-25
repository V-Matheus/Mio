"use client"

import { Search } from "lucide-react"
import { useState } from "react"
import { CourseCard } from "@/components/card/course-card"

// Simulação de banco de dados (Mock)
const coursesData = [
  {
    id: 1,
    title: "Mundo do Front-End",
    description:
      "Aprenda os fundamentos do HTML e CSS para criar páginas web incríveis",
    duration: "8 horas",
    lessons: "20 aulas",
    students: "15.420",
    rating: "4.8",
    level: "Iniciante",
    enrolled: true,
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
  },
  {
    id: 2,
    title: "JavaScript Essential",
    description:
      "Domine JavaScript do básico ao avançado e crie aplicações interativas",
    duration: "12 horas",
    lessons: "25 aulas",
    students: "12.350",
    rating: "4.9",
    level: "Iniciante",
    enrolled: true,
    image:
      "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&q=80&w=400",
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
  {
    id: 3,
    title: "React para Iniciantes",
    description: "Construa aplicações modernas com React, componentes e hooks",
    duration: "15 horas",
    lessons: "30 aulas",
    students: "9.870",
    rating: "4.7",
    level: "Intermediário",
    enrolled: true,
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
]

const categories = [
  "Todos",
  "Front-End",
  "Back-End",
  "Full-Stack",
  "Mobile",
  "Banco de Dados",
  "DevOps",
]
const levels = ["Todos", "Iniciante", "Intermediário", "Avançado"]

export default function CursosPage() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [activeLevel, setActiveLevel] = useState("Todos")

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Título e Subtítulo */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Todos os Cursos
        </h1>
        <p className="text-slate-500">
          Explore nossa biblioteca completa de cursos e expanda suas habilidades
        </p>
      </header>

      {/* Seção de Filtros e Busca */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        {/* Barra de Pesquisa */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Botões de Filtros */}
        <div className="space-y-4">
          {/* Categorias */}
          <div>
            <span className="text-sm font-medium text-slate-500 mb-2 block">
              Categoria
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Níveis */}
          <div>
            <span className="text-sm font-medium text-slate-500 mb-2 block">
              Nível
            </span>
            <div className="flex flex-wrap gap-2">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveLevel(lvl)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeLevel === lvl
                      ? "bg-orange-500 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contador de Cursos */}
      <p className="text-slate-500 mb-4">
        Mostrando{" "}
        <span className="font-bold text-slate-800">{coursesData.length}</span>{" "}
        cursos
      </p>

      {/* Grid Renderizando o Componente Isolado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesData.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            duration={course.duration}
            lessons={course.lessons}
            students={course.students}
            rating={course.rating}
            level={course.level}
            enrolled={course.enrolled}
            image={course.image}
            buttonColor={course.buttonColor}
          />
        ))}
      </div>
    </div>
  )
}
