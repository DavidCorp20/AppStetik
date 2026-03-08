import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Sparkles, Building2, User, ArrowRight, Shield, Star, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("¡Bienvenido de vuelta!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">NailCost</h1>
              <span className="text-pink-400 text-sm font-medium">PRO</span>
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Gestiona tu negocio<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">
              de forma inteligente
            </span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            La herramienta profesional para calcular costos, gestionar clientes y hacer crecer tu negocio de uñas.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="font-medium">Cálculo automático de precios</p>
                <p className="text-sm text-slate-500">Precios justos basados en tus costos reales</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Gestión de negocio completa</p>
                <p className="text-sm text-slate-500">Clientes, agenda, inventario y más</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Reportes y análisis</p>
                <p className="text-sm text-slate-500">Visualiza tus ganancias y crecimiento</p>
              </div>
            </div>
          </div>

          {/* User Types */}
          <div className="mt-12 flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur">
              <User className="w-4 h-4 text-pink-400" />
              <span className="text-sm">Emprendedoras</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Salones</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-800">NailCost</span>
                <span className="text-pink-500 text-sm font-medium ml-1">PRO</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Bienvenido</h2>
              <p className="text-slate-500">Ingresa a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-12 rounded-xl border-slate-200 focus:border-pink-500 focus:ring-pink-500/20"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                  <Link to="/recuperar-contrasena" className="text-sm text-pink-500 hover:text-pink-600">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="h-12 rounded-xl border-slate-200 focus:border-pink-500 focus:ring-pink-500/20"
                  data-testid="login-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-pink-500/25 transition-all duration-200"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="text-pink-500 font-semibold hover:text-pink-600">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm mb-3">
              Plataforma profesional para nail artists
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/terminos" className="text-xs text-slate-400 hover:text-pink-500">
                Términos de Servicio
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/privacidad" className="text-xs text-slate-400 hover:text-pink-500">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { LoginPage };
