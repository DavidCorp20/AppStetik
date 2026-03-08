import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Package, 
  Palette, 
  Users, 
  Calculator, 
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Calendar,
  Receipt,
  TrendingUp,
  Building2,
  UserCheck,
  Target,
  Clock,
  DollarSign,
  Box
} from "lucide-react";

const PERSONA_TUTORIAL_KEY = "nailcost_persona_tutorial_completed";
const COMERCIO_TUTORIAL_KEY = "nailcost_comercio_tutorial_completed";

// Tutorial steps for Persona (individual)
const personaTutorialSteps = [
  {
    title: "Bienvenida a NailCost",
    description: "Tu herramienta para calcular precios justos y manejar tu negocio de unas. Te guiaremos paso a paso.",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    action: null,
  },
  {
    title: "Paso 1: Productos",
    description: "Registra los esmaltes, acrílicos y materiales que usas. Incluye el precio de compra para calcular tus costos reales.",
    icon: Package,
    color: "from-blue-500 to-cyan-500",
    action: "/productos",
    actionLabel: "Ir a Productos",
  },
  {
    title: "Paso 2: Estilos de Servicio",
    description: "Define los servicios que ofreces: manicure básico, acrílico, gel, etc. Indica cuánto tiempo te toma cada uno.",
    icon: Palette,
    color: "from-violet-500 to-purple-500",
    action: "/estilos",
    actionLabel: "Ir a Estilos",
  },
  {
    title: "Paso 3: Tus Clientes",
    description: "Guarda la información de tus clientas para recordar sus preferencias y llevar un mejor control.",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    action: "/clientes",
    actionLabel: "Ir a Clientes",
  },
  {
    title: "Paso 4: Gastos Operativos",
    description: "Registra tus gastos fijos: renta, luz, internet. Esto se incluye en el cálculo de precios.",
    icon: Receipt,
    color: "from-amber-500 to-orange-500",
    action: "/gastos",
    actionLabel: "Ir a Gastos",
  },
  {
    title: "Paso 5: Calcular Precios",
    description: "Usa la calculadora para obtener precios basados en tus costos reales. Incluye materiales, tiempo y gastos.",
    icon: Calculator,
    color: "from-rose-500 to-pink-500",
    action: "/calculadora",
    actionLabel: "Ir a Calculadora",
  },
  {
    title: "Lista para empezar",
    description: "Ya conoces lo básico. Explora el inventario, agenda de citas, reportes y simulación de ingresos.",
    icon: CheckCircle,
    color: "from-green-500 to-emerald-500",
    action: null,
  },
];

// Tutorial steps for Comercio (business)
const comercioTutorialSteps = [
  {
    title: "Bienvenido a NailCost Business",
    description: "La solución completa para gestionar tu salón o spa de uñas. Administra equipo, inventario y finanzas desde un solo lugar.",
    icon: Building2,
    color: "from-blue-600 to-cyan-600",
    action: null,
  },
  {
    title: "Paso 1: Productos e Inventario",
    description: "Registra todos tus productos y materiales. El sistema te alertará cuando el stock esté bajo.",
    icon: Package,
    color: "from-violet-500 to-indigo-500",
    action: "/productos",
    actionLabel: "Ir a Productos",
  },
  {
    title: "Paso 2: Control de Inventario",
    description: "Gestiona entradas y salidas de stock. Exporta reportes y mantén control total de tu inventario.",
    icon: Box,
    color: "from-emerald-500 to-teal-500",
    action: "/inventario",
    actionLabel: "Ir a Inventario",
  },
  {
    title: "Paso 3: Tu Equipo",
    description: "Agrega a tus empleados, asigna especialidades y gestiona su disponibilidad para las citas.",
    icon: UserCheck,
    color: "from-amber-500 to-orange-500",
    action: "/empleados",
    actionLabel: "Ir a Empleados",
  },
  {
    title: "Paso 4: Servicios y Precios",
    description: "Define los estilos y servicios que ofrece tu negocio. Establece tiempos y precios base.",
    icon: Palette,
    color: "from-pink-500 to-rose-500",
    action: "/estilos",
    actionLabel: "Ir a Estilos",
  },
  {
    title: "Paso 5: Agenda de Citas",
    description: "Organiza las citas de tus clientes. Visualiza el calendario y evita conflictos de horarios.",
    icon: Calendar,
    color: "from-blue-500 to-indigo-500",
    action: "/agenda",
    actionLabel: "Ir a Agenda",
  },
  {
    title: "Paso 6: Facturación",
    description: "Genera facturas profesionales para tus clientes con IVA incluido y todos los detalles fiscales.",
    icon: Receipt,
    color: "from-slate-600 to-slate-700",
    action: "/facturacion",
    actionLabel: "Ir a Facturación",
  },
  {
    title: "Paso 7: Gastos y Finanzas",
    description: "Registra gastos operativos, revisa ganancias y establece metas mensuales de ingresos.",
    icon: DollarSign,
    color: "from-emerald-600 to-green-600",
    action: "/gastos",
    actionLabel: "Ir a Gastos",
  },
  {
    title: "Paso 8: Reportes y Análisis",
    description: "Consulta reportes detallados, compara meses y usa el simulador para proyectar ingresos.",
    icon: BarChart3,
    color: "from-cyan-500 to-blue-500",
    action: "/reportes-financieros",
    actionLabel: "Ver Reportes",
  },
  {
    title: "Todo listo",
    description: "Tu negocio está configurado. Usa el cotizador para calcular precios y revisa el dashboard para ver tu progreso.",
    icon: CheckCircle,
    color: "from-green-500 to-emerald-500",
    action: null,
  },
];

export function TutorialModal({ isOpen, onClose, variant = "persona" }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = variant === "comercio" ? comercioTutorialSteps : personaTutorialSteps;
  const storageKey = variant === "comercio" ? COMERCIO_TUTORIAL_KEY : PERSONA_TUTORIAL_KEY;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(storageKey, "true");
    onClose();
  };

  const handleAction = (action) => {
    handleComplete();
    navigate(action);
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  
  // Theme colors based on variant
  const themeColors = variant === "comercio" 
    ? { 
        bg: "bg-slate-50", 
        progress: "bg-blue-500", 
        progressBg: "bg-slate-200",
        text: "text-slate-900",
        subtext: "text-slate-600",
        skipText: "text-slate-400 hover:text-slate-600"
      }
    : { 
        bg: "bg-white", 
        progress: "bg-pink-500", 
        progressBg: "bg-gray-200",
        text: "text-gray-900",
        subtext: "text-gray-600",
        skipText: "text-gray-400 hover:text-gray-600"
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid="tutorial-modal">
      <Card className={`w-full max-w-md ${themeColors.bg} shadow-2xl border-0 overflow-hidden animate-scale-in`}>
        {/* Header Gradient */}
        <div className={`h-36 bg-gradient-to-br ${step.color} flex items-center justify-center relative`}>
          <button 
            onClick={handleComplete}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            data-testid="tutorial-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-10 h-10 text-white" />
          </div>
          
          {/* Step indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/20 px-3 py-1 rounded-full">
            <span className="text-white text-xs font-medium">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Progress Bar */}
          <div className={`w-full h-1.5 ${themeColors.progressBg} rounded-full mb-6 overflow-hidden`}>
            <div 
              className={`h-full ${themeColors.progress} rounded-full transition-all duration-500`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className={`text-xl font-bold ${themeColors.text} mb-3`}>{step.title}</h2>
            <p className={themeColors.subtext}>{step.description}</p>
          </div>

          {/* Action Button */}
          {step.action && (
            <Button 
              onClick={() => handleAction(step.action)}
              className={`w-full mb-4 bg-gradient-to-r ${step.color} text-white rounded-xl h-12 text-base font-medium hover:opacity-90 transition-opacity`}
              data-testid="tutorial-action-btn"
            >
              {step.actionLabel}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`${themeColors.subtext} ${currentStep === 0 ? 'opacity-50' : ''}`}
              data-testid="tutorial-prev-btn"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleComplete} 
                className={`bg-gradient-to-r ${step.color} text-white rounded-xl px-6`}
                data-testid="tutorial-finish-btn"
              >
                Comenzar
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                variant="outline" 
                className="rounded-xl px-6"
                data-testid="tutorial-next-btn"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Skip */}
          <button 
            onClick={handleComplete}
            className={`w-full mt-4 text-sm ${themeColors.skipText} transition-colors`}
            data-testid="tutorial-skip-btn"
          >
            Saltar tutorial
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for Persona tutorial
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(PERSONA_TUTORIAL_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(PERSONA_TUTORIAL_KEY, "true");
  };

  const resetTutorial = () => {
    localStorage.removeItem(PERSONA_TUTORIAL_KEY);
    setShowTutorial(true);
  };

  return { showTutorial, closeTutorial, resetTutorial };
}

// Hook for Comercio tutorial  
export function useComercioTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(COMERCIO_TUTORIAL_KEY);
    if (!completed) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(COMERCIO_TUTORIAL_KEY, "true");
  };

  const resetTutorial = () => {
    localStorage.removeItem(COMERCIO_TUTORIAL_KEY);
    setShowTutorial(true);
  };

  return { showTutorial, closeTutorial, resetTutorial };
}

export default TutorialModal;
