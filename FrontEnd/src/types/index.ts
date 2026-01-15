

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
export type LoginForm = Pick<User, 'email'> & {
    password: string
}