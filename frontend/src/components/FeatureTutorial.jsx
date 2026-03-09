import { useState, useEffect } from "react";
import { X, Info, Lightbulb, ChevronRight, ChevronLeft, CheckCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURE_TIPS_KEY = "nailcost_feature_tips_seen";

// Feature-specific tutorials
const FEATURE_TUTORIALS = {
  productos: {
    title: "Productos",
    color: "from-blue-500 to-cyan-500",
    icon: "📦",
    steps: [
      {
        title: "¿Qué son los Productos?",
        content: "Aquí registras todos los materiales que usas: esmaltes, acrílicos, decoraciones, herramientas, etc."
      },
      {
        title: "Precio de Compra",
        content: "Ingresa cuánto pagaste por el producto. Esto ayuda a calcular tus costos reales por servicio."
      },
      {
        title: "Cantidad y Uso",
        content: "Indica cuántas unidades compraste y cuánto usas por servicio. El sistema calculará el costo por aplicación."
      },
      {
        title: "Tip Pro",
        content: "Actualiza los precios cuando compres nuevo inventario. Los precios cambian y tus cálculos deben ser precisos."
      }
    ]
  },
  estilos: {
    title: "Estilos de Servicio",
    color: "from-violet-500 to-purple-500",
    icon: "💅",
    steps: [
      {
        title: "Define tus Servicios",
        content: "Crea los tipos de servicios que ofreces: manicure básico, acrílico, gel, diseños especiales, etc."
      },
      {
        title: "Asocia Productos",
        content: "Vincula qué productos usas en cada servicio. El sistema sumará los costos automáticamente."
      },
      {
        title: "Tiempo de Trabajo",
        content: "Indica cuántos minutos te toma cada servicio. Esto se usa para calcular tu rentabilidad por hora."
      },
      {
        title: "Precio Sugerido",
        content: "Basado en tus costos, el sistema te sugerirá un precio. ¡Ajústalo según tu mercado!"
      }
    ]
  },
  clientes: {
    title: "Clientes",
    color: "from-emerald-500 to-teal-500",
    icon: "👥",
    steps: [
      {
        title: "Tu Base de Clientas",
        content: "Guarda la información de tus clientas para dar un servicio más personalizado."
      },
      {
        title: "Historial",
        content: "Podrás ver qué servicios ha tomado, cuándo fue su última visita y cuánto ha gastado."
      },
      {
        title: "Notas Importantes",
        content: "Agrega notas como alergias, preferencias de colores o cualquier detalle importante."
      },
      {
        title: "Fidelización",
        content: "Identifica a tus mejores clientas y ofréceles promociones especiales para que vuelvan."
      }
    ]
  },
  gastos: {
    title: "Gastos",
    color: "from-amber-500 to-orange-500",
    icon: "💰",
    steps: [
      {
        title: "Gastos Operativos",
        content: "Registra todos tus gastos fijos: internet, luz, renta del espacio, publicidad, etc."
      },
      {
        title: "¿Por qué es importante?",
        content: "Estos gastos se dividen entre tus servicios para calcular el costo real de cada trabajo."
      },
      {
        title: "Tipos de Gasto",
        content: "Diferencia entre gastos fijos (renta) y variables (publicidad). Te ayudará a planificar mejor."
      },
      {
        title: "Revisa mensualmente",
        content: "Actualiza tus gastos cada mes para mantener tus cálculos precisos y tu negocio rentable."
      }
    ]
  },
  calculadora: {
    title: "Calculadora de Precios",
    color: "from-rose-500 to-pink-500",
    icon: "🧮",
    steps: [
      {
        title: "Tu Herramienta Clave",
        content: "La calculadora te dice exactamente cuánto cobrar basándose en tus costos reales."
      },
      {
        title: "¿Qué considera?",
        content: "Suma: productos usados + tiempo de trabajo + porción de gastos fijos + margen de ganancia."
      },
      {
        title: "Margen de Ganancia",
        content: "Puedes ajustar el porcentaje que quieres ganar. 30-50% es un rango saludable."
      },
      {
        title: "Compara con el mercado",
        content: "Si el precio sugerido es muy diferente al del mercado, revisa tus costos o ajusta tu margen."
      }
    ]
  },
  inventario: {
    title: "Inventario",
    color: "from-indigo-500 to-blue-500",
    icon: "📊",
    steps: [
      {
        title: "Control de Stock",
        content: "Lleva un registro de cuántos productos tienes disponibles para no quedarte sin materiales."
      },
      {
        title: "Alertas de Stock Bajo",
        content: "El sistema te avisa cuando un producto está por agotarse para que puedas reponerlo a tiempo."
      },
      {
        title: "Movimientos",
        content: "Registra entradas (compras) y salidas (uso/pérdida). Todo queda en el historial."
      },
      {
        title: "Exportar Datos",
        content: "Descarga tu inventario en Excel para llevarlo a tu contador o hacer pedidos."
      }
    ]
  },
  facturacion: {
    title: "Facturación",
    color: "from-slate-600 to-slate-700",
    icon: "🧾",
    steps: [
      {
        title: "Facturas Profesionales",
        content: "Genera facturas para tus clientas con todos los datos fiscales requeridos."
      },
      {
        title: "IVA Incluido",
        content: "El sistema calcula automáticamente el IVA (16%) y lo muestra separado en la factura."
      },
      {
        title: "Métodos de Pago",
        content: "Registra cómo te pagaron: efectivo, pago móvil, transferencia, Zelle, etc."
      },
      {
        title: "Historial",
        content: "Consulta todas tus facturas, filtra por fecha o cliente, y exporta para tu contabilidad."
      }
    ]
  },
  simulacion: {
    title: "Simulación de Ingresos",
    color: "from-cyan-500 to-blue-500",
    icon: "📈",
    steps: [
      {
        title: "Proyecta tus Ingresos",
        content: "El simulador te muestra cuánto podrías ganar basándose en tus servicios y precios."
      },
      {
        title: "Escenarios",
        content: "Prueba diferentes combinaciones: ¿Qué pasa si subo precios? ¿Si atiendo más clientas?"
      },
      {
        title: "Meta Mensual",
        content: "Define cuánto quieres ganar al mes y el simulador te dice cuántos servicios necesitas."
      },
      {
        title: "Toma Decisiones",
        content: "Usa esta información para decidir si necesitas más clientas, subir precios o reducir costos."
      }
    ]
  },
  reportes: {
    title: "Reportes",
    color: "from-green-500 to-emerald-500",
    icon: "📊",
    steps: [
      {
        title: "Analiza tu Negocio",
        content: "Los reportes te muestran cómo va tu negocio: ingresos, gastos, rentabilidad."
      },
      {
        title: "Comparaciones",
        content: "Compara mes a mes para ver si estás creciendo o si necesitas hacer ajustes."
      },
      {
        title: "Servicios Top",
        content: "Identifica qué servicios te dejan más ganancia por hora trabajada."
      },
      {
        title: "Exportar",
        content: "Descarga los reportes en Excel para tu contador o para tu análisis personal."
      }
    ]
  },
  agenda: {
    title: "Agenda de Citas",
    color: "from-pink-500 to-rose-500",
    icon: "📅",
    steps: [
      {
        title: "Organiza tu Tiempo",
        content: "Programa las citas de tus clientas y nunca olvides un compromiso."
      },
      {
        title: "Vista de Calendario",
        content: "Visualiza tu semana o mes completo para planificar mejor tu disponibilidad."
      },
      {
        title: "Estados de Cita",
        content: "Marca las citas como pendientes, confirmadas o completadas para mejor control."
      },
      {
        title: "Recordatorios",
        content: "Ve las citas del día en tu dashboard para empezar la jornada organizada."
      }
    ]
  }
};

export function FeatureTutorial({ feature, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorial = FEATURE_TUTORIALS[feature];
  
  if (!tutorial || !isOpen) return null;
  
  const handleComplete = () => {
    // Mark this feature tutorial as seen
    const seen = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
    if (!seen.includes(feature)) {
      seen.push(feature);
      localStorage.setItem(FEATURE_TIPS_KEY, JSON.stringify(seen));
    }
    setCurrentStep(0);
    onClose();
  };
  
  const step = tutorial.steps[currentStep];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid="feature-tutorial">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`p-5 bg-gradient-to-r ${tutorial.color} text-white relative`}>
          <button 
            onClick={handleComplete}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tutorial.icon}</span>
            <div>
              <p className="text-white/70 text-xs">Aprende sobre</p>
              <h3 className="font-bold text-lg">{tutorial.title}</h3>
            </div>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1 mt-4">
            {tutorial.steps.map((_, i) => (
              <div 
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tutorial.color} flex items-center justify-center flex-shrink-0`}>
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{step.title}</h4>
              <p className="text-gray-600 text-sm mt-1 leading-relaxed">{step.content}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'opacity-50' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            {currentStep === tutorial.steps.length - 1 ? (
              <Button 
                size="sm"
                onClick={handleComplete}
                className={`bg-gradient-to-r ${tutorial.color} text-white`}
              >
                Entendido
                <CheckCircle className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Help button component for each page
export function FeatureHelpButton({ feature, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const tutorial = FEATURE_TUTORIALS[feature];
  
  if (!tutorial) return null;
  
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`text-gray-500 hover:text-gray-700 ${className}`}
        data-testid={`help-btn-${feature}`}
      >
        <Info className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">¿Cómo funciona?</span>
      </Button>
      <FeatureTutorial 
        feature={feature} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}

// Hook to check if user has seen the tutorial for a feature
export function useFeatureTutorial(feature) {
  const [hasSeenTutorial, setHasSeenTutorial] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    const seen = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
    setHasSeenTutorial(seen.includes(feature));
  }, [feature]);
  
  const openTutorial = () => setShowTutorial(true);
  const closeTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    const seen = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
    if (!seen.includes(feature)) {
      seen.push(feature);
      localStorage.setItem(FEATURE_TIPS_KEY, JSON.stringify(seen));
    }
  };
  
  return { hasSeenTutorial, showTutorial, openTutorial, closeTutorial };
}

// Auto-show tutorial on first visit to a feature
export function AutoFeatureTutorial({ feature }) {
  const { hasSeenTutorial, showTutorial, openTutorial, closeTutorial } = useFeatureTutorial(feature);
  
  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => openTutorial(), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);
  
  return <FeatureTutorial feature={feature} isOpen={showTutorial} onClose={closeTutorial} />;
}

export default FeatureTutorial;
