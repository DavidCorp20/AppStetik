import { useState, useEffect, createContext, useContext } from "react";
import { X, ChevronRight, ChevronLeft, HelpCircle, Lightbulb, CheckCircle2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const TUTORIALS_SEEN_KEY = "nailcost_tutorials_seen_v2";

// ===========================================
// TUTORIALES COMPLETOS POR FUNCIÓN Y TIPO
// ===========================================

const TUTORIALS = {
  // ============ DASHBOARD ============
  dashboard: {
    personal: {
      title: "Tu Panel Principal",
      icon: "🏠",
      color: "from-pink-500 to-rose-500",
      steps: [
        {
          title: "Bienvenida a NailCost",
          content: "Este es tu centro de control. Aquí ves un resumen de todo tu negocio de un vistazo.",
          highlight: "Mira las tarjetas con tus estadísticas principales"
        },
        {
          title: "Métricas Clave",
          content: "Verás cuántos productos tienes, servicios creados, clientes registrados y tu ganancia estimada.",
          highlight: "Haz clic en cualquier tarjeta para ir a esa sección"
        },
        {
          title: "Accesos Rápidos",
          content: "Usa el menú inferior para navegar entre las diferentes funciones de la app.",
          highlight: "El botón + te lleva a crear nuevos registros"
        }
      ]
    },
    business: {
      title: "Dashboard Empresarial",
      icon: "📊",
      color: "from-indigo-500 to-violet-500",
      steps: [
        {
          title: "Centro de Control",
          content: "Tu dashboard muestra métricas en tiempo real: ingresos, gastos, ganancia neta y progreso hacia tu meta.",
          highlight: "Las tarjetas superiores resumen tu rendimiento"
        },
        {
          title: "Top Servicios",
          content: "Identifica qué servicios generan más ingresos. Esto te ayuda a enfocar tu marketing.",
          highlight: "Revisa el ranking de servicios más rentables"
        },
        {
          title: "Alertas Importantes",
          content: "El sistema te avisa sobre stock bajo, clientes inactivos y metas pendientes.",
          highlight: "No ignores las alertas rojas o amarillas"
        },
        {
          title: "Agenda del Día",
          content: "Ve rápidamente las citas programadas para hoy y el dinero facturado.",
          highlight: "Planifica tu día desde aquí"
        }
      ]
    }
  },

  // ============ PRODUCTOS ============
  productos: {
    personal: {
      title: "Tus Productos",
      icon: "📦",
      color: "from-blue-500 to-cyan-500",
      steps: [
        {
          title: "¿Qué son los productos?",
          content: "Aquí registras TODO lo que compras para trabajar: esmaltes, acrílico, gel, decoraciones, limas, etc.",
          highlight: "Cada producto tiene un costo que se suma a tus servicios"
        },
        {
          title: "Costo por Uso",
          content: "El sistema calcula automáticamente cuánto te cuesta CADA VEZ que usas un producto.",
          example: "Ejemplo: Esmalte $8 ÷ 30 usos = $0.27 por cliente"
        },
        {
          title: "Usa el Catálogo",
          content: "No tienes que escribir todo. Haz clic en 'Catálogo' para ver +150 productos comunes y agregarlos con un clic.",
          highlight: "El catálogo tiene precios sugeridos que puedes editar"
        },
        {
          title: "Mantén Actualizado",
          content: "Cuando compres productos nuevos o cambien los precios, actualízalos aquí para que tus cálculos sean precisos.",
          highlight: "Precios correctos = ganancias reales"
        }
      ]
    },
    business: {
      title: "Gestión de Productos",
      icon: "📦",
      color: "from-blue-500 to-cyan-500",
      steps: [
        {
          title: "Inventario Inteligente",
          content: "Registra todos los productos de tu salón. El sistema controla stock y te alerta cuando necesitas comprar.",
          highlight: "Define el stock mínimo para cada producto"
        },
        {
          title: "Costo Unitario",
          content: "Cada producto calcula su costo por uso. Esto es clave para saber cuánto cuesta realmente cada servicio.",
          example: "Gel UV $15 ÷ 25 aplicaciones = $0.60 por servicio"
        },
        {
          title: "Catálogo Pre-cargado",
          content: "Usa el botón 'Catálogo' para agregar productos rápidamente. Más de 150 items organizados por categoría.",
          highlight: "Ahorra tiempo con el catálogo"
        },
        {
          title: "Control de Stock",
          content: "El módulo de Inventario te mostrará alertas cuando un producto esté bajo. Aquí defines los datos base.",
          highlight: "Nunca te quedes sin productos en medio de un servicio"
        }
      ]
    }
  },

  // ============ ESTILOS/SERVICIOS ============
  estilos: {
    personal: {
      title: "Tus Servicios",
      icon: "💅",
      color: "from-violet-500 to-purple-500",
      steps: [
        {
          title: "Define lo que Ofreces",
          content: "Crea los servicios que haces: Semipermanente, Acrílico, Gel, Manicure Spa, etc.",
          highlight: "Cada servicio puede tener diferentes productos"
        },
        {
          title: "Vincula Productos",
          content: "Al crear un servicio, selecciona qué productos usas. El sistema suma los costos automáticamente.",
          example: "Semipermanente = Base + Color + Top = $2.50 de costo"
        },
        {
          title: "Tiempo de Trabajo",
          content: "Indica cuánto tiempo te toma cada servicio. Esto es importante para calcular tu ganancia por hora.",
          highlight: "Tu tiempo también tiene valor"
        },
        {
          title: "Usa Plantillas",
          content: "El 'Catálogo' tiene +70 servicios pre-definidos con tiempos y dificultad. Solo edita los precios.",
          highlight: "Comienza rápido con las plantillas"
        }
      ]
    },
    business: {
      title: "Catálogo de Servicios",
      icon: "💅",
      color: "from-violet-500 to-purple-500",
      steps: [
        {
          title: "Menú de Servicios",
          content: "Define todos los servicios que ofrece tu salón. Cada servicio tiene productos, tiempo y nivel de dificultad.",
          highlight: "Un catálogo organizado facilita la facturación"
        },
        {
          title: "Costos Automáticos",
          content: "Al vincular productos, el sistema calcula el costo real de cada servicio. Esto te ayuda a fijar precios rentables.",
          example: "Acrílico con diseño: $5.80 de costo → Precio sugerido: $18+"
        },
        {
          title: "Clasificación",
          content: "Marca la dificultad (Fácil, Medio, Difícil) para asignar tiempos y precios acordes.",
          highlight: "Servicios difíciles = más tiempo = más precio"
        },
        {
          title: "Plantillas del Catálogo",
          content: "Usa 'Catálogo' para agregar servicios comunes rápidamente. Luego personaliza según tu salón.",
          highlight: "Ahorra horas de configuración inicial"
        }
      ]
    }
  },

  // ============ CLIENTES ============
  clientes: {
    personal: {
      title: "Tus Clientas",
      icon: "👥",
      color: "from-emerald-500 to-teal-500",
      steps: [
        {
          title: "Guarda sus Datos",
          content: "Registra nombre, teléfono y email de cada clienta. Así puedes contactarlas para recordatorios.",
          highlight: "Un negocio profesional mantiene su base de datos"
        },
        {
          title: "Notas Importantes",
          content: "Agrega notas sobre preferencias, alergias o detalles especiales. Tu clienta se sentirá especial.",
          example: "\"Prefiere colores nude\", \"Alérgica al metacrilato\""
        },
        {
          title: "Historial",
          content: "Cada vez que hagas un servicio, queda registrado. Puedes ver qué le hiciste la última vez.",
          highlight: "El historial te ayuda a personalizar el servicio"
        }
      ]
    },
    business: {
      title: "CRM de Clientes",
      icon: "👥",
      color: "from-emerald-500 to-teal-500",
      steps: [
        {
          title: "Base de Datos Completa",
          content: "Registra todos los datos de tus clientes: contacto, dirección, fecha de cumpleaños.",
          highlight: "Datos completos = mejor servicio"
        },
        {
          title: "Clientes VIP",
          content: "Identifica quiénes gastan más. El sistema calcula el valor total de cada cliente.",
          highlight: "Tus mejores clientes merecen atención especial"
        },
        {
          title: "Historial Completo",
          content: "Ve todos los servicios que ha tomado cada cliente, cuánto ha gastado y sus preferencias.",
          example: "Sofía: 28 visitas, $1,250 total, prefiere acrílico"
        },
        {
          title: "Notas Privadas",
          content: "Guarda información sensible: alergias, preferencias, observaciones. Solo tú la ves.",
          highlight: "Personaliza cada experiencia"
        }
      ]
    }
  },

  // ============ GASTOS ============
  gastos: {
    personal: {
      title: "Tus Gastos",
      icon: "💰",
      color: "from-amber-500 to-orange-500",
      steps: [
        {
          title: "Gastos Fijos",
          content: "Registra lo que pagas cada mes: alquiler (si tienes local), luz, internet, transporte.",
          highlight: "Estos gastos se dividen entre tus servicios"
        },
        {
          title: "Por qué Importa",
          content: "Si no cuentas tus gastos, crees que ganas más de lo que realmente ganas.",
          example: "Si gastas $50/mes y haces 30 servicios = $1.67 por servicio"
        },
        {
          title: "Categorías",
          content: "Organiza por tipo: Operativo, Marketing, Transporte, etc. Así sabes en qué se va tu dinero.",
          highlight: "Conocer tus gastos te ayuda a reducirlos"
        }
      ]
    },
    business: {
      title: "Control de Gastos",
      icon: "💰",
      color: "from-amber-500 to-orange-500",
      steps: [
        {
          title: "Gastos Operativos",
          content: "Registra TODOS los gastos del negocio: alquiler, servicios, nómina, marketing, insumos.",
          highlight: "Gastos bien registrados = decisiones inteligentes"
        },
        {
          title: "Categorización",
          content: "Clasifica cada gasto: Fijo (alquiler), Variable (insumos), Marketing, Nómina, etc.",
          example: "Esto te permite analizar dónde optimizar"
        },
        {
          title: "Impacto en Precios",
          content: "Tus gastos se dividen entre todos los servicios. Si suben los gastos, debes ajustar precios.",
          highlight: "Los reportes te muestran el costo real por servicio"
        },
        {
          title: "Recurrencia",
          content: "Marca gastos como mensuales para que aparezcan automáticamente cada mes.",
          highlight: "Ahorra tiempo con gastos recurrentes"
        }
      ]
    }
  },

  // ============ CALCULADORA ============
  calculadora: {
    personal: {
      title: "Calculadora de Precios",
      icon: "🧮",
      color: "from-rose-500 to-pink-500",
      steps: [
        {
          title: "El Corazón de NailCost",
          content: "Esta herramienta te dice EXACTAMENTE cuánto debes cobrar para ganar lo que mereces.",
          highlight: "Deja de adivinar precios"
        },
        {
          title: "Cómo Funciona",
          content: "Suma: Costo de productos + Tu tiempo de trabajo + Parte de gastos fijos + Margen de ganancia",
          example: "Productos $3 + Tiempo $5 + Gastos $2 + Ganancia 40% = $14"
        },
        {
          title: "Tu Valor por Hora",
          content: "Define cuánto vale tu hora de trabajo. Si quieres ganar $800/mes trabajando 160h = $5/hora mínimo.",
          highlight: "Tu tiempo es dinero"
        },
        {
          title: "Margen de Ganancia",
          content: "Después de todos los costos, ¿cuánto extra quieres ganar? 30-50% es lo normal en belleza.",
          highlight: "No trabajes solo para cubrir costos"
        }
      ]
    },
    business: {
      title: "Calculadora Avanzada",
      icon: "🧮",
      color: "from-rose-500 to-pink-500",
      steps: [
        {
          title: "Precios Rentables",
          content: "Calcula precios que cubran TODOS tus costos y generen ganancia real para el negocio.",
          highlight: "Precios basados en datos, no en competencia"
        },
        {
          title: "Fórmula Completa",
          content: "Costo productos + Mano de obra (tuya y empleados) + Gastos operativos + Margen empresarial",
          example: "Costo real $8 + Margen 50% = Precio mínimo $12"
        },
        {
          title: "Por Empleado",
          content: "Si tienes empleados, incluye su costo por hora en el cálculo de cada servicio.",
          highlight: "No olvides las comisiones"
        },
        {
          title: "Escenarios",
          content: "Prueba diferentes márgenes y ve cómo cambia tu rentabilidad. Encuentra el punto óptimo.",
          highlight: "Experimenta antes de cambiar precios"
        }
      ]
    }
  },

  // ============ INVENTARIO ============
  inventario: {
    personal: {
      title: "Control de Inventario",
      icon: "📊",
      color: "from-indigo-500 to-blue-500",
      steps: [
        {
          title: "¿Cuánto Tienes?",
          content: "Ve de un vistazo cuántas unidades tienes de cada producto.",
          highlight: "El inventario se actualiza con tus compras y usos"
        },
        {
          title: "Alertas de Stock",
          content: "Cuando un producto baje del mínimo, verás una alerta. Así nunca te quedas sin nada.",
          example: "Alerta: \"Gel Base UV - Solo quedan 2 unidades\""
        },
        {
          title: "Registra Movimientos",
          content: "Cada vez que compres o uses productos, regístralo para mantener el control.",
          highlight: "Un inventario actualizado = negocio organizado"
        }
      ]
    },
    business: {
      title: "Gestión de Inventario",
      icon: "📊",
      color: "from-indigo-500 to-blue-500",
      steps: [
        {
          title: "Stock en Tiempo Real",
          content: "Ve la cantidad disponible de cada producto. El sistema descuenta automáticamente al facturar.",
          highlight: "Control total de tu inversión en productos"
        },
        {
          title: "Alertas Automáticas",
          content: "Recibe notificaciones cuando un producto esté por agotarse. Define el stock mínimo de cada uno.",
          example: "Pop-up: \"3 productos con stock crítico\""
        },
        {
          title: "Valor del Inventario",
          content: "Sabe cuánto dinero tienes invertido en productos. Esto es parte de tu capital de trabajo.",
          highlight: "Inventario = dinero guardado en productos"
        },
        {
          title: "Historial de Movimientos",
          content: "Rastrea entradas (compras) y salidas (uso, pérdida, vencimiento). Detecta irregularidades.",
          highlight: "Control = menos pérdidas"
        }
      ]
    }
  },

  // ============ FACTURACIÓN (Solo Comercio) ============
  facturacion: {
    personal: {
      title: "Registro de Ventas",
      icon: "🧾",
      color: "from-slate-600 to-slate-700",
      steps: [
        {
          title: "Registra tus Ventas",
          content: "Cada vez que hagas un servicio, regístralo aquí para llevar control de tus ingresos.",
          highlight: "Sin registro no sabes cuánto ganas"
        },
        {
          title: "Método de Pago",
          content: "Indica cómo te pagaron: efectivo, transferencia, Pago Móvil, etc.",
          highlight: "Útil para tu contabilidad personal"
        }
      ]
    },
    business: {
      title: "Facturación Fiscal",
      icon: "🧾",
      color: "from-slate-600 to-slate-700",
      steps: [
        {
          title: "Facturas Profesionales",
          content: "Genera facturas con todos los datos fiscales: RIF, IVA, dirección. Cumple con el SENIAT.",
          highlight: "Facturas legales para tu contabilidad"
        },
        {
          title: "IVA Automático",
          content: "El sistema calcula el IVA 16% automáticamente. También puedes agregar otros impuestos.",
          example: "Subtotal $20 + IVA 16% = Total $23.20"
        },
        {
          title: "Impuestos Personalizables",
          content: "Además del IVA, configura retenciones ISLR, impuestos municipales u otros.",
          highlight: "Configura en el ícono de ajustes"
        },
        {
          title: "Historial y Reportes",
          content: "Todas las facturas quedan guardadas. Exporta para tu contador o declaraciones.",
          highlight: "Organización fiscal desde el día 1"
        }
      ]
    }
  },

  // ============ SIMULACIÓN ============
  simulacion: {
    personal: {
      title: "Simulador de Ingresos",
      icon: "📈",
      color: "from-cyan-500 to-blue-500",
      steps: [
        {
          title: "Proyecta tu Mes",
          content: "¿Cuánto podrías ganar si haces X servicios al día? El simulador te lo calcula.",
          highlight: "Planifica tu mes antes de vivirlo"
        },
        {
          title: "Variables",
          content: "Ajusta: servicios por día, días de trabajo, precio promedio. Ve cómo cambia tu ingreso.",
          example: "3 servicios/día × 22 días × $12 = $792/mes"
        },
        {
          title: "Define Metas",
          content: "Si quieres ganar $500, el sistema te dice cuántos servicios necesitas hacer.",
          highlight: "Metas claras = motivación real"
        }
      ]
    },
    business: {
      title: "Simulador Empresarial",
      icon: "📈",
      color: "from-cyan-500 to-blue-500",
      steps: [
        {
          title: "Proyecciones de Negocio",
          content: "Simula diferentes escenarios para tu salón: optimista, realista y conservador.",
          highlight: "Toma decisiones basadas en proyecciones"
        },
        {
          title: "Variables del Negocio",
          content: "Configura: servicios diarios, días operativos, ticket promedio, capacidad del equipo.",
          example: "12 servicios/día × 24 días × $18 = $5,184/mes"
        },
        {
          title: "Punto de Equilibrio",
          content: "Sabe cuántos servicios necesitas para cubrir TODOS tus gastos antes de generar ganancia.",
          highlight: "Conocer tu punto de equilibrio es vital"
        },
        {
          title: "Metas Mensuales",
          content: "Define tu meta de ingresos y el sistema calcula qué necesitas para alcanzarla.",
          highlight: "Metas + seguimiento = crecimiento"
        }
      ]
    }
  },

  // ============ REPORTES ============
  reportes: {
    personal: {
      title: "Tus Reportes",
      icon: "📊",
      color: "from-green-500 to-emerald-500",
      steps: [
        {
          title: "Ve tu Progreso",
          content: "Analiza cuánto ganaste este mes vs. el anterior. ¿Estás creciendo?",
          highlight: "Los números no mienten"
        },
        {
          title: "Servicios Top",
          content: "Descubre cuáles servicios te dejan más ganancia. Enfócate en ellos.",
          example: "Acrílico te deja 60% más que semipermanente"
        }
      ]
    },
    business: {
      title: "Reportes Gerenciales",
      icon: "📊",
      color: "from-green-500 to-emerald-500",
      steps: [
        {
          title: "Análisis Completo",
          content: "Ve ingresos, gastos y ganancia neta con gráficos claros. Compara períodos.",
          highlight: "Decisiones basadas en datos reales"
        },
        {
          title: "Rentabilidad por Servicio",
          content: "Identifica qué servicios generan más ganancia y cuáles podrían subir de precio.",
          example: "Manicure Spa: 45% margen vs. Básico: 25%"
        },
        {
          title: "Rendimiento de Empleados",
          content: "Ve cuánto produce cada empleado. Identifica top performers y oportunidades.",
          highlight: "Métricas para gestionar tu equipo"
        },
        {
          title: "Exportar a Excel",
          content: "Descarga reportes para tu contador, inversionistas o análisis propio.",
          highlight: "Datos portables para cualquier uso"
        }
      ]
    }
  },

  // ============ PAGOS/SUSCRIPCIÓN ============
  pagos: {
    personal: {
      title: "Tu Suscripción",
      icon: "💳",
      color: "from-pink-500 to-rose-500",
      steps: [
        {
          title: "Planes Disponibles",
          content: "Elige entre Plan Básico ($5/mes) o Premium ($10/mes) según lo que necesites.",
          highlight: "Ahorra hasta 30% pagando anual"
        },
        {
          title: "Cómo Pagar",
          content: "Acepto Pago Móvil, Transferencia, Binance/USDT y Zelle. Verás los datos de pago.",
          highlight: "Después de pagar, sube tu comprobante"
        },
        {
          title: "Activación",
          content: "Tu pago será revisado y tu cuenta activada en menos de 24 horas.",
          highlight: "Recibirás confirmación cuando esté activo"
        }
      ]
    },
    business: {
      title: "Suscripción Empresarial",
      icon: "💳",
      color: "from-indigo-500 to-violet-500",
      steps: [
        {
          title: "Planes Comerciales",
          content: "Plan Básico ($15/mes) o Premium ($20/mes). El Premium incluye empleados y reportes avanzados.",
          highlight: "Ahorra hasta 30% pagando anual"
        },
        {
          title: "Métodos de Pago",
          content: "Pago Móvil, Transferencia, Binance/USDT, Zelle. Emitimos factura fiscal.",
          highlight: "Tu inversión es deducible de impuestos"
        },
        {
          title: "Proceso de Activación",
          content: "Sube el comprobante de pago. Revisamos y activamos en menos de 24h hábiles.",
          highlight: "Soporte prioritario para cuentas empresariales"
        }
      ]
    }
  }
};

// ===========================================
// CONTEXTO DE TUTORIALES
// ===========================================
const TutorialContext = createContext(null);

export function TutorialProvider({ children }) {
  const [seenTutorials, setSeenTutorials] = useState(() => {
    const saved = localStorage.getItem(TUTORIALS_SEEN_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const markAsSeen = (tutorialKey) => {
    if (!seenTutorials.includes(tutorialKey)) {
      const newSeen = [...seenTutorials, tutorialKey];
      setSeenTutorials(newSeen);
      localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify(newSeen));
    }
  };

  const hasSeen = (tutorialKey) => seenTutorials.includes(tutorialKey);

  const resetTutorial = (tutorialKey) => {
    const newSeen = seenTutorials.filter(k => k !== tutorialKey);
    setSeenTutorials(newSeen);
    localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify(newSeen));
  };

  const resetAllTutorials = () => {
    setSeenTutorials([]);
    localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify([]));
  };

  return (
    <TutorialContext.Provider value={{ seenTutorials, markAsSeen, hasSeen, resetTutorial, resetAllTutorials }}>
      {children}
    </TutorialContext.Provider>
  );
}

export const useTutorials = () => useContext(TutorialContext);

// ===========================================
// COMPONENTE DE TUTORIAL INTERACTIVO
// ===========================================
export function InteractiveTutorial({ feature, isOpen, onClose }) {
  const { isBusinessUser } = useAuth();
  const { markAsSeen } = useTutorials();
  const [currentStep, setCurrentStep] = useState(0);

  const userType = isBusinessUser ? 'business' : 'personal';
  const tutorial = TUTORIALS[feature]?.[userType];

  useEffect(() => {
    if (isOpen) setCurrentStep(0);
  }, [isOpen]);

  if (!tutorial || !isOpen) return null;

  const totalSteps = tutorial.steps.length;
  const step = tutorial.steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      markAsSeen(`${feature}_${userType}`);
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSkip = () => {
    markAsSeen(`${feature}_${userType}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid={`tutorial-${feature}`}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-5 bg-gradient-to-r ${tutorial.color} text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{tutorial.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{tutorial.title}</h3>
                <p className="text-white/70 text-xs">{isBusinessUser ? 'Versión Empresarial' : 'Versión Personal'}</p>
              </div>
            </div>
            <button onClick={handleSkip} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress bar */}
          <div className="flex gap-1">
            {tutorial.steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= currentStep ? 'bg-white' : 'bg-white/30'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Paso {currentStep + 1} de {totalSteps}
            </span>
            <h4 className="font-bold text-xl text-gray-900 mt-1">{step.title}</h4>
          </div>

          <p className="text-gray-600 leading-relaxed mb-4">{step.content}</p>

          {step.example && (
            <div className={`p-3 rounded-lg bg-gradient-to-r ${tutorial.color} bg-opacity-10 border-l-4`} style={{borderColor: 'currentColor'}}>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Ejemplo: </span>
                {step.example}
              </p>
            </div>
          )}

          {step.highlight && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <Lightbulb className="w-4 h-4 inline mr-1" />
                {step.highlight}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="text-gray-500"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className={`bg-gradient-to-r ${tutorial.color} text-white hover:opacity-90`}
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                ¡Entendido!
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// BOTÓN DE AYUDA
// ===========================================
export function TutorialHelpButton({ feature, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isBusinessUser } = useAuth();
  
  const userType = isBusinessUser ? 'business' : 'personal';
  const tutorial = TUTORIALS[feature]?.[userType];
  
  if (!tutorial) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`text-gray-500 hover:text-gray-700 gap-1.5 ${className}`}
        data-testid={`tutorial-help-${feature}`}
      >
        <HelpCircle className="w-4 h-4" />
        <span className="hidden sm:inline text-xs">¿Cómo funciona?</span>
      </Button>
      <InteractiveTutorial feature={feature} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// ===========================================
// AUTO TUTORIAL (Primera vez)
// ===========================================
export function AutoTutorial({ feature }) {
  const [isOpen, setIsOpen] = useState(false);
  const { hasSeen, markAsSeen } = useTutorials();
  const { isBusinessUser } = useAuth();

  const userType = isBusinessUser ? 'business' : 'personal';
  const tutorialKey = `${feature}_${userType}`;

  useEffect(() => {
    if (!hasSeen(tutorialKey)) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, [tutorialKey, hasSeen]);

  const handleClose = () => {
    setIsOpen(false);
    markAsSeen(tutorialKey);
  };

  return <InteractiveTutorial feature={feature} isOpen={isOpen} onClose={handleClose} />;
}

// ===========================================
// BOTÓN PARA REINICIAR TUTORIALES (Configuración)
// ===========================================
export function ResetTutorialsButton() {
  const { resetAllTutorials } = useTutorials();
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    setResetting(true);
    resetAllTutorials();
    setTimeout(() => setResetting(false), 1000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleReset} disabled={resetting}>
      <RotateCcw className={`w-4 h-4 mr-2 ${resetting ? 'animate-spin' : ''}`} />
      {resetting ? 'Reiniciando...' : 'Ver tutoriales de nuevo'}
    </Button>
  );
}

// ===========================================
// EXPORTS LEGACY (compatibilidad)
// ===========================================
export { InteractiveTutorial as FeatureTutorial };
export { TutorialHelpButton as FeatureHelpButton };
export { AutoTutorial as AutoFeatureTutorial };

export default InteractiveTutorial;
