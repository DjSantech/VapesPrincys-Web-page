import { useEffect, useState } from "react";
import { getDropshippers, type DropshipperUser } from "../../../services/admin";

export function DropshippersSection() {
  const [users, setUsers] = useState<DropshipperUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDropshippers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
      <p className="text-zinc-400 ml-3">Cargando lista...</p>
    </div>
  );

  return (
    <div className="space-y-4 px-2 sm:px-0">
      {/* --- VISTA DE ESCRITORIO (TABLA) --- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-stone-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-[#111315]">
            <thead>
              <tr className="border-b border-stone-800 text-xs uppercase text-zinc-500 font-bold">
                <th className="p-4">Nombre Completo</th>
                <th className="p-4">Correo Electrónico</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4">Codigo del vendedor</th>
              </tr>
            </thead>
            <tbody className="text-sm text-zinc-300">
              {users.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No hay dropshippers registrados.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-stone-800/50 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-zinc-100">{user.fullName}</td>
                    <td className="p-4 italic">{user.email}</td>
                    <td className="p-4">{user.phone}</td>
                    <td className="p-4 text-zinc-500 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono text-amber-500 font-bold">
                    {user.referralCode || "Sin código"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VISTA MÓVIL (CARDS) --- */}
      <div className="md:hidden space-y-3">
        {users.length === 0 ? (
          <p className="p-4 text-center text-zinc-500">No hay dropshippers registrados.</p>
        ) : (
          users.map((user) => (
            <div 
              key={user.id} 
              className="bg-[#111315] border border-stone-800 p-4 rounded-xl space-y-2 shadow-sm"
            >
              <div className="flex justify-between items-start border-b border-stone-800/50 pb-2 mb-2">
                <h3 className="font-bold text-zinc-100">{user.fullName}</h3>
                <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col space-y-1 text-sm">
                <p className="text-zinc-400 flex items-center gap-2">
                  <span className="text-zinc-600 font-semibold uppercase text-[10px]">Email:</span> 
                  {user.email}
                </p>
                <p className="text-zinc-400 flex items-center gap-2">
                  <span className="text-zinc-600 font-semibold uppercase text-[10px]">Teléfono:</span> 
                  {user.phone}
                </p>
                <p className="text-zinc-400 flex items-center gap-2">
                  <span className="text-zinc-600 font-semibold uppercase text-[10px]">Código:</span> 
                  <span className="text-amber-500 font-bold">{user.referralCode}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}