import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus, Sparkles, Check, User, Building2, ArrowRight, ArrowLeft, Zap, Star, Shield, Clock } from "lucide-react";
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
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        
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

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Únete a miles de<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              nail artists exitosas
            </span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            La plataforma profesional que te ayuda a calcular precios justos y hacer crecer tu negocio.
          </p>

          {/* Benefits */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">15 días de prueba gratis</p>
                <p className="text-sm text-slate-400">Sin tarjeta de crédito requerida</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">Configuración en minutos</p>
                <p className="text-sm text-slate-400">Empieza a calcular precios hoy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <p className="font-semibold text-lg">Soporte personalizado</p>
                <p className="text-sm text-slate-400">Te ayudamos en cada paso</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 p-6 bg-white/5 rounded-2xl backdrop-blur border border-white/10">
            <p className="text-slate-300 italic mb-4">
              "NailCost me ayudó a entender cuánto realmente debo cobrar. Ahora gano 40% más en cada servicio."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">M</div>
              <div>
                <p className="font-medium">María González</p>
                <p className="text-xs text-slate-400">Nail Artist, Venezuela</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-white overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">NailCost <span className="text-pink-500">PRO</span></span>
            </div>
          </div>

          {/* Step 1: Select Type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Crea tu cuenta gratis</h2>
                <p className="text-slate-500">¿Cómo usarás NailCost?</p>
              </div>
              
              <div className="space-y-4">
                {/* Personal */}
                <button onClick={() => handleSelectType("personal")}
                  className="w-full group relative bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-pink-500 hover:shadow-xl transition-all text-left"
                  data-testid="select-personal">
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-pink-500 group-hover:bg-pink-500 transition-all flex items-center justify-center">
                    <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-7 h-7 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Personal / Freelancer</h3>
                      <p className="text-sm text-slate-500 mb-3">Trabajo independiente desde casa o a domicilio</p>
                      <div className="flex flex-wrap gap-2">
                        {["Calculadora rápida", "Agenda", "Clientes", "Reportes"].map(f => (
                          <span key={f} className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Desde</span>
                    <span className="text-lg font-bold text-slate-800">$5<span className="text-sm font-normal text-slate-400">/mes</span></span>
                  </div>
                </button>

                {/* Business */}
                <button onClick={() => handleSelectType("business")}
                  className="w-full group relative bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all text-left"
                  data-testid="select-business">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-2 py-1 rounded-full">POPULAR</span>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-all flex items-center justify-center">
                      <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 className="w-7 h-7 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-1">Salón / Negocio</h3>
                      <p className="text-sm text-slate-500 mb-3">Tengo local, empleados o múltiples estaciones</p>
                      <div className="flex flex-wrap gap-2">
                        {["Todo de Personal", "Empleados", "Inventario", "Contabilidad", "Nómina"].map(f => (
                          <span key={f} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Desde</span>
                    <span className="text-lg font-bold text-slate-800">$15<span className="text-sm font-normal text-slate-400">/mes</span></span>
                  </div>
                </button>
              </div>

              <p className="text-center text-slate-500 text-sm mt-6">
                ¿Ya tienes cuenta? <Link to="/login" className="text-pink-500 font-semibold hover:text-pink-600">Iniciar sesión</Link>
              </p>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 2 && (
            <div className="animate-fade-in">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-pink-500 mb-6">
                <ArrowLeft className="w-4 h-4" />Cambiar tipo de cuenta
              </button>

              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.user_type === 'business' ? 'bg-gradient-to-br from-indigo-500 to-violet-500' : 'bg-gradient-to-br from-pink-500 to-rose-500'}`}>
                    {formData.user_type === 'business' ? <Building2 className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Cuenta {formData.user_type === 'business' ? 'Negocio' : 'Personal'}</h2>
                    <p className="text-sm text-slate-500">Completa tus datos</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Nombre *</Label>
                      <Input value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Tu nombre" className="h-11 rounded-xl" data-testid="register-nombre-input" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">Teléfono</Label>
                      <Input value={formData.telefono} onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+58 412 123 4567" className="h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700">Correo Electrónico *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com" className="h-11 rounded-xl" data-testid="register-email-input" />
                  </div>

                  {formData.user_type === 'business' && (
                    <div className="space-y-2">
                      <Label className="text-slate-700">Nombre del Negocio *</Label>
                      <Input value={formData.nombre_negocio} onChange={(e) => setFormData(prev => ({ ...prev, nombre_negocio: e.target.value }))}
                        placeholder="Mi Salón de Uñas" className="h-11 rounded-xl" data-testid="register-negocio-input" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-700">Contraseña *</Label>
                      <Input type="password" value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Min. 6 caracteres" className="h-11 rounded-xl" data-testid="register-password-input" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700">Confirmar *</Label>
                      <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Repetir" className="h-11 rounded-xl" />
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 py-2">
                    <Checkbox id="terminos" checked={formData.aceptaTerminos}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, aceptaTerminos: checked }))}
                      className="mt-0.5" data-testid="accept-terms-checkbox" />
                    <label htmlFor="terminos" className="text-sm text-slate-500 cursor-pointer">
                      Acepto los <Link to="/terminos" target="_blank" className="text-pink-500 hover:underline">Términos</Link> y <Link to="/privacidad" target="_blank" className="text-pink-500 hover:underline">Privacidad</Link>
                    </label>
                  </div>

                  <Button type="submit" disabled={loading}
                    className={`w-full h-12 rounded-xl shadow-lg transition-all ${
                      formData.user_type === 'business' 
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600' 
                        : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'}`}
                    data-testid="register-submit-btn">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Crear Cuenta Gratis <ArrowRight className="w-5 h-5 ml-2" /></>}
                  </Button>

                  <p className="text-center text-xs text-slate-400 mt-4">
                    Tu cuenta será activada por un administrador. Recibirás 15 días de prueba gratis.
                  </p>
                </form>
              </div>

              <p className="text-center text-slate-500 text-sm mt-6">
                ¿Ya tienes cuenta? <Link to="/login" className="text-pink-500 font-semibold">Iniciar sesión</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { RegisterPage };
