/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  login,
  forgotPassword,
  checkActiveSession,
} from "../../api/auth.service";
import { Lock, Mail, Bus, Check } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [darkMode, setDarkMode] = useState(true);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.email === "" || form.password === "") {
      console.log("Los campos no deben de estar vacíos");
    } else {
      setLoading(true);
      const auth = await login(form.email, form.password);
      setLoading(false);
      if (auth.authenticated === true) navigate("/home");
    }
  };

  const verifySession = async () => {
    const session = await checkActiveSession();
    if (session.uid != null) {
      navigate("/home");
    }
  };

  useEffect(() => {
    setDarkMode(true);
    localStorage.setItem("darkMode", true);
    document.documentElement.classList.add("dark");
    verifySession();
  }, []);

  const handleForgetPass = async () => {
    await forgotPassword(form.email);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-900">
      {/* Lado izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 relative overflow-hidden">
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} 
          />
        </div>

        {/* Contenido del branding */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-8 lg:p-12 text-white">
          <div className="max-w-lg space-y-8">
            {/* Logo/Icono */}
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 shadow-2xl">
                <Bus className="h-16 w-16 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Título y descripción */}
            <div className="text-center space-y-3">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Bus Ledger
              </h1>
              <p className="text-lg lg:text-xl text-indigo-100 font-medium">
                Sistema de Gestión de Transporte Escolar
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-6">
              <div className="flex items-start gap-4 group">
                <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20 group-hover:bg-white/20 transition-all">
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Gestión de Alumnos</h3>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    Administra estudiantes y pagos eficientemente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20 group-hover:bg-white/20 transition-all">
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Control de Unidades</h3>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    Monitorea tus buses y rutas en tiempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg border border-white/20 group-hover:bg-white/20 transition-all">
                  <Check className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Reportes Financieros</h3>
                  <p className="text-sm text-indigo-100 leading-relaxed">
                    Visualiza ingresos y gastos detalladamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario de login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo móvil */}
          <div className="lg:hidden flex justify-center">
            <div className="bg-indigo-600 p-4 rounded-xl shadow-lg">
              <Bus className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">
              Bienvenido
            </h2>
            <p className="text-base text-gray-400">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    theme={darkMode}
                    className="pl-11 w-full"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    theme={darkMode}
                    className="pl-11 w-full"
                  />
                </div>
              </div>

              {/* Botón de submit */}
              <Button
                loading={loading}
                text="Iniciar sesión"
                type="submit"
                className="w-full !bg-indigo-600 hover:!bg-indigo-700 !py-3"
              />
            </form>

            {/* Forgot password */}
            <div className="mt-6 text-center">
              <button
                onClick={handleForgetPass}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500">
            © 2026 Bus Ledger. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};