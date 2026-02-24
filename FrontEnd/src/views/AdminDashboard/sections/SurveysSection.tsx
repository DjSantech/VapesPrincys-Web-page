import { useEffect, useState } from "react";
import { getAdminSurveys, createSurvey, toggleSurveyStatus, deleteSurvey } from "../../../services/survey.services";
import type { ISurvey } from "../../../types/survey";

export function SurveysSection() {
  const [surveys, setSurveys] = useState<ISurvey[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el formulario de nueva encuesta
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      const data = await getAdminSurveys();
      setSurveys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => setQuestions([...questions, ""]);
  
  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleCreate = async () => {
    if (!title || questions.some(q => !q)) return alert("Completa todos los campos");
    try {
      await createSurvey({ title, questions });
      setTitle("");
      setQuestions([""]);
      loadSurveys();
    } catch  {
      alert("Error al crear");
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleSurveyStatus(id, !currentStatus);
      loadSurveys(); // Recargamos para ver el cambio de estado en todas
    } catch {
      alert("Error al actualizar estado");
    }
  };

  const handleDelete = async (id: string) => {
  if (!confirm("¿Estás seguro de que quieres eliminar esta encuesta? Se borrará permanentemente.")) return;
  
  try {
    await deleteSurvey(id);
    loadSurveys(); // Recarga la lista
  } catch {
    alert("No se pudo eliminar la encuesta");
  }
};

  return (
    <div className="space-y-6 text-zinc-100 p-2">
      {/* FORMULARIO DE CREACIÓN */}
      <div className="bg-[#141619] p-4 rounded-lg border border-stone-800 space-y-4">
        <h3 className="text-lg font-medium">Nueva Encuesta</h3>
        <input
          type="text"
          placeholder="Título de la encuesta (ej: Encuesta de Satisfacción)"
          className="w-full bg-zinc-900 border border-stone-700 p-2 rounded text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Preguntas:</label>
          {questions.map((q, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Pregunta #${i + 1}`}
              className="w-full bg-zinc-900 border border-stone-700 p-2 rounded text-sm block"
              value={q}
              onChange={(e) => handleQuestionChange(i, e.target.value)}
            />
          ))}
          <button 
            onClick={handleAddQuestion}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            + Añadir otra pregunta
          </button>
        </div>

        <button
          onClick={handleCreate}
          className="w-full bg-indigo-600 py-2 rounded font-medium hover:bg-indigo-500 transition text-sm"
        >
          Guardar Encuesta
        </button>
      </div>

      {/* LISTADO DE ENCUESTAS */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Historial de Encuestas</h3>
        {loading ? <p className="text-sm text-zinc-500">Cargando...</p> : (
          surveys.map((s) => (
            <div key={s._id} className="flex items-center justify-between bg-zinc-900/50 p-3 rounded border border-stone-800">
              <div>
                <p className="font-medium text-sm">{s.title}</p>
                <p className="text-xs text-zinc-500">{s.questions.length} preguntas</p>
              </div>
              <button
                onClick={() => handleToggle(s._id, s.isActive)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  s.isActive 
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50" 
                    : "bg-zinc-700 text-zinc-400"
                }`}
              >
                {s.isActive ? "ACTIVA EN HOME" : "ACTIVAR"}
              </button>
              <button
                    onClick={() => handleDelete(s._id)}
                    className="p-1.5 rounded bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition"
                    title="Eliminar encuesta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}