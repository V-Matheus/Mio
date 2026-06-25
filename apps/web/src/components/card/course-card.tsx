import { Book, CheckCircle2, Clock, Star, Users } from "lucide-react"

interface CourseCardProps {
  title: string
  description: string
  duration: string
  lessons: string
  students: string
  rating: string
  level: string
  enrolled?: boolean
  image: string
  buttonColor?: string
}

export function CourseCard({
  title,
  description,
  duration,
  lessons,
  students,
  rating,
  level,
  enrolled,
  image,
  buttonColor = "bg-orange-500 hover:bg-orange-600",
}: CourseCardProps) {
  // Função auxiliar para definir a cor da badge do nível
  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case "Iniciante":
        return "bg-green-100 text-green-700"
      case "Intermediário":
        return "bg-yellow-100 text-yellow-700"
      case "Avançado":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Imagem com as Badges */}
      <div className="h-48 relative">
        <img src={image} alt={title} className="w-full h-full object-cover" />

        <div className="absolute top-3 left-3 flex gap-2 w-full pr-6 justify-between items-center">
          {enrolled ? (
            <span className="bg-white/90 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-slate-600" /> Matriculado
            </span>
          ) : (
            <div />
          )}

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${getLevelColor(level)}`}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Conteúdo Informativo */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
          {description}
        </p>

        {/* Grid de Ícones e Detalhes */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-500 mb-5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {duration}
          </div>
          <div className="flex items-center gap-1.5">
            <Book className="w-4 h-4" /> {lessons}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> {students} alunos
          </div>
          <div className="flex items-center gap-1.5 font-medium text-amber-500">
            <Star className="w-4 h-4 fill-amber-500" /> {rating}
          </div>
        </div>

        <button
          type="button"
          className={`w-full py-2.5 rounded-xl text-white font-medium transition-colors mt-auto ${buttonColor}`}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
