// src/components/CartButton.tsx
import { useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../store/cart_info";
import { buildWhatsAppUrl, formatCOP } from "../lib/format";
import type { DeliveryInfo, DeliveryZone } from "../types/checkout";

const PHONE = "573043602980"; // tu número sin '+'

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const {
    items, removeItem, updateQty, clear,
    total, delivery, setDelivery, deliveryFee, totalWithDelivery
  } = useCart();

  const count = items.reduce((n, i) => n + i.qty, 0);
  const sub = total();
  const fee = deliveryFee();
  const grand = totalWithDelivery();

  // form domicilio
  const [form, setForm] = useState<DeliveryInfo>(
    delivery ?? {
      name: "",
      phone: "",
      address: "",
      paymentMethod: "EFECTIVO",
      changeFor: undefined,
      zone: "PEREIRA_CENTRO",
    }
  );

  const handleChange = <K extends keyof DeliveryInfo>(key: K, value: DeliveryInfo[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleWhatsApp = () => {
    setDelivery(form);
    const url = buildWhatsAppUrl(PHONE, items, sub, form, fee); // versión 5 args
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ref para hacer scroll del preview al listado
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {/* Botón del navbar */}
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-xl px-3 py-2 hover:bg-white/10"
        aria-label="Abrir carrito"
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-green-500 px-1 text-xs font-bold text-black text-center">
            {count}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[#182c25] text-white shadow-2xl border-l border-green-700 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600/40 scrollbar-track-transparent">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-lg font-semibold">Carrito</h3>
              <button className="text-sm text-white/70 hover:underline" onClick={() => setOpen(false)}>Cerrar</button>
            </div>

            {/* ===== Previsualización (top 3) ===== */}
            <div className="p-4 border-b border-white/10">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-semibold">Previsualización</h4>
                {items.length > 0 && (
                  <button onClick={scrollToList} className="text-xs text-green-300 hover:underline">
                    Ver todo
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-white/70 text-sm">Tu carrito está vacío.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {items.slice(0, 3).map((i) => (
                    <div key={`${i.id}-${i.flavor}-${i.charger?.id ?? "nochg"}-${i.extraVape?.model ?? "nomodel"}`}
                      className="rounded-xl border border-white/10 bg-[#15221d] p-2"
                    >
                      <img
                        src={i.imageUrl || "https://picsum.photos/seed/vape/120"}
                        alt={i.name}
                        className="h-20 w-full rounded-lg object-cover"
                      />
                      <div className="mt-1 text-xs line-clamp-2">{i.name}</div>
                      <div className="text-[10px] text-white/70">x{i.qty}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ===== Listado completo ===== */}
            <div ref={listRef} className="p-4 space-y-4 max-h-[32%] overflow-y-auto">
              {items.length === 0 ? null : items.map((i) => (
                <div key={`${i.id}-${i.flavor}-${i.charger?.id ?? "nochg"}-${i.extraVape?.model ?? "nomodel"}`}
                  className="flex gap-3 rounded-xl border border-white/10 p-3 bg-[#15221d]"
                >
                  <img
                    src={i.imageUrl || "https://picsum.photos/seed/vape/120"}
                    alt={i.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold">{i.name}</div>
                        {i.flavor && <div className="text-xs text-white/70">Sabor: {i.flavor}</div>}
                        {i.charger && <div className="text-xs text-white/70">Cargador: {i.charger.name} ({formatCOP(i.charger.price)})</div>}
                        {i.extraVape && <div className="text-xs text-white/70">Extra: {i.extraVape.model} x{i.extraVape.qty} ({formatCOP(i.extraVape.price)})</div>}
                        {i.giftVape && <div className="text-xs text-green-300">🎁 Regalo: {i.giftVape.model}</div>}
                      </div>
                      <button onClick={() => removeItem(i.id)} className="text-xs text-red-300 hover:underline">
                        Quitar
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-green-300 font-semibold">{formatCOP(i.price)}</div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 rounded-lg bg-white/10"
                          onClick={() => updateQty(i.id, Math.max(1, i.qty - 1))}
                        >-</button>
                        <span className="w-6 text-center">{i.qty}</span>
                        <button
                          className="px-2 rounded-lg bg-white/10"
                          onClick={() => updateQty(i.id, i.qty + 1)}
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ===== Formulario de domicilio ===== */}
            <div className="p-4 space-y-3 border-t border-white/10">
              <h4 className="font-semibold">Datos de domicilio</h4>

              <input
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                placeholder="🔖 NOMBRE"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <input
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                placeholder="🔖 TELÉFONO (ej: 3001234567)"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />

              <textarea
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                placeholder="🔖 DIRECCIÓN DETALLADA (Cra, Calle, Piso, Apto, Barrio)"
                rows={3}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />

              <div className="flex items-center gap-3">
                <label className="text-sm w-40">Zona / Envío</label>
                <select
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                  value={form.zone}
                  onChange={(e) => handleChange("zone", e.target.value as DeliveryZone)}
                >
                  <option value="DOSQUEBRADAS">Dosquebradas ($6.000)</option>
                  <option value="PEREIRA_CENTRO">Pereira Centro ($9.000)</option>
                  <option value="CUBA">Cuba ($12.000)</option>
                  <option value="NACIONAL">Envío Nacional - Contado ($15.000)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm w-40">Pago</label>
                <select
                  className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                  value={form.paymentMethod}
                  onChange={(e) => handleChange("paymentMethod", e.target.value as DeliveryInfo["paymentMethod"])}
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                </select>
              </div>

              {form.paymentMethod === "EFECTIVO" && (
                <div className="flex items-center gap-3">
                  <label className="text-sm w-40">Devuelta (opcional)</label>
                  <input
                    type="number"
                    min={0}
                    className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                    placeholder="Ej: 100000"
                    value={form.changeFor ?? ""}
                    onChange={(e) => handleChange("changeFor", Number(e.target.value) || undefined)}
                  />
                </div>
              )}
            </div>

            {/* Totales + acción */}
            <div className="border-t border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span><span>{formatCOP(sub)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Domicilio</span><span>{formatCOP(fee)}</span>
              </div>
              <div className="flex items-center justify-between text-lg font-bold text-green-300">
                <span>Total</span><span>{formatCOP(grand)}</span>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-xl bg-green-500 px-4 py-2 font-semibold text-black hover:bg-green-400 disabled:opacity-50"
                  disabled={items.length === 0 || !form.name || !form.phone || !form.address}
                  onClick={handleWhatsApp}
                >
                  Continuar con pago (WhatsApp)
                </button>
                <button className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15" onClick={clear}>
                  Vaciar
                </button>
              </div>
              <p className="text-xs text-white/60">
                Al continuar te enviaremos un mensaje a WhatsApp con el detalle del pedido y tus datos.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
