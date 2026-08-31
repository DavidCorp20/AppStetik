import { useState, useEffect, createContext, useContext } from "react";
import { X, ChevronRight, ChevronLeft, HelpCircle, Lightbulb, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const TUTORIALS_SEEN_KEY = "nailcost_tutorials_seen_v2";
const safeArray = (value) => Array.isArray(value) ? value : [];

// ===========================================
// TUTORIALES COMPLETOS POR FUNCIÓN Y TIPO
// ===========================================

const TUTORIALS = {
  dashboard: {
    personal: { title:"Tu Panel Principal", icon:"🏠", color:"from-pink-500 to-rose-500", steps:[
      {title:"Bienvenida a NailCost",content:"Este es tu centro de control. Aquí ves un resumen de todo tu negocio de un vistazo.",highlight:"Mira las tarjetas con tus estadísticas principales"},
      {title:"Métricas Clave",content:"Verás cuántos productos tienes, servicios creados, clientes registrados y tu ganancia estimada.",highlight:"Haz clic en cualquier tarjeta para ir a esa sección"},
      {title:"Accesos Rápidos",content:"Usa el menú inferior para navegar entre las diferentes funciones de la app.",highlight:"El botón + te lleva a crear nuevos registros"}
    ]},
    business: { title:"Dashboard Empresarial", icon:"📊", color:"from-indigo-500 to-violet-500", steps:[
      {title:"Centro de Control",content:"Tu dashboard muestra métricas en tiempo real: ingresos, gastos, ganancia neta y progreso hacia tu meta.",highlight:"Las tarjetas superiores resumen tu rendimiento"},
      {title:"Top Servicios",content:"Identifica qué servicios generan más ingresos. Esto te ayuda a enfocar tu marketing.",highlight:"Revisa el ranking de servicios más rentables"},
      {title:"Alertas Importantes",content:"El sistema te avisa sobre stock bajo, clientes inactivos y metas pendientes.",highlight:"No ignores las alertas rojas o amarillas"},
      {title:"Agenda del Día",content:"Ve rápidamente las citas programadas para hoy y el dinero facturado.",highlight:"Planifica tu día desde aquí"}
    ]}
  },
  productos: {
    personal: {title:"Tus Productos",icon:"📦",color:"from-blue-500 to-cyan-500",steps:[
      {title:"¿Qué son los productos?",content:"Aquí registras TODO lo que compras para trabajar: esmaltes, acrílico, gel, decoraciones, limas, etc.",highlight:"Cada producto tiene un costo que se suma a tus servicios"},
      {title:"Costo por Uso",content:"El sistema calcula automáticamente cuánto te cuesta CADA VEZ que usas un producto.",example:"Esmalte $8 ÷ 30 usos = $0.27 por cliente"},
      {title:"Usa el Catálogo",content:"No tienes que escribir todo. Haz clic en 'Catálogo' para ver productos comunes y agregarlos con un clic.",highlight:"El catálogo tiene precios sugeridos que puedes editar"},
      {title:"Mantén Actualizado",content:"Cuando compres productos nuevos o cambien los precios, actualízalos aquí para que tus cálculos sean precisos.",highlight:"Precios correctos = ganancias reales"}
    ]},
    business: {title:"Gestión de Productos",icon:"📦",color:"from-blue-500 to-cyan-500",steps:[
      {title:"Inventario Inteligente",content:"Registra todos los productos de tu salón. El sistema controla stock y te alerta cuando necesitas comprar.",highlight:"Define el stock mínimo para cada producto"},
      {title:"Costo Unitario",content:"Cada producto calcula su costo por uso. Esto es clave para saber cuánto cuesta realmente cada servicio.",example:"Gel UV $15 ÷ 25 aplicaciones = $0.60 por servicio"},
      {title:"Catálogo Pre-cargado",content:"Usa el botón 'Catálogo' para agregar productos rápidamente.",highlight:"Ahorra tiempo con el catálogo"},
      {title:"Control de Stock",content:"El módulo de Inventario te mostrará alertas cuando un producto esté bajo.",highlight:"Nunca te quedes sin productos en medio de un servicio"}
    ]}
  },
  estilos:{personal:{title:"Tus Servicios",icon:"💅",color:"from-violet-500 to-purple-500",steps:[{title:"Define lo que Ofreces",content:"Crea los servicios que haces.",highlight:"Cada servicio puede tener diferentes productos"},{title:"Vincula Productos",content:"Al crear un servicio, selecciona qué productos usas.",example:"Base + Color + Top = costo del servicio"},{title:"Tiempo de Trabajo",content:"Indica cuánto tiempo te toma cada servicio.",highlight:"Tu tiempo también tiene valor"}]},business:{title:"Catálogo de Servicios",icon:"💅",color:"from-violet-500 to-purple-500",steps:[{title:"Menú de Servicios",content:"Define todos los servicios que ofrece tu salón.",highlight:"Un catálogo organizado facilita la facturación"},{title:"Costos Automáticos",content:"Al vincular productos, el sistema calcula el costo real.",highlight:"Precios basados en datos"},{title:"Clasificación",content:"Marca la dificultad para asignar tiempos y precios acordes.",highlight:"Servicios difíciles requieren más precio"}]}},
  clientes:{personal:{title:"Tus Clientas",icon:"👥",color:"from-emerald-500 to-teal-500",steps:[{title:"Guarda sus Datos",content:"Registra nombre, teléfono y email de cada clienta.",highlight:"Un negocio profesional mantiene su base de datos"},{title:"Notas Importantes",content:"Agrega notas sobre preferencias y detalles especiales.",highlight:"Personaliza el servicio"},{title:"Historial",content:"Cada servicio queda registrado.",highlight:"El historial ayuda a personalizar"}]},business:{title:"CRM de Clientes",icon:"👥",color:"from-emerald-500 to-teal-500",steps:[{title:"Base de Datos",content:"Registra los datos de tus clientes.",highlight:"Datos completos = mejor servicio"},{title:"Clientes VIP",content:"Identifica quiénes gastan más.",highlight:"Atención especial a tus mejores clientes"},{title:"Historial Completo",content:"Consulta servicios y gastos de cada cliente.",highlight:"Conoce a tus clientes"}]}},
  gastos:{personal:{title:"Tus Gastos",icon:"💰",color:"from-amber-500 to-orange-500",steps:[{title:"Gastos Fijos",content:"Registra lo que pagas cada mes.",highlight:"Estos gastos se dividen entre tus servicios"},{title:"Por qué Importa",content:"Si no cuentas tus gastos, crees que ganas más de lo que realmente ganas.",highlight:"Conoce tu costo real"}]},business:{title:"Control de Gastos",icon:"💰",color:"from-amber-500 to-orange-500",steps:[{title:"Gastos Operativos",content:"Registra todos los gastos del negocio.",highlight:"Gastos bien registrados = decisiones inteligentes"},{title:"Categorización",content:"Clasifica cada gasto.",highlight:"Optimiza donde sea necesario"}]}},
  calculadora:{personal:{title:"Calculadora de Precios",icon:"🧮",color:"from-rose-500 to-pink-500",steps:[{title:"Precios",content:"Calcula cuánto debes cobrar para cubrir costos y ganar.",highlight:"Deja de adivinar precios"},{title:"Fórmula",content:"Costo de productos + tiempo + gastos + margen.",highlight:"Tu tiempo es dinero"}]},business:{title:"Calculadora Avanzada",icon:"🧮",color:"from-rose-500 to-pink-500",steps:[{title:"Precios Rentables",content:"Calcula precios que cubran todos tus costos.",highlight:"Precios basados en datos"},{title:"Escenarios",content:"Prueba diferentes márgenes y escenarios.",highlight:"Experimenta antes de cambiar precios"}]}},
  inventario:{personal:{title:"Control de Inventario",icon:"📊",color:"from-indigo-500 to-blue-500",steps:[{title:"¿Cuánto Tienes?",content:"Ve las unidades de cada producto.",highlight:"Mantén actualizado tu inventario"},{title:"Alertas de Stock",content:"Recibe alertas cuando un producto esté bajo.",highlight:"Evita quedarte sin productos"}]},business:{title:"Gestión de Inventario",icon:"📊",color:"from-indigo-500 to-blue-500",steps:[{title:"Stock en Tiempo Real",content:"Ve la cantidad disponible.",highlight:"Control total de tu inversión"},{title:"Alertas Automáticas",content:"Define stock mínimo y recibe alertas.",highlight:"Evita quiebres de stock"}]}},
  facturacion:{personal:{title:"Registro de Ventas",icon:"🧾",color:"from-slate-600 to-slate-700",steps:[{title:"Registra tus Ventas",content:"Registra cada servicio para controlar tus ingresos.",highlight:"Sin registro no sabes cuánto ganas"},{title:"Método de Pago",content:"Indica cómo te pagaron.",highlight:"Útil para tu contabilidad"}]},business:{title:"Facturación Fiscal",icon:"🧾",color:"from-slate-600 to-slate-700",steps:[{title:"Facturas",content:"Genera facturas con los datos fiscales.",highlight:"Organización fiscal"},{title:"Historial",content:"Consulta tus facturas y reportes.",highlight:"Datos disponibles para tu contador"}]}},
  simulacion:{personal:{title:"Simulador de Ingresos",icon:"📈",color:"from-cyan-500 to-blue-500",steps:[{title:"Proyecta tu Mes",content:"Simula cuánto podrías ganar.",highlight:"Planifica tu mes"},{title:"Variables",content:"Ajusta servicios, días y precio promedio.",highlight:"Metas claras"}]},business:{title:"Simulador Empresarial",icon:"📈",color:"from-cyan-500 to-blue-500",steps:[{title:"Proyecciones",content:"Simula diferentes escenarios para tu salón.",highlight:"Decisiones basadas en proyecciones"},{title:"Punto de Equilibrio",content:"Calcula cuántos servicios necesitas para cubrir tus gastos.",highlight:"Conoce tu punto de equilibrio"}]}},
  reportes:{personal:{title:"Tus Reportes",icon:"📊",color:"from-green-500 to-emerald-500",steps:[{title:"Ve tu Progreso",content:"Analiza tus ingresos y gastos.",highlight:"Los números no mienten"},{title:"Servicios Top",content:"Descubre cuáles servicios dejan más ganancia.",highlight:"Enfócate en ellos"}]},business:{title:"Reportes Gerenciales",icon:"📊",color:"from-green-500 to-emerald-500",steps:[{title:"Análisis Completo",content:"Ve ingresos, gastos y ganancia neta.",highlight:"Decisiones basadas en datos"},{title:"Rentabilidad",content:"Identifica servicios más rentables.",highlight:"Optimiza tu negocio"}]}},
  pagos:{personal:{title:"Tu Suscripción",icon:"💳",color:"from-pink-500 to-rose-500",steps:[{title:"Planes",content:"Consulta los planes disponibles.",highlight:"Elige el que necesitas"},{title:"Activación",content:"Tu pago será revisado antes de activar la cuenta.",highlight:"Recibirás confirmación"}]},business:{title:"Suscripción Empresarial",icon:"💳",color:"from-indigo-500 to-violet-500",steps:[{title:"Planes Comerciales",content:"Consulta los planes comerciales.",highlight:"Elige según tus necesidades"},{title:"Activación",content:"Sube el comprobante y espera la revisión.",highlight:"Soporte para cuentas empresariales"}]}}
};

const TutorialContext = createContext(null);

export function TutorialProvider({ children }) {
  const [seenTutorials, setSeenTutorials] = useState(() => {
    try {
      const saved = localStorage.getItem(TUTORIALS_SEEN_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return safeArray(parsed);
    } catch (error) {
      localStorage.removeItem(TUTORIALS_SEEN_KEY);
      return [];
    }
  });

  const markAsSeen = (tutorialKey) => {
    setSeenTutorials(prev => {
      const current = safeArray(prev);
      if (current.includes(tutorialKey)) return current;
      const next = [...current, tutorialKey];
      try { localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const hasSeen = (tutorialKey) => safeArray(seenTutorials).includes(tutorialKey);

  const resetTutorial = (tutorialKey) => {
    setSeenTutorials(prev => {
      const next = safeArray(prev).filter(k => k !== tutorialKey);
      try { localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const resetAllTutorials = () => {
    setSeenTutorials([]);
    try { localStorage.setItem(TUTORIALS_SEEN_KEY, JSON.stringify([])); } catch (e) {}
  };

  return <TutorialContext.Provider value={{seenTutorials:safeArray(seenTutorials),markAsSeen,hasSeen,resetTutorial,resetAllTutorials}}>{children}</TutorialContext.Provider>;
}
export const useTutorials = () => useContext(TutorialContext);

export function InteractiveTutorial({ feature, isOpen, onClose }) {
  const { isBusinessUser } = useAuth();
  const tutorialContext = useTutorials();
  const markAsSeen = tutorialContext?.markAsSeen || (() => {});
  const userType = isBusinessUser ? 'business' : 'personal';
  const tutorial = TUTORIALS[feature]?.[userType];
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => { if (isOpen) setCurrentStep(0); }, [isOpen, feature]);
  if (!tutorial || !isOpen) return null;
  const steps = safeArray(tutorial.steps);
  if (!steps.length) return null;
  const totalSteps = steps.length;
  const safeCurrentStep = Math.min(Math.max(currentStep,0), totalSteps-1);
  const step = steps[safeCurrentStep];
  const isLastStep = safeCurrentStep === totalSteps - 1;
  const handleNext = () => { if (isLastStep) { markAsSeen(`${feature}_${userType}`); onClose?.(); } else setCurrentStep(p => Math.min(p + 1,totalSteps-1)); };
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1,0));
  const handleSkip = () => { markAsSeen(`${feature}_${userType}`); onClose?.(); };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid={`tutorial-${feature}`}><div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"><div className={`p-5 bg-gradient-to-r ${tutorial.color} text-white`}><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><span className="text-3xl">{tutorial.icon}</span><div><h3 className="font-bold text-lg">{tutorial.title}</h3><p className="text-white/70 text-xs">{isBusinessUser ? 'Versión Empresarial' : 'Versión Personal'}</p></div></div><button onClick={handleSkip} className="p-1.5 rounded-full hover:bg-white/20 transition-colors"><X className="w-5 h-5" /></button></div><div className="flex gap-1">{steps.map((_,i)=><div key={i} className={`h-1 flex-1 rounded-full transition-all ${i<=safeCurrentStep?'bg-white':'bg-white/30'}`} />)}</div></div><div className="p-6"><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Paso {safeCurrentStep+1} de {totalSteps}</span><h4 className="font-bold text-xl text-gray-900 mt-1">{step?.title || ''}</h4><p className="text-gray-600 leading-relaxed mt-3 mb-4">{step?.content || ''}</p>{step?.example&&<div className="p-3 rounded-lg bg-gray-50 border-l-4"><p className="text-sm text-gray-700"><span className="font-semibold">💡 Ejemplo: </span>{step.example}</p></div>}{step?.highlight&&<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"><p className="text-sm text-amber-800"><Lightbulb className="w-4 h-4 inline mr-1" />{step.highlight}</p></div>}</div><div className="px-6 pb-6 flex items-center justify-between"><Button variant="ghost" onClick={handlePrev} disabled={safeCurrentStep===0} className="text-gray-500"><ChevronLeft className="w-4 h-4 mr-1" />Anterior</Button><Button onClick={handleNext} className={`bg-gradient-to-r ${tutorial.color} text-white hover:opacity-90`}>{isLastStep?<><CheckCircle2 className="w-4 h-4 mr-2" />¡Entendido!</>:<>Siguiente<ChevronRight className="w-4 h-4 ml-1" /></>}</Button></div></div></div>;
}

export function TutorialHelpButton({ feature, className = "" }) {
  const [isOpen,setIsOpen]=useState(false); const {isBusinessUser}=useAuth(); const userType=isBusinessUser?'business':'personal'; const tutorial=TUTORIALS[feature]?.[userType]; if(!tutorial)return null;
  return <><Button variant="ghost" size="sm" onClick={()=>setIsOpen(true)} className={`text-gray-500 hover:text-gray-700 gap-1.5 ${className}`} data-testid={`tutorial-help-${feature}`}><HelpCircle className="w-4 h-4" /><span className="hidden sm:inline text-xs">¿Cómo funciona?</span></Button><InteractiveTutorial feature={feature} isOpen={isOpen} onClose={()=>setIsOpen(false)}/></>;
}
export function AutoTutorial({ feature }) {
  const [isOpen,setIsOpen]=useState(false); const tutorials=useTutorials(); const {isBusinessUser}=useAuth(); const userType=isBusinessUser?'business':'personal'; const tutorialKey=`${feature}_${userType}`; const hasSeen=tutorials?.hasSeen||(()=>true); const markAsSeen=tutorials?.markAsSeen||(()=>{});
  useEffect(()=>{ if(!hasSeen(tutorialKey)){const timer=setTimeout(()=>setIsOpen(true),800);return()=>clearTimeout(timer);}},[tutorialKey,hasSeen]);
  const handleClose=()=>{setIsOpen(false);markAsSeen(tutorialKey);}; return <InteractiveTutorial feature={feature} isOpen={isOpen} onClose={handleClose}/>;
}
export function ResetTutorialsButton(){const {resetAllTutorials}=useTutorials();const [resetting,setResetting]=useState(false);const handleReset=()=>{setResetting(true);resetAllTutorials();setTimeout(()=>setResetting(false),1000);};return <Button variant="outline" size="sm" onClick={handleReset} disabled={resetting}><RotateCcw className={`w-4 h-4 mr-2 ${resetting?'animate-spin':''}`}/>{resetting?'Reiniciando...':'Ver tutoriales de nuevo'}</Button>;}
export { InteractiveTutorial as FeatureTutorial };
export { TutorialHelpButton as FeatureHelpButton };
export { AutoTutorial as AutoFeatureTutorial };
export default InteractiveTutorial;
