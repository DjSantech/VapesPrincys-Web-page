// src/components/CartButton.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../store/cart_info";
import { buildWhatsAppUrl, formatCOP } from "../lib/format";
import type { DeliveryInfo, DeliveryZone } from "../types/checkout";

const PHONE = "573043602980"; // tu número sin '+'

const FEE_BY_ZONE: Record<DeliveryZone, number> = {
  DOSQUEBRADAS:    600000,  // $6.000
  PEREIRA_CENTRO:  900000,  // $9.000
  CUBA:           1200000,  // $12.000
  NACIONAL:       2000000,  // $15.000
};

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const {
    items, removeItem, updateQty, clear,
    total, delivery, setDelivery,
  } = useCart();

  const count = items.reduce((n, i) => n + i.qty, 0);
  const sub = total();


  // Form domicilio
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

  // ⬇️ Calcula el fee y el total dinámicamente según la zona elegida
  const fee = FEE_BY_ZONE[form.zone] ?? 0;
  const grand = sub + fee;


  const handleChange = <K extends keyof DeliveryInfo>(key: K, value: DeliveryInfo[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleWhatsApp = () => {
    setDelivery(form);
    const url = buildWhatsAppUrl(PHONE, items, sub, form, fee);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Scroll a listado
  const listRef = useRef<HTMLDivElement | null>(null);
  const scrollToList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // --- Panel en portal (para salir del navbar) ---
  const Drawer = (
    <div className="fixed inset-0 z-[90]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

      {/* panel */}
      <aside
        className="
          absolute right-0 top-0 h-full w-full
          sm:w-[22rem] md:w-[24rem] lg:w-[28rem]
          bg-[#182c25] text-white shadow-2xl border-l border-green-700
          flex flex-col overflow-hidden
          pt-safe pb-safe
        "
        role="dialog"
        aria-label="Carrito de compras"
      >
        {/* Header fijo */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-lg font-semibold">Carrito</h3>
          <button className="text-sm text-white/70 hover:underline" onClick={() => setOpen(false)}>
            Cerrar
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Previsualización (top 3) */}
          <section className="border border-white/10 rounded-xl p-3 bg-[#15221d]">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-semibold text-sm">Previsualización</h4>
              {items.length > 0 && (
                <button onClick={scrollToList} className="text-xs text-green-300 hover:underline">
                  Ver todo
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-white/70 text-sm">Tu carrito está vacío.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {items.slice(0, 3).map((i) => (
                  <div
                    key={`${i.id}-${i.flavor}-${i.charger?.id ?? "nochg"}-${i.extraVape?.model ?? "nomodel"}`}
                    className="rounded-lg border border-white/10 bg-[#0f1a16] p-2"
                  >
                    <img
                      src={i.imageUrl || "https://picsum.photos/seed/vape/120"}
                      alt={i.name}
                      className="h-16 w-full rounded-md object-cover"
                    />
                    <div className="mt-1 text-[11px] line-clamp-2">{i.name}</div>
                    <div className="text-[10px] text-white/60">x{i.qty}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Listado completo */}
          {items.length > 0 && (
            <section ref={listRef} className="space-y-3">
              {items.map((i) => (
                <article
                  key={`${i.id}-${i.flavor}-${i.charger?.id ?? "nochg"}-${i.extraVape?.model ?? "nomodel"}`}
                  className="flex gap-3 rounded-xl border border-white/10 p-3 bg-[#15221d]"
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
                        {i.flavor && <div className="text-xs text-white/70">Sabor: {i.flavor}</div>}
                        {i.charger && (
                          <div className="text-xs text-white/70">
                            Cargador: {i.charger.name} ({formatCOP(i.charger.price)})
                          </div>
                        )}
                        {i.extraVape && (
                          <div className="text-xs text-white/70">
                            Extra: {i.extraVape.model} x{i.extraVape.qty} ({formatCOP(i.extraVape.price)})
                          </div>
                        )}
                        {i.giftVape && (
                          <div className="text-xs text-green-300">🎁 Regalo: {i.giftVape.model}</div>
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
                      <div className="text-green-300 font-semibold">{formatCOP(i.price)}</div>
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 rounded-lg bg-white/10"
                          onClick={() => updateQty(i.id, Math.max(1, i.qty - 1))}
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>
                        <span className="w-6 text-center">{i.qty}</span>
                        <button
                          className="px-2 py-1 rounded-lg bg-white/10"
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
          {/* Formulario de domicilio */}
          <section className="space-y-3 border border-white/10 rounded-xl p-3 bg-[#15221d]">
            <h4 className="font-semibold text-sm">Datos de domicilio</h4>

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
              <label className="text-sm w-36">Zona / Envío</label>
              <select
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                value={form.zone}
                onChange={(e) => {
                          const newZone = e.target.value as DeliveryZone;
                          handleChange("zone", newZone);
                          // Si el usuario selecciona “NACIONAL”, forzamos el pago a “TRANSFERENCIA”
                          if (newZone === "NACIONAL") {
                            handleChange("paymentMethod", "TRANSFERENCIA"); // 👈 forza transferencia
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
            {/* ⚠️ Nota aclaratoria */}
            <p className="text-xs text-yellow-300 mt-1">
              📦 El precio del envío puede variar según la zona del envio o de la ciudad de destino.  
              Por favor asegúrate de llenar correctamente todos los campos del formulario para evitar demoras en la entrega.
            </p>

            {/* Campo Cédula solo para envíos nacionales */}
            {form.zone === "NACIONAL" && (
              <input
                className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                placeholder="🔖 CÉDULA (para envío nacional)"
                value={form.idCard ?? ""}
                onChange={(e) => handleChange("idCard", e.target.value)}
              />
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm w-36">Pago</label>
              <select
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm"
                value={form.paymentMethod}
                onChange={(e) => handleChange("paymentMethod", e.target.value as DeliveryInfo["paymentMethod"])}
                disabled={form.zone === "NACIONAL"}   // 👈 no se puede cambiar
                title={form.zone === "NACIONAL" ? "Para envíos nacionales el pago es solo por transferencia" : undefined}
                >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            {form.paymentMethod === "EFECTIVO" && form.zone !== "NACIONAL" && (
              <div className="flex items-center gap-3">
                <label className="text-sm w-36">Devuelta (opcional)</label>
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
          </section>
        </div>

        {/* Pie: usa fee/grand calculados arriba */}
        <div className="shrink-0 border-t border-white/10 p-4 space-y-3 bg-[#182c25]">
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
              disabled={items.length === 0 || !form.name || !form.phone || !form.address || (form.zone === "NACIONAL" && !form.idCard)}
              onClick={handleWhatsApp}
            >
              Continuar con pago (WhatsApp)
            </button>
            <button className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15" onClick={clear}>
              Vaciar
            </button>
          </div>
          <p className="text-xs text-white/60">
            Al continuar te redigiremos con un mensaje a el WhatsApp con el detalle del pedido y tus datos, para que finalices con el pago.
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
          <span className="absolute -right-1 -top-1 min-w-[1.25rem] rounded-full bg-green-500 px-1 text-xs font-bold text-black text-center">
            {count}
          </span>
        )}
      </button>
      {open && createPortal(Drawer, document.body)}
    </>
  );
}