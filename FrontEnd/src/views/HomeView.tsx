export default function HomeView() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold">Bienvenido a Vapitos Princys</h1>
      <p className="mt-2 text-white/70">
        Esta es la página principal temporal. Aquí podrás mostrar productos, categorías
        o promociones destacadas.
      </p>

      {/* Productos de ejemplo */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[
          { id: 1, name: "Vape Desechable 3000 Puffs", price: "$60.000" },
          { id: 2, name: "Pod Recargable", price: "$120.000" },
          { id: 3, name: "Líquido de Mango 30ml", price: "$35.000" },
          { id: 4, name: "Accesorio Cargador USB-C", price: "$25.000" },
        ].map((p) => (
          <div
            key={p.id}
            className="rounded-xl bg-[#182c25] p-4 shadow hover:shadow-lg transition"
          >
            <div className="h-32 w-full bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-white/50 text-sm">Imagen</span>
            </div>
            <h2 className="mt-3 font-semibold">{p.name}</h2>
            <p className="text-sm text-white/60">{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
