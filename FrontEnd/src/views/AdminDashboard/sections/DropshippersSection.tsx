// src/pages/admin/sections/DropshippersSection.tsx
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

  if (loading) return <p className="text-zinc-400 p-4">Cargando lista...</p>;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-stone-800">
        <table className="w-full text-left border-collapse bg-[#111315]">
          <thead>
            <tr className="border-b border-stone-800 text-xs uppercase text-zinc-500 font-bold">
              <th className="p-4">Nombre Completo</th>
              <th className="p-4">Correo Electrónico</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Fecha Registro</th>
            </tr>
          </thead>
          <tbody className="text-sm text-zinc-300">
            {users.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No hay dropshippers registrados.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-stone-800/50 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-zinc-100">{user.fullName}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.phone}</td>
                  <td className="p-4 text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}