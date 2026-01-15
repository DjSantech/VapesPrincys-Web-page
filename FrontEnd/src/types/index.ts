

export type User = {
    handle: string
    name: string
    email: string
}

export type DropshipperRegisterForm = {
    nombre: string
    apellido: string
    cedula: string
    email: string
    celular: string
    fechaNacimiento: string
    direccion: string
    password: string
    confirmPassword: string
}
// Datos que envías al servidor
export type LoginCredentials = {
  email: string;
  password: string;
};

// Estructura del usuario que devuelve el backend
export type AuthUser = {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'DROPSHIPPER';
  referralCode?: string; // Opcional porque el Admin podría no tener uno
};

// Respuesta completa del Login
export type AuthResponse = {
  ok: boolean;
  token: string;
  user: AuthUser;
  message?: string;
};