import { useEffect, useState } from "react";
import { getSurveyResponses } from "../../../services/survey.services";
import type { ISurveyResponse } from "../../../types/survey";

export function SurveyResultsSection() {
  const [responses, setResponses] = useState<ISurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const data = await getSurveyResponses();
      setResponses(data);
    } catch (err) {
      console.error("Error cargando respuestas:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar por nombre o cédula para buscar rápido
  const filteredResponses = responses.filter(r => 
    r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.idCard.includes(searchTerm)
  );

  return (
    <div className="space-y-4 text-zinc-100 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-medium text-indigo-400">Cupones Generados</h3>
        <input 
          type="text"
          placeholder="Buscar por nombre o cédula..."
          className="bg-zinc-900 border border-stone-800 p-2 rounded text-sm w-full sm:w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center py-10 text-zinc-500">Cargando resultados...</p>
      ) : (
        <div className="overflow-x-auto border border-stone-800 rounded-lg">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3 border-b border-stone-800">Cliente</th>
                <th className="p-3 border-b border-stone-800">Cédula / Tel</th>
                <th className="p-3 border-b border-stone-800">Encuesta</th>
                <th className="p-3 border-b border-stone-800">Código Cupón</th>
                <th className="p-3 border-b border-stone-800">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filteredResponses.length > 0 ? (
                filteredResponses.map((res) => (
                  <tr key={res._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3">
                      <p className="font-medium">{res.userName}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-zinc-300">{res.idCard}</p>
                      <p className="text-zinc-500 text-xs">{res.phoneNumber}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-zinc-400">
                        {typeof res.surveyId === 'object' ? res.surveyId.title : 'Encuesta'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/30 font-mono font-bold">
                        {res.couponCode}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500 text-xs">
                      {new Date(res.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-600">
                    No se encontraron respuestas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}