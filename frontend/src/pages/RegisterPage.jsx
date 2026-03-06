import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Sparkles, Check, User, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombre_negocio: "",
    telefono: "",
    user_type: "",
  });

  const handleSelectType = (type) => {
    setFormData(prev => ({ ...prev, user_type: type }));
    setStep(2);
  };

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
        user_type: formData.user_type,
      });
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/");
    } catch (err) {
      const message = err.response?.data?.detail || "Error al crear la cuenta";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const personalFeatures = [
    "Calculadora de precios rápida",
    "Gestión de clientes básica",
    "Agenda personal",
    "Reportes simples",
  ];

  const businessFeatures = [
    "Todo de Personal +",
    "Gestión de empleados",
    "Alertas de inventario",
    "Reportes por empleado",
    "Métricas de negocio",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FDF2F7] to-[#FFE4EE] flex items-center justify-center p-4" data-testid="register-page">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg shadow-[#E84A8A]/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              NailCost PRO
            </span>
          </div>
          <p className="text-[#64748B]">Crea tu cuenta gratis</p>
        </div>

        {/* Step 1: Select User Type */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-semibold text-center text-[#1A1A2E] mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              ¿Cómo usarás NailCost?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Option */}
              <button
                onClick={() => handleSelectType("personal")}
                className="group relative bg-white rounded-3xl p-6 border-2 border-[#FCE7F0] hover:border-[#E84A8A] hover:shadow-xl transition-all duration-300 text-left"
                data-testid="select-personal"
              >
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-[#FCE7F0] group-hover:border-[#E84A8A] group-hover:bg-[#E84A8A] transition-all flex items-center justify-center">
                  <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E84A8A]/20 to-[#FF6B9D]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-[#E84A8A]" />
                </div>
                
                <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">Personal</h3>
                <p className="text-sm text-[#64748B] mb-4">
                  Soy nail artist independiente o freelancer
                </p>
                
                <ul className="space-y-2">
                  {personalFeatures.map((f, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-center gap-2">
                      <Check className="w-3 h-3 text-[#E84A8A]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>

              {/* Business Option */}
              <button
                onClick={() => handleSelectType("business")}
                className="group relative bg-white rounded-3xl p-6 border-2 border-[#FCE7F0] hover:border-[#8B5CF6] hover:shadow-xl transition-all duration-300 text-left"
                data-testid="select-business"
              >
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-[#FCE7F0] group-hover:border-[#8B5CF6] group-hover:bg-[#8B5CF6] transition-all flex items-center justify-center">
                  <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                </div>
                
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white px-2 py-1 rounded-full">
                    RECOMENDADO
                  </span>
                </div>
                
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#A78BFA]/20 flex items-center justify-center mb-4 mt-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                
                <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">Negocio</h3>
                <p className="text-sm text-[#64748B] mb-4">
                  Tengo un salón, estética o equipo de trabajo
                </p>
                
                <ul className="space-y-2">
                  {businessFeatures.map((f, i) => (
                    <li key={i} className="text-xs text-[#64748B] flex items-center gap-2">
                      <Check className="w-3 h-3 text-[#8B5CF6]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[#64748B] text-sm">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-[#E84A8A] font-semibold hover:underline">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <Card className="bg-white/80 backdrop-blur border-[#FCE7F0] shadow-2xl shadow-[#E84A8A]/10 rounded-3xl animate-fade-in">
            <CardHeader className="pb-2">
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#E84A8A] mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Cambiar tipo de cuenta
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  formData.user_type === 'business' 
                    ? 'bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]' 
                    : 'bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D]'
                }`}>
                  {formData.user_type === 'business' ? (
                    <Building2 className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Cuenta {formData.user_type === 'business' ? 'Negocio' : 'Personal'}
                  </CardTitle>
                  <CardDescription className="text-[#64748B]">
                    Completa tus datos para continuar
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-[#1A1A2E]">Nombre *</Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] h-12"
                      data-testid="register-nombre-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1A1A2E]">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] h-12"
                      data-testid="register-email-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#1A1A2E]">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] h-12"
                      data-testid="register-password-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#1A1A2E]">Confirmar Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repetir contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] h-12"
                      data-testid="register-confirm-password-input"
                    />
                  </div>
                </div>

                {formData.user_type === 'business' && (
                  <div className="space-y-2">
                    <Label htmlFor="nombre_negocio" className="text-[#1A1A2E]">Nombre del Negocio *</Label>
                    <Input
                      id="nombre_negocio"
                      type="text"
                      placeholder="Mi Salón de Uñas"
                      value={formData.nombre_negocio}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre_negocio: e.target.value }))}
                      className="rounded-xl border-[#FCE7F0] focus:border-[#8B5CF6] h-12"
                      data-testid="register-negocio-input"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-[#1A1A2E]">Teléfono (opcional)</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+52 123 456 7890"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    className="rounded-xl border-[#FCE7F0] focus:border-[#E84A8A] h-12"
                    data-testid="register-telefono-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white rounded-full h-12 shadow-lg ${
                    formData.user_type === 'business'
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] shadow-[#8B5CF6]/30'
                      : 'bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] hover:from-[#D63A7A] hover:to-[#E84A8A] shadow-[#E84A8A]/30'
                  }`}
                  data-testid="register-submit-btn"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="w-5 h-5 mr-2" />
                  )}
                  Crear Cuenta Gratis
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-[#64748B] text-sm">
                  ¿Ya tienes cuenta?{" "}
                  <Link to="/login" className="text-[#E84A8A] font-semibold hover:underline" data-testid="goto-login-link">
                    Iniciar sesión
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export { RegisterPage };
