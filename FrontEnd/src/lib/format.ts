import type { CartItem } from "../types/Cart";
import type { DeliveryInfo } from "../types/checkout";

export const formatCOP = (pesos: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(pesos || 0);

export const buildWhatsAppUrl = (
  phone: string,
  items: CartItem[],
  subtotal: number,
  delivery?: DeliveryInfo,
  deliveryFee = 0
) => {
  const lines: string[] = [];

  lines.push(`🛒 *Nuevo pedido*`);
  lines.push(`--------------------------------`);
  items.forEach((it) => {
    lines.push(`• ${it.name} x${it.qty} - ${formatCOP(it.price * it.qty)}`);
    if (it.flavor) lines.push(`   Sabor: ${it.flavor}`);
    if (it.charger) lines.push(`   Cargador: ${it.charger.name} (${formatCOP(it.charger.price)})`);
    if (it.extraVape) lines.push(`   Extra: ${it.extraVape.model} x${it.extraVape.qty} (${formatCOP(it.extraVape.price)})`);
    if (it.giftVape) lines.push(`   🎁 Regalo: ${it.giftVape.model}`);
  });
  lines.push(`--------------------------------`);
  lines.push(`Subtotal: ${formatCOP(subtotal)}`);
  if (delivery) {
    lines.push(`Domicilio: ${formatCOP(deliveryFee)}`);
    lines.push(`Total: ${formatCOP(subtotal + deliveryFee)}`);
    lines.push(`--------------------------------`);
    lines.push(`👤 Nombre: ${delivery.name}`);
    lines.push(`📞 Teléfono: ${delivery.phone}`);
    lines.push(`📍 Dirección: ${delivery.address}`);
    lines.push(`🗺️ Zona: ${delivery.zone}`);
    lines.push(`💳 Pago: ${delivery.paymentMethod}`);

    // ✅ Datos extra para envío nacional
    if (delivery.zone === "NACIONAL") {
      if (delivery.cedula)     lines.push(`🪪 Cédula: ${delivery.cedula}`);
      if (delivery.department) lines.push(`🏛️ Departamento: ${delivery.department}`);
      if (delivery.city)       lines.push(`🏙️ Ciudad/Municipio: ${delivery.city}`);
    }

    if (delivery.paymentMethod === "EFECTIVO" && delivery.changeFor) {
      lines.push(`💵 Cambio para: ${formatCOP(delivery.changeFor)}`);
    }
  }

  const text = encodeURIComponent(lines.join("\n"));
  const clean = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${clean}?text=${text}`;
};
