import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginUser } from "../services/auth.services"; // Crearemos esta función

type LoginForm = { email: string; password: string };

export default function LoginView() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ defaultValues: { email: "", password: "" } });

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      // 🚀 Llamada real a tu API
      const data = await loginUser({ email, password });

      // Guardamos info esencial en localStorage
      localStorage.setItem("user_role", data.user.rol);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      
      // Si usas tokens (JWT), guárdalo también
      if (data.token) localStorage.setItem("admin_token", data.token);

      toast.success(`¡Bienvenido de nuevo, ${data.user.nombre}!`);

      // 🔀 Redirección basada en el ROL que viene de la DB
      if (data.user.rol === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (data.user.rol === "DROPSHIPPER") {
        navigate("/dashboard-vendedor", { replace: true });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Credenciales inválidas";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-[70vh] grid place-content-center px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 text-center">
        Iniciar sesión
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 w-full max-w-md mx-auto rounded-2xl border border-stone-800 bg-[#1a1d1f] p-6 sm:p-8 shadow-xl"
        noValidate
      >
        {/* ... (tus inputs de email y password se mantienen exactamente igual) ... */}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Correo o Usuario
          </label>
          <input
            id="email"
            type="text"
            placeholder="ejemplo@gmail.com"
            className="w-full rounded-xl bg-[#0f1113] ring-1 ring-stone-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-stone-600"
            {...register("email", { required: "El usuario es obligatorio" })}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="mt-4 space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-xl bg-[#0f1113] ring-1 ring-stone-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-stone-600"
            {...register("password", { required: "La contraseña es obligatoria" })}
          />
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-[#6ee7b7] text-black font-semibold py-2.5 hover:bg-[#86f1c5] disabled:opacity-60"
        >
          {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
        </button>

        <div className="mt-6 text-center text-sm text-zinc-400">
          <Link to="/" className="hover:underline">Volver al inicio</Link>
        </div>
      </form>

      <nav className="mt-6 text-center">
        <Link className="text-zinc-300 text-sm hover:underline" to="/auth/register">
          ¿No tienes una cuenta? Regístrate aquí
        </Link>
      </nav>
    </div>
  );
}