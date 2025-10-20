// src/lib/format.ts
import type { CartItem } from "../types/Cart";
import type { DeliveryInfo } from "../types/checkout";

export const formatCOP = (pesos: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(pesos || 0);

const zoneLabel: Record<NonNullable<DeliveryInfo["zone"]>, string> = {
  DOSQUEBRADAS: "Dosquebradas",
  PEREIRA_CENTRO: "Pereira Centro",
  CUBA: "Cuba",
  NACIONAL: "Envío Nacional (contado)",
};

// NUEVA FIRMA: 5 argumentos
export const buildWhatsAppUrl = (
  phone: string,
  items: CartItem[],
  subtotal: number,
  delivery?: DeliveryInfo,
  deliveryFee = 0
) => {
  const lines: string[] = [];
  lines.push("Hola! Quiero continuar con esta compra:\n");

  items.forEach((i, idx) => {
    lines.push(`Producto #${idx + 1}`);
    lines.push(`- ${i.name} x${i.qty} (${formatCOP(i.price)})`);
    if (i.flavor)   lines.push(`  • Sabor: ${i.flavor}`);
    if (i.charger)  lines.push(`  • Cargador: ${i.charger.name} (${formatCOP(i.charger.price)})`);
    if (i.extraVape) lines.push(`  • Extra: ${i.extraVape.model} x${i.extraVape.qty} (${formatCOP(i.extraVape.price)})`);
    if (i.giftVape) lines.push(`  • Regalo: ${i.giftVape.model}${i.giftVape.flavor ? " ("+i.giftVape.flavor+")" : ""}`);
    lines.push("");
  });

  lines.push(`SUBTOTAL: ${formatCOP(subtotal)}`);
  if (delivery) {
    lines.push(`DOMICILIO (${zoneLabel[delivery.zone]}): ${formatCOP(deliveryFee)}`);
    lines.push(`TOTAL: ${formatCOP(subtotal + deliveryFee)}`);
    lines.push("\nDatos de domicilio:");
    lines.push(`🔖 NOMBRE: ${delivery.name}`);
    lines.push(`🔖 TELÉFONO: ${delivery.phone}`);
    lines.push(`🔖 DIRECCIÓN DETALLADA: ${delivery.address}`);
    lines.push(`🔖 PAGO: ${delivery.paymentMethod === "EFECTIVO" ? "Efectivo" : "Transferencia"}`);
    if (delivery.paymentMethod === "EFECTIVO" && delivery.changeFor) {
      lines.push(`🔖 DEVUELTA: ${formatCOP(delivery.changeFor)}`);
    }
    lines.push(`\nESTAR PENDIENTE DE EL DOMICILIARIO`);
  }

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${phone}?text=${text}`;
};
