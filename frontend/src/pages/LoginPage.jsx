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
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F5] to-[#F5F1EE] flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-[#A17A8E]" />
            <span className="text-3xl font-bold text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
              NailCost PRO
            </span>
          </div>
          <p className="text-[#6B5E5C]">Tu calculadora inteligente de costos</p>
        </div>

        <Card className="bg-white border-[#E8E2DF] shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-[#6B5E5C]">
              Ingresa a tu cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#3D3231]">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E] focus:ring-[#A17A8E]"
                  data-testid="login-email-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#3D3231]">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E] focus:ring-[#A17A8E]"
                  data-testid="login-password-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A17A8E] hover:bg-[#8B6578] text-white rounded-full h-12"
                data-testid="login-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Iniciar Sesión
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#6B5E5C] text-sm">
                ¿No tienes cuenta?{" "}
                <Link to="/registro" className="text-[#A17A8E] font-medium hover:underline" data-testid="goto-register-link">
                  Regístrate gratis
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[#9C8B7E] text-xs mt-6">
          Calculadora profesional para nail artists
        </p>
      </div>
    </div>
  );
}

export { LoginPage };
