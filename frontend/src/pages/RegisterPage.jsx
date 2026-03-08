import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus, Sparkles, Check, User, Building2, ArrowRight, ArrowLeft, Zap, Star, Shield, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "", email: "", password: "", confirmPassword: "",
    nombre_negocio: "", telefono: "", user_type: "", aceptaTerminos: false,
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
    if (!formData.aceptaTerminos) {
      toast.error("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: formData.nombre, email: formData.email, password: formData.password,
        nombre_negocio: formData.nombre_negocio, telefono: formData.telefono, user_type: formData.user_type,
      });
      toast.success("¡Cuenta creada! Un administrador la activará pronto.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="register-page">
      {/* Left Panel - Professional Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        
        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">NailCost</h1>
              <span className="text-cyan-400 text-sm font-medium">PRO</span>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Únete a miles de<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              nail artists exitosas
            </span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            La plataforma profesional que te ayuda a calcular precios justos y hacer crecer tu negocio.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold">15 días de prueba gratis</p>
                <p className="text-sm text-slate-500">Sin tarjeta de crédito requerida</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Setup en minutos</p>
                <p className="text-sm text-slate-500">Configura tu cuenta en 5 minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold">Soporte personalizado</p>
                <p className="text-sm text-slate-500">Te ayudamos en cada paso</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-10 p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
            <p className="text-slate-300 text-sm italic mb-3">
              "NailCost me ayudó a organizar mi negocio y ahora sé exactamente cuánto cobrar por cada servicio."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <div>
                <p className="text-sm font-medium text-white">María G.</p>
                <p className="text-xs text-slate-500">Nail Artist, Caracas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-slate-800">NailCost</span>
                <span className="text-cyan-500 text-sm font-medium ml-1">PRO</span>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : "1"}
            </div>
            <div className={`w-16 h-1 rounded ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>
              2
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            {step === 1 ? (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">¿Cómo usarás NailCost?</h2>
                  <p className="text-slate-500">Selecciona el tipo de cuenta</p>
                </div>

                <div className="space-y-4">
                  {/* Personal */}
                  <button
                    onClick={() => handleSelectType("personal")}
                    className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-violet-500 hover:bg-violet-50 transition-all group text-left"
                    data-testid="select-personal"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-700">Emprendedora</h3>
                        <p className="text-sm text-slate-500">Trabajo desde casa o independiente</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">Desde $5/mes</span>
                          <span className="text-xs text-slate-400">Ideal para iniciar</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>

                  {/* Business */}
                  <button
                    onClick={() => handleSelectType("business")}
                    className="w-full p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                    data-testid="select-business"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700">Salón / Comercio</h3>
                        <p className="text-sm text-slate-500">Local comercial con empleados</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Desde $15/mes</span>
                          <span className="text-xs text-slate-400">Funciones avanzadas</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-slate-500">
                    ¿Ya tienes cuenta?{" "}
                    <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                      Inicia sesión
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 ${formData.user_type === "personal" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                    {formData.user_type === "personal" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {formData.user_type === "personal" ? "Cuenta Personal" : "Cuenta Comercio"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Crea tu cuenta</h2>
                  <p className="text-slate-500 text-sm">Completa tus datos para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="nombre" className="text-slate-700 text-sm font-medium">Tu nombre *</Label>
                      <Input
                        id="nombre"
                        placeholder="María García"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-500"
                        data-testid="register-name-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="telefono" className="text-slate-700 text-sm font-medium">Teléfono</Label>
                      <Input
                        id="telefono"
                        placeholder="0412-1234567"
                        value={formData.telefono}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {formData.user_type === "business" && (
                    <div className="space-y-1.5">
                      <Label htmlFor="nombre_negocio" className="text-slate-700 text-sm font-medium">Nombre del negocio *</Label>
                      <Input
                        id="nombre_negocio"
                        placeholder="Glamour Nails Spa"
                        value={formData.nombre_negocio}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre_negocio: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-slate-700 text-sm font-medium">Correo electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200 focus:border-blue-500"
                      data-testid="register-email-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-slate-700 text-sm font-medium">Contraseña *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-500"
                        data-testid="register-password-input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-slate-700 text-sm font-medium">Confirmar *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="h-11 rounded-xl border-slate-200 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={formData.aceptaTerminos}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aceptaTerminos: checked }))}
                      className="mt-0.5 data-[state=checked]:bg-blue-600"
                      data-testid="register-terms-checkbox"
                    />
                    <Label htmlFor="terms" className="text-sm text-slate-600 leading-tight cursor-pointer">
                      Acepto los <Link to="/terminos" className="text-blue-600 hover:underline">términos</Link> y la <Link to="/privacidad" className="text-blue-600 hover:underline">política de privacidad</Link>
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-11 rounded-xl border-slate-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 h-11 rounded-xl text-white shadow-lg transition-all ${formData.user_type === "personal" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 shadow-violet-500/25" : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-blue-500/25"}`}
                      data-testid="register-submit-btn"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Crear cuenta<ArrowRight className="w-5 h-5 ml-2" /></>}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-slate-400">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Trial 15 días gratis</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Datos seguros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RegisterPage };
