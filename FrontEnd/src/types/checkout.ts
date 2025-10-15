export type DeliveryZone = "DOSQUEBRADAS" | "PEREIRA_CENTRO" | "CUBA" | "NACIONAL";

export interface DeliveryInfo {
  name: string;
  phone: string;
  address: string;        // "Cra, Calle, Piso, Apto, Barrio"
  paymentMethod: "EFECTIVO" | "TRANSFERENCIA";
  changeFor?: number;     // solo si efectivo
  idCard?: string;        // solo si envíos nacionales
  zone: DeliveryZone;
}
