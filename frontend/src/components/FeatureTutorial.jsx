import { useState, useEffect } from "react";
import { X, Lightbulb, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURE_TIPS_KEY = "nailcost_feature_tips_seen";

// Tutoriales simples y precisos por función
const FEATURE_TUTORIALS = {
  productos: {
    title: "Productos",
    icon: "📦",
    color: "from-blue-500 to-cyan-500",
    tips: [
      "Registra los materiales que usas: esmaltes, acrílicos, decoraciones",
      "El precio de compra y cantidad te dan el costo unitario automático",
      "El 'uso por servicio' indica cuánto gastas en cada cliente"
    ]
  },
  estilos: {
    title: "Estilos de Servicio",
    icon: "💅",
    color: "from-violet-500 to-purple-500",
    tips: [
      "Define los servicios que ofreces (manicure, acrílico, gel, etc.)",
      "Vincula productos para calcular costos automáticamente",
      "El tiempo de trabajo ayuda a calcular tu rentabilidad por hora"
    ]
  },
  clientes: {
    title: "Clientes",
    icon: "👥",
    color: "from-emerald-500 to-teal-500",
    tips: [
      "Guarda datos de contacto para mantener comunicación",
      "Agrega notas sobre preferencias o alergias",
      "Consulta el historial de visitas y servicios"
    ]
  },
  gastos: {
    title: "Gastos Operativos",
    icon: "💰",
    color: "from-amber-500 to-orange-500",
    tips: [
      "Registra gastos fijos: renta, luz, internet, publicidad",
      "Estos gastos se dividen entre tus servicios para calcular el costo real",
      "Actualiza mensualmente para cálculos precisos"
    ]
  },
  calculadora: {
    title: "Calculadora de Precios",
    icon: "🧮",
    color: "from-rose-500 to-pink-500",
    tips: [
      "Calcula precios justos basados en tus costos reales",
      "Incluye: productos + tiempo de trabajo + gastos + ganancia",
      "Ajusta el margen de ganancia según tu mercado (30-50% recomendado)"
    ]
  },
  inventario: {
    title: "Inventario",
    icon: "📊",
    color: "from-indigo-500 to-blue-500",
    tips: [
      "Controla el stock de tus productos en tiempo real",
      "Recibe alertas cuando un producto esté por agotarse",
      "Registra entradas (compras) y salidas (uso/pérdida)"
    ]
  },
  facturacion: {
    title: "Facturación",
    icon: "🧾",
    color: "from-slate-600 to-slate-700",
    tips: [
      "Genera facturas profesionales con IVA incluido",
      "Registra el método de pago (efectivo, transferencia, etc.)",
      "Exporta para tu contabilidad"
    ]
  },
  simulacion: {
    title: "Simulación",
    icon: "📈",
    color: "from-cyan-500 to-blue-500",
    tips: [
      "Proyecta cuánto podrías ganar al mes",
      "Prueba escenarios: ¿más clientes? ¿subir precios?",
      "Define tu meta mensual y el sistema te dice cuántos servicios necesitas"
    ]
  },
  reportes: {
    title: "Reportes",
    icon: "📊",
    color: "from-green-500 to-emerald-500",
    tips: [
      "Analiza ingresos, gastos y rentabilidad",
      "Compara mes a mes para ver tu crecimiento",
      "Identifica qué servicios te dejan más ganancia"
    ]
  },
  agenda: {
    title: "Agenda",
    icon: "📅",
    color: "from-pink-500 to-rose-500",
    tips: [
      "Programa citas y evita conflictos de horarios",
      "Visualiza tu semana o mes completo",
      "Marca citas como confirmadas o completadas"
    ]
  },
  empleados: {
    title: "Empleados",
    icon: "👩‍💼",
    color: "from-violet-500 to-indigo-500",
    tips: [
      "Registra tu equipo con sus especialidades",
      "Define porcentaje de comisión por servicio",
      "Asigna citas a empleados específicos"
    ]
  },
  ganancias: {
    title: "Configuración de Ganancias",
    icon: "💵",
    color: "from-emerald-500 to-green-500",
    tips: [
      "Define tu costo por hora de trabajo",
      "Establece tu meta de ingreso mensual",
      "Ajusta el margen de ganancia deseado"
    ]
  }
};

// Componente de Tutorial Simple
export function FeatureTutorial({ feature, isOpen, onClose }) {
  const tutorial = FEATURE_TUTORIALS[feature];
  
  if (!tutorial || !isOpen) return null;
  
  const handleComplete = () => {
    const seen = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
    if (!seen.includes(feature)) {
      seen.push(feature);
      localStorage.setItem(FEATURE_TIPS_KEY, JSON.stringify(seen));
    }
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" data-testid="feature-tutorial">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-5 bg-gradient-to-r ${tutorial.color} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tutorial.icon}</span>
              <h3 className="font-bold text-lg">{tutorial.title}</h3>
            </div>
            <button 
              onClick={handleComplete}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="p-5 space-y-3">
          {tutorial.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${tutorial.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <span className="text-white text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <Button 
            onClick={handleComplete}
            className={`w-full bg-gradient-to-r ${tutorial.color} text-white hover:opacity-90`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}

// Botón de ayuda para cada página
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
        className={`text-gray-500 hover:text-gray-700 gap-1 ${className}`}
        data-testid={`help-btn-${feature}`}
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Ayuda</span>
      </Button>
      <FeatureTutorial 
        feature={feature} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}

// Hook para mostrar tutorial en primer uso
export function useFeatureTutorial(feature) {
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    const seen = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
    if (!seen.includes(feature)) {
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, [feature]);
  
  const closeTutorial = () => {
    setShowTutorial(false);
    const seen = JSON.parse(localStorage.getItem(FEATURE_TIPS_KEY) || '[]');
    if (!seen.includes(feature)) {
      seen.push(feature);
      localStorage.setItem(FEATURE_TIPS_KEY, JSON.stringify(seen));
    }
  };
  
  return { showTutorial, closeTutorial };
}

// Componente que muestra el tutorial automáticamente en primer uso
export function AutoFeatureTutorial({ feature }) {
  const { showTutorial, closeTutorial } = useFeatureTutorial(feature);
  return <FeatureTutorial feature={feature} isOpen={showTutorial} onClose={closeTutorial} />;
}

export default FeatureTutorial;
