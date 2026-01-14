// src/views/RegisterView.tsx
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type RegisterForm = {
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  celular: string;
  fechaNacimiento: string;
  direccion: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterView() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  // Validación de edad (Mínimo 18 años recomendado para vapes, pero ajustado a 12 según pediste)
  const validarEdad = (fecha: string) => {
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad >= 12 || "Debes ser mayor de 12 años";
  };

  const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080/api";
    
  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`¡Bienvenido! Tu código de vendedor es: ${result.referralCode}`);
        navigate("/auth/login");
      } else {
        toast.error(result.message || "Error al registrarse");
      }
    } catch  {
      toast.error("No se pudo conectar con el servidor");
    }
  };

  const inputStyle = "w-full rounded-xl bg-[#0f1113] ring-1 ring-stone-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-stone-600";
  const labelStyle = "text-sm font-medium text-zinc-300";

  return (
    <div className="min-h-screen py-10 grid place-content-center px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-center">
        Únete como Dropshipper
      </h1>
      <p className="text-zinc-400 text-center mt-2 text-sm">Crea tu cuenta para obtener tu link de vendedor</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 w-full max-w-2xl mx-auto rounded-2xl border border-stone-800 bg-[#1a1d1f] p-6 sm:p-8 shadow-xl"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className={labelStyle}>Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              className={inputStyle}
              {...register("nombre", { required: "Campo obligatorio" })}
            />
            {errors.nombre && <p className="text-xs text-red-400">{errors.nombre.message}</p>}
          </div>

          {/* Apellido */}
          <div className="space-y-1">
            <label className={labelStyle}>Apellido</label>
            <input
              type="text"
              placeholder="Tu apellido"
              className={inputStyle}
              {...register("apellido", { required: "Campo obligatorio" })}
            />
            {errors.apellido && <p className="text-xs text-red-400">{errors.apellido.message}</p>}
          </div>

          {/* Cédula */}
          <div className="space-y-1">
            <label className={labelStyle}>Cédula / ID</label>
            <input
              type="text"
              placeholder="Número de documento"
              className={inputStyle}
              {...register("cedula", { required: "Campo obligatorio" })}
            />
            {errors.cedula && <p className="text-xs text-red-400">{errors.cedula.message}</p>}
          </div>

          {/* Celular */}
          <div className="space-y-1">
            <label className={labelStyle}>Celular (10 dígitos)</label>
            <input
              type="tel"
              placeholder="3001234567"
              className={inputStyle}
              {...register("celular", { 
                required: "Campo obligatorio",
                pattern: { value: /^[0-9]{10}$/, message: "Debe tener 10 dígitos" }
              })}
            />
            {errors.celular && <p className="text-xs text-red-400">{errors.celular.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1 md:col-span-2">
            <label className={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              placeholder="usuario@gmail.com"
              className={inputStyle}
              {...register("email", { 
                required: "Campo obligatorio",
                pattern: { 
                    value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/, 
                    message: "Solo se permiten correos de @gmail.com" 
                }
              })}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Fecha de Nacimiento */}
          <div className="space-y-1">
            <label className={labelStyle}>Fecha de Nacimiento</label>
            <input
              type="date"
              className={inputStyle}
              {...register("fechaNacimiento", { 
                required: "Campo obligatorio",
                validate: validarEdad
              })}
            />
            {errors.fechaNacimiento && <p className="text-xs text-red-400">{errors.fechaNacimiento.message}</p>}
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className={labelStyle}>Dirección</label>
            <input
              type="text"
              placeholder="Calle 123 #..."
              className={inputStyle}
              {...register("direccion", { required: "Campo obligatorio" })}
            />
            {errors.direccion && <p className="text-xs text-red-400">{errors.direccion.message}</p>}
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className={labelStyle}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputStyle}
              {...register("password", { 
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Mínimo 6 caracteres" }
              })}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          {/* Confirmar Contraseña */}
          <div className="space-y-1">
            <label className={labelStyle}>Confirmar Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputStyle}
              {...register("confirmPassword", { 
                required: "Confirme su contraseña",
                validate: (value) => value === watch("password") || "Las contraseñas no coinciden"
              })}
            />
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-8 w-full rounded-xl bg-[#6ee7b7] text-black font-semibold py-2.5 hover:bg-[#86f1c5] disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? "Procesando..." : "Registrarme como Vendedor"}
        </button>

        <div className="mt-6 text-center text-sm text-zinc-400">
          <Link to="/auth/login" className="hover:underline">¿Ya tienes cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
}