// src/types/slug.d.ts
declare module "slug" {
  export interface SlugOptions {
    lower?: boolean;        // pasar a minúsculas
    replacement?: string;   // carácter de reemplazo, por defecto "-"
    locale?: string;        // "es", "en", etc.
    remove?: RegExp;        // regex para remover caracteres
    trim?: boolean;         // recortar espacios
  }
  const id = slug(nombre, { lower: true, locale: "es" });
  const slug: (input: string, opts?: SlugOptions) => string;
  export default slug;
}
