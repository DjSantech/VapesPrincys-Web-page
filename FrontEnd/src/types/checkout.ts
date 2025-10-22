export type DeliveryZone = "DOSQUEBRADAS" | "PEREIRA_CENTRO" | "CUBA" | "NACIONAL";

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;
  paymentMethod: "EFECTIVO" | "TRANSFERENCIA";
  changeFor?: number;
  zone: DeliveryZone;
  idCard?: string;     // (si lo usas en otro lado)
  cedula?: string;     // para nacional
  department?: string; // ✅ nuevo: departamento (nacional)
  city?: string;       // ✅ nuevo: ciudad/municipio (nacional)
}
