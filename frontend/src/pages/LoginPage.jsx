import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Bienvenida de vuelta!");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.detail || "Error al iniciar sesión";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FDF2F7] to-[#FFE4EE] flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg shadow-[#E84A8A]/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              NailCost PRO
            </span>
          </div>
          <p className="text-[#64748B]">Tu calculadora inteligente de costos</p>
        </div>

        <Card className="bg-white/80 backdrop-blur border-[#FCE7F0] shadow-2xl shadow-[#E84A8A]/10 rounded-3xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              Ingresa a tu cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1A1A2E]">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] focus:ring-[#E84A8A] h-12"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#1A1A2E]">Contraseña</Label>
                  <Link 
                    to="/recuperar-contrasena" 
                    className="text-xs text-[#E84A8A] hover:underline"
                    data-testid="forgot-password-link"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] focus:ring-[#E84A8A] h-12"
                  data-testid="login-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] hover:from-[#D63A7A] hover:to-[#E84A8A] text-white rounded-full h-12 shadow-lg shadow-[#E84A8A]/30"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#64748B] text-sm">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="text-[#E84A8A] font-semibold hover:underline" data-testid="goto-register-link">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[#94A3B8] text-xs mt-6">
          Calculadora profesional para nail artists
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link to="/terminos" className="text-xs text-[#94A3B8] hover:text-[#E84A8A]">
            Términos
          </Link>
          <span className="text-[#CBD5E1]">•</span>
          <Link to="/privacidad" className="text-xs text-[#94A3B8] hover:text-[#E84A8A]">
            Privacidad
          </Link>
        </div>
      </div>
    </div>
  );
}

export { LoginPage };
