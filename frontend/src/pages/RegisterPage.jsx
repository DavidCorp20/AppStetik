import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombre_negocio: "",
    telefono: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.password) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        nombre_negocio: formData.nombre_negocio,
        telefono: formData.telefono,
      });
      toast.success("Cuenta creada exitosamente!");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.detail || "Error al crear la cuenta";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Calcula precios profesionalmente",
    "Gestiona tus clientes y citas",
    "Reportes de rentabilidad",
    "Simulación de ingresos",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F5] to-[#F5F1EE] flex items-center justify-center p-4" data-testid="register-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-[#A17A8E]" />
            <span className="text-3xl font-bold text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
              NailCost PRO
            </span>
          </div>
          <p className="text-[#6B5E5C]">Crea tu cuenta gratis</p>
        </div>

        <Card className="bg-white border-[#E8E2DF] shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Registro
            </CardTitle>
            <CardDescription className="text-[#6B5E5C]">
              Comienza a calcular tus precios como profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-[#3D3231]">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E]"
                  data-testid="register-nombre-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#3D3231]">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E]"
                  data-testid="register-email-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#3D3231]">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E]"
                    data-testid="register-password-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#3D3231]">Confirmar *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repetir"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E]"
                    data-testid="register-confirm-password-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_negocio" className="text-[#3D3231]">Nombre del Negocio (opcional)</Label>
                <Input
                  id="nombre_negocio"
                  type="text"
                  placeholder="Mi Salón de Uñas"
                  value={formData.nombre_negocio}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_negocio: e.target.value }))}
                  className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E]"
                  data-testid="register-negocio-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono" className="text-[#3D3231]">Teléfono (opcional)</Label>
                <Input
                  id="telefono"
                  type="tel"
                  placeholder="+52 123 456 7890"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="rounded-xl border-[#E8E2DF] focus:border-[#A17A8E]"
                  data-testid="register-telefono-input"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A17A8E] hover:bg-[#8B6578] text-white rounded-full h-12"
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Crear Cuenta Gratis
              </Button>
            </form>

            {/* Features */}
            <div className="mt-6 pt-4 border-t border-[#F5F1EE]">
              <p className="text-xs text-[#6B5E5C] mb-2">Plan Básico incluye:</p>
              <div className="grid grid-cols-2 gap-1">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-1 text-xs text-[#6B5E5C]">
                    <Check className="w-3 h-3 text-[#7A9E7A]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-[#6B5E5C] text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-[#A17A8E] font-medium hover:underline" data-testid="goto-login-link">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RegisterPage };
