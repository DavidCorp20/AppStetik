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
  ArrowRight
} from "lucide-react";

const TUTORIAL_KEY = "nailcost_tutorial_completed";

const tutorialSteps = [
  {
    title: "¡Bienvenido a NailCost!",
    description: "Te ayudaremos a calcular precios justos para tus servicios de uñas. Sigue estos pasos para empezar.",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    action: null,
  },
  {
    title: "1. Registra tus Productos",
    description: "Añade los esmaltes, acrílicos y materiales que usas. Incluye el precio de compra y cantidad.",
    icon: Package,
    color: "from-blue-500 to-cyan-500",
    action: "/productos",
    actionLabel: "Ir a Productos",
  },
  {
    title: "2. Crea tus Estilos",
    description: "Define los servicios que ofreces: manicure, acrílico, gel, etc. Indica el tiempo que te toma cada uno.",
    icon: Palette,
    color: "from-violet-500 to-purple-500",
    action: "/estilos",
    actionLabel: "Ir a Estilos",
  },
  {
    title: "3. Registra tus Clientes",
    description: "Guarda la información de tus clientas para llevar un mejor control de tu negocio.",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    action: "/clientes",
    actionLabel: "Ir a Clientes",
  },
  {
    title: "4. Calcula tus Precios",
    description: "Usa la calculadora para obtener precios justos basados en tus costos reales.",
    icon: Calculator,
    color: "from-amber-500 to-orange-500",
    action: "/calculadora",
    actionLabel: "Ir a Calculadora",
  },
  {
    title: "¡Listo para empezar!",
    description: "Ya conoces lo básico. Explora las demás funciones como reportes, inventario y simulación.",
    icon: CheckCircle,
    color: "from-green-500 to-emerald-500",
    action: null,
  },
];

export function TutorialModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
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
    localStorage.setItem(TUTORIAL_KEY, "true");
    onClose();
  };

  const handleAction = (action) => {
    handleComplete();
    navigate(action);
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 overflow-hidden animate-scale-in">
        {/* Header Gradient */}
        <div className={`h-32 bg-gradient-to-br ${step.color} flex items-center justify-center relative`}>
          <button 
            onClick={handleComplete}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        <CardContent className="p-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-pink-500' : idx < currentStep ? 'bg-pink-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600">{step.description}</p>
          </div>

          {/* Action Button */}
          {step.action && (
            <Button 
              onClick={() => handleAction(step.action)}
              className={`w-full mb-4 bg-gradient-to-r ${step.color} text-white rounded-full`}
            >
              {step.actionLabel}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-gray-500"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            {currentStep === tutorialSteps.length - 1 ? (
              <Button onClick={handleComplete} className="bg-green-500 hover:bg-green-600 text-white rounded-full">
                Comenzar
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} variant="outline" className="rounded-full">
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Skip */}
          <button 
            onClick={handleComplete}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Saltar tutorial
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check if tutorial should show
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_KEY);
    if (!completed) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TUTORIAL_KEY, "true");
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY);
    setShowTutorial(true);
  };

  return { showTutorial, closeTutorial, resetTutorial };
}

export default TutorialModal;
