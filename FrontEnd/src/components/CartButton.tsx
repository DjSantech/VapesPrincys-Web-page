// src/components/CartButton.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../store/cart_info";
import { buildWhatsAppUrl, formatCOP } from "../lib/format";
import type { DeliveryInfo, DeliveryZone } from "../types/checkout";

const PHONE = "573043602980";

const FEE_BY_ZONE: Record<DeliveryZone, number> = {
  DOSQUEBRADAS:   600000,
  PEREIRA_CENTRO: 900000,
  CUBA:          1200000,
  NACIONAL:      2000000,
};

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const { items, removeItem, updateQty, clear, total, delivery, setDelivery } = useCart();

  const count = items.reduce((n, i) => n + i.qty, 0);
  const sub = total();

  const [form, setForm] = useState<DeliveryInfo>(
    delivery ?? {
      name: "",
      phone: "",
      address: "",
      paymentMethod: "EFECTIVO",
      changeFor: undefined,
      zone: "PEREIRA_CENTRO",
      idCard: undefined,
    }
  );

  const fee = FEE_BY_ZONE[form.zone] ?? 0;
  const grand = sub + fee;

  const handleChange = <K extends keyof DeliveryInfo>(key: K, value: DeliveryInfo[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleWhatsApp = () => {
    setDelivery(form);
    const url = buildWhatsAppUrl(PHONE, items, sub, form, fee);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const Drawer = (
    <div className="fixed inset-0 z-[90]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" onClick={() => setOpen(false)} />

      {/* Panel */}
      <aside
        className="
          absolute right-0 top-0 h-full w-full sm:w-[22rem] md:w-[24rem] lg:w-[28rem]
          bg-[#111315] text-zinc-100 border-l border-stone-700 shadow-2xl
          flex flex-col overflow-hidden
        "
        role="dialog"
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-stone-700">
          <h3 className="text-lg font-semibold">Carrito</h3>
          <button
            className="text-sm text-zinc-400 hover:text-amber-400 transition"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </button>
        </div>

        {/* Content scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Preview */}
          <section className="rounded-xl border border-stone-700 bg-[#1a1d1f] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-sm">Previsualización</h4>
              {items.length > 0 && (
                <button onClick={scrollToList} className="text-xs text-amber-400 hover:underline">
                  Ver todo
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-zinc-400">Tu carrito está vacío.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {items.slice(0, 3).map((i) => (
                  <div
                    key={`${i.id}-${i.flavor}-${i.charger?.id ?? "nochg"}-${i.extraVape?.model ?? "nomodel"}`}
                    className="rounded-lg border border-stone-700 bg-[#131619] p-2"
                  >
                    <img
                      src={i.imageUrl || "https://picsum.photos/seed/vape/120"}
                      alt={i.name}
                      className="h-16 w-full rounded-md object-cover"
                    />
                    <div className="mt-1 text-[11px] line-clamp-2 text-zinc-200">{i.name}</div>
                    <div className="text-[10px] text-zinc-400">x{i.qty}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* List */}
          {items.length > 0 && (
            <section ref={listRef} className="space-y-3">
              {items.map((i) => (
                <article
                  key={`${i.id}-${i.flavor}-${i.charger?.id ?? "nochg"}-${i.extraVape?.model ?? "nomodel"}`}
                  className="flex gap-3 rounded-xl border border-stone-700 bg-[#1a1d1f] p-3"
                >
                  <img
                    src={i.imageUrl || "https://picsum.photos/seed/vape/120"}
                    alt={i.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm line-clamp-1">{i.name}</div>
                        {i.flavor && <div className="text-xs text-zinc-400">Sabor: {i.flavor}</div>}
                        {i.charger && (
                          <div className="text-xs text-zinc-400">
                            Cargador: {i.charger.name} ({formatCOP(i.charger.price)})
                          </div>
                        )}
                        {i.extraVape && (
                          <div className="text-xs text-zinc-400">
                            Extra: {i.extraVape.model} x{i.extraVape.qty} ({formatCOP(i.extraVape.price)})
                          </div>
                        )}
                        {i.giftVape && (
                          <div className="text-xs text-amber-400">🎁 Regalo: {i.giftVape.model}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(i.id)}
                        className="text-xs text-red-300 hover:underline shrink-0"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-semibold text-amber-400">{formatCOP(i.price)}</div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
                          onClick={() => updateQty(i.id, Math.max(1, i.qty - 1))}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{i.qty}</span>
                        <button
                          className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
                          onClick={() => updateQty(i.id, i.qty + 1)}
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Delivery form */}
          <section className="space-y-3 rounded-xl border border-stone-700 bg-[#1a1d1f] p-3">
            <h4 className="font-semibold text-sm">Datos de domicilio</h4>

            <input
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-zinc-400"
              placeholder="🔖 NOMBRE"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />

            <input
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-zinc-400"
              placeholder="🔖 TELÉFONO (ej: 3001234567)"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <textarea
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-zinc-400"
              placeholder="🔖 DIRECCIÓN DETALLADA (Cra, Calle, Piso, Apto, Barrio)"
              rows={3}
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />

            <div className="flex items-center gap-3">
              <label className="text-sm w-36 text-zinc-300">Zona / Envío</label>
              <select
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                value={form.zone}
                onChange={(e) => {
                  const newZone = e.target.value as DeliveryZone;
                  handleChange("zone", newZone);
                  if (newZone === "NACIONAL") {
                    handleChange("paymentMethod", "TRANSFERENCIA");
                    handleChange("changeFor", undefined);
                  }
                }}
              >
                <option value="DOSQUEBRADAS">Dosquebradas ($6.000)</option>
                <option value="PEREIRA_CENTRO">Pereira Centro ($9.000)</option>
                <option value="CUBA">Cuba ($12.000)</option>
                <option value="NACIONAL">Envío Nacional ($20.000)</option>
              </select>
            </div>

            <p className="text-xs text-amber-300 mt-1">
              📦 El precio del envío puede variar según la zona o ciudad de destino.
              Completa bien el formulario para evitar demoras en la entrega.
            </p>

            {form.zone === "NACIONAL" && (
              <input
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-zinc-400"
                placeholder="🔖 CÉDULA (para envío nacional)"
                value={form.idCard ?? ""}
                onChange={(e) => handleChange("idCard", e.target.value)}
              />
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm w-36 text-zinc-300">Pago</label>
              <select
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
                value={form.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value as DeliveryInfo["paymentMethod"])}
                disabled={form.zone === "NACIONAL"}
                title={form.zone === "NACIONAL" ? "Para envíos nacionales el pago es solo por transferencia" : undefined}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            {form.paymentMethod === "EFECTIVO" && form.zone !== "NACIONAL" && (
              <div className="flex items-center gap-3">
                <label className="text-sm w-36 text-zinc-300">Devuelta (opcional)</label>
                <input
                  type="number"
                  min={0}
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-zinc-400"
                  placeholder="Ej: 100000"
                  value={form.changeFor ?? ""}
                  onChange={(e) => handleChange("changeFor", Number(e.target.value) || undefined)}
                />
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-stone-700 bg-[#111315] p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span><span>{formatCOP(sub)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Domicilio</span><span>{formatCOP(fee)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold text-amber-400">
            <span>Total</span><span>{formatCOP(grand)}</span>
          </div>

          <div className="flex gap-3">
            <button
              className="flex-1 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50"
              disabled={items.length === 0 || !form.name || !form.phone || !form.address || (form.zone === "NACIONAL" && !form.idCard)}
              onClick={handleWhatsApp}
            >
              Continuar con pago (WhatsApp)
            </button>
            <button
              className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
              onClick={clear}
            >
              Vaciar
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Al continuar te redirigiremos a WhatsApp con el detalle del pedido y tus datos para finalizar el pago.
          </p>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative rounded-xl p-2 hover:bg-white/10"
        aria-label="Abrir carrito"
      >
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-amber-500 px-1 text-xs font-bold text-black text-center">
            {count}
          </span>
        )}
      </button>
      {open && createPortal(Drawer, document.body)}
    </>
  );
}
