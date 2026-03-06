import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Palette, 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Loader2,
  Database,
  Bell,
  Users,
  Calendar,
  Target,
  Zap,
  Award,
  ChevronRight,
  Play,
  Star,
  Crown,
  BarChart3,
  Clock,
  Heart
} from "lucide-react";
import { toast } from "sonner";

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{prefix}{typeof value === 'number' && value % 1 !== 0 ? count.toFixed(2) : count}{suffix}</span>;
};

// Interactive Stat Card
const StatCard = ({ icon: Icon, label, value, sublabel, color, to, delay = 0 }) => {
  const colors = {
    rose: { bg: 'bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D]', light: 'bg-[#FDF2F7]', text: 'text-[#E84A8A]' },
    purple: { bg: 'bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]', light: 'bg-purple-50', text: 'text-purple-600' },
    amber: { bg: 'bg-gradient-to-br from-[#F59E0B] to-[#FBBF24]', light: 'bg-amber-50', text: 'text-amber-600' },
    emerald: { bg: 'bg-gradient-to-br from-[#10B981] to-[#34D399]', light: 'bg-emerald-50', text: 'text-emerald-600' },
    blue: { bg: 'bg-gradient-to-br from-[#3B82F6] to-[#60A5FA]', light: 'bg-blue-50', text: 'text-blue-600' },
  };
  const c = colors[color] || colors.rose;

  const content = (
    <div 
      className="group relative bg-white rounded-3xl p-5 border border-[#FCE7F0] card-hover cursor-pointer overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Decorative blob */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 ${c.light} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-[#1A1A2E]">
            <AnimatedCounter value={parseFloat(value) || 0} prefix={typeof value === 'string' && value.startsWith('$') ? '$' : ''} />
          </p>
          {sublabel && <p className="text-xs text-[#94A3B8] mt-1">{sublabel}</p>}
        </div>
        <div className={`w-14 h-14 ${c.bg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      
      {/* Hover indicator */}
      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className={`w-5 h-5 ${c.text}`} />
      </div>
    </div>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// Big Action Button
const BigActionButton = ({ icon: Icon, label, description, to, primary, onClick }) => {
  const content = (
    <button
      onClick={onClick}
      className={`group relative w-full p-5 rounded-3xl text-left transition-all duration-300 overflow-hidden ${
        primary 
          ? 'bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white shadow-xl shadow-[#E84A8A]/30 hover:shadow-2xl hover:shadow-[#E84A8A]/40 hover:-translate-y-1'
          : 'bg-white border-2 border-[#FCE7F0] hover:border-[#E84A8A]/30 hover:shadow-lg'
      }`}
    >
      {primary && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
      
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          primary ? 'bg-white/20' : 'bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D]'
        } group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-7 h-7 ${primary ? 'text-white' : 'text-white'}`} />
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-lg ${primary ? 'text-white' : 'text-[#1A1A2E]'}`}>{label}</p>
          {description && (
            <p className={`text-sm ${primary ? 'text-white/80' : 'text-[#64748B]'}`}>{description}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          primary ? 'bg-white/20' : 'bg-[#FDF2F7]'
        } group-hover:translate-x-1 transition-transform`}>
          <Play className={`w-4 h-4 ${primary ? 'text-white' : 'text-[#E84A8A]'}`} fill="currentColor" />
        </div>
      </div>
    </button>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// Service Ranking Item
const RankingItem = ({ rank, name, time, value, delay }) => {
  const badges = {
    1: { bg: 'bg-gradient-to-r from-amber-400 to-yellow-400', icon: Crown },
    2: { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', icon: Award },
    3: { bg: 'bg-gradient-to-r from-orange-400 to-amber-500', icon: Star },
  };
  const badge = badges[rank];

  return (
    <div 
      className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#FCE7F0] hover:border-[#E84A8A]/30 hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
        badge ? badge.bg : 'bg-[#E84A8A]/10 text-[#E84A8A]'
      }`}>
        {badge ? <badge.icon className="w-5 h-5" /> : rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1A2E] truncate">{name}</p>
        <p className="text-xs text-[#64748B] flex items-center gap-1">
          <Clock className="w-3 h-3" /> {time} min
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#E84A8A] text-lg">${value}</p>
        <p className="text-xs text-[#64748B]">por hora</p>
      </div>
    </div>
  );
};

// Alert Item
const AlertItem = ({ message, type }) => {
  const styles = {
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-rose-50 border-rose-200 text-rose-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  
  return (
    <div className={`p-3 rounded-xl border text-sm ${styles[type] || styles.info}`}>
      {message}
    </div>
  );
};

export default function Dashboard() {
  const { user, isPremium } = useAuth();
  const { 
    productos, estilos, disenos, gastos, configGanancias, alertas, clientes,
    getCitasProximas, loading, seedData, getReporte 
  } = useApp();
  
  const [reporte, setReporte] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [citasProximas, setCitasProximas] = useState([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (estilos.length > 0) {
        try {
          const data = await getReporte();
          setReporte(data);
        } catch (err) { console.error(err); }
      }
      try {
        const citas = await getCitasProximas();
        setCitasProximas(citas);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [estilos, getReporte, getCitasProximas]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedData();
      toast.success("Datos de ejemplo cargados");
    } catch (err) {
      toast.error("Error al cargar datos");
    } finally {
      setSeeding(false);
    }
  };

  const gastoPorServicio = () => {
    if (!gastos) return 0;
    const total = Object.values(gastos).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    return (gastos?.servicios_mes || 60) > 0 ? total / (gastos?.servicios_mes || 60) : 0;
  };

  const metaProgress = () => {
    if (!configGanancias?.meta_ingreso_mensual || !reporte?.rentabilidad_mensual_estimada) return 0;
    return Math.min(100, (reporte.rentabilidad_mensual_estimada / configGanancias.meta_ingreso_mensual) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] animate-pulse mx-auto" />
            <Sparkles className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[#64748B] mt-4">Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  const isEmpty = productos.length === 0 && estilos.length === 0;
  const visibleAlerts = showAllAlerts ? alertas : alertas.slice(0, 3);

  return (
    <div className="space-y-6 pb-8" data-testid="dashboard">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#E84A8A] via-[#FF6B9D] to-[#FF8FAB] rounded-[32px] p-6 md:p-8 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-10 right-20 w-4 h-4 bg-white/30 rounded-full animate-float" />
        <div className="absolute bottom-10 right-40 w-3 h-3 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="w-4 h-4 text-white/80" fill="currentColor" />
                <span className="text-white/80 text-sm">Bienvenida de vuelta</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                {user?.nombre || 'Profesional'}
              </h1>
              {user?.nombre_negocio && (
                <p className="text-white/90 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {user.nombre_negocio}
                </p>
              )}
            </div>
            
            {isEmpty ? (
              <Button 
                onClick={handleSeedData} 
                disabled={seeding}
                className="bg-white text-[#E84A8A] hover:bg-white/90 rounded-full px-6 h-12 shadow-lg animate-fade-in"
              >
                {seeding ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Database className="w-5 h-5 mr-2" />}
                Cargar Datos Demo
              </Button>
            ) : (
              <Link to="/calculadora">
                <Button className="bg-white text-[#E84A8A] hover:bg-white/90 rounded-full px-6 h-12 shadow-lg animate-fade-in group">
                  <Calculator className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Calcular Precio
                </Button>
              </Link>
            )}
          </div>

          {/* Progress Bar */}
          {reporte && configGanancias?.meta_ingreso_mensual > 0 && (
            <div className="mt-6 bg-white/15 backdrop-blur rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Meta mensual</span>
                </div>
                <span className="text-2xl font-bold">{metaProgress().toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${metaProgress()}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/70">
                <span>${reporte.rentabilidad_mensual_estimada?.toFixed(2) || '0'} ganados</span>
                <span>Meta: ${configGanancias.meta_ingreso_mensual}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Productos" value={productos.length} sublabel="en inventario" color="amber" to="/productos" delay={0} />
        <StatCard icon={Palette} label="Estilos" value={estilos.length} sublabel="servicios" color="rose" to="/estilos" delay={0.1} />
        <StatCard icon={Users} label="Clientes" value={clientes.length} sublabel="registrados" color="purple" to="/clientes" delay={0.2} />
        <StatCard icon={DollarSign} label="Costo/Serv" value={`$${gastoPorServicio().toFixed(2)}`} sublabel="operativo" color="emerald" to="/gastos" delay={0.3} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profitability Card */}
          <Card className="bg-white border-[#FCE7F0] rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="p-5 border-b border-[#FCE7F0] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Rentabilidad
                  </h2>
                </div>
                {isPremium && (
                  <Link to="/reportes-mensuales">
                    <Button variant="ghost" size="sm" className="text-[#E84A8A] hover:bg-[#FDF2F7] rounded-full">
                      Ver reportes <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="p-5">
                {reporte && reporte.servicios_ranking?.length > 0 ? (
                  <div className="space-y-5">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-[#FDF2F7] to-[#FFE4EE] rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-[#E84A8A]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <p className="text-xs font-semibold text-[#E84A8A] uppercase tracking-wider">Rentabilidad Mensual</p>
                        <p className="text-3xl font-bold text-[#1A1A2E] mt-2">
                          $<AnimatedCounter value={reporte.rentabilidad_mensual_estimada || 0} />
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">estimada</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Promedio/Hora</p>
                        <p className="text-3xl font-bold text-[#1A1A2E] mt-2">
                          $<AnimatedCounter value={(reporte.servicios_ranking.reduce((a, b) => a + b.rentabilidad_hora, 0) / reporte.servicios_ranking.length) || 0} />
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">todos los servicios</p>
                      </div>
                    </div>

                    {/* Service Ranking */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-[#E84A8A]" />
                        <h3 className="font-semibold text-[#1A1A2E]">Top Servicios Rentables</h3>
                      </div>
                      <div className="space-y-3">
                        {reporte.servicios_ranking.slice(0, 5).map((s, i) => (
                          <RankingItem 
                            key={i} 
                            rank={i + 1} 
                            name={s.nombre} 
                            time={s.tiempo_minutos} 
                            value={s.rentabilidad_hora.toFixed(2)} 
                            delay={0.1 * i}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-[#FDF2F7] flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-10 h-10 text-[#E84A8A]/50" />
                    </div>
                    <p className="text-[#64748B] mb-4">Agrega estilos para ver tu rentabilidad</p>
                    <Link to="/estilos">
                      <Button className="btn-rose rounded-full px-6">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Agregar Estilos
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2 px-1">
              <Zap className="w-5 h-5 text-[#E84A8A]" />
              Acciones Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <BigActionButton icon={Calculator} label="Nuevo Cálculo" description="Calcula el precio de un servicio" to="/calculadora" primary />
              <BigActionButton icon={Calendar} label="Nueva Cita" description="Agenda una cita con cliente" to="/agenda" />
              <BigActionButton icon={Users} label="Nuevo Cliente" description="Registra un cliente nuevo" to="/clientes" />
              <BigActionButton icon={Package} label="Nuevo Producto" description="Agrega un producto al inventario" to="/productos" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {citasProximas.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-3xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-800">Próximas Citas</h3>
                  <Badge className="ml-auto bg-blue-500 text-white">{citasProximas.length}</Badge>
                </div>
                <div className="space-y-2">
                  {citasProximas.slice(0, 3).map((cita, i) => (
                    <div key={i} className="p-3 bg-white rounded-xl border border-blue-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-[#1A1A2E]">{cita.cliente_nombre}</p>
                          <p className="text-xs text-[#64748B]">{cita.estilo_nombre}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{cita.hora}</p>
                          <p className="text-xs text-[#64748B]">{cita.fecha}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/agenda">
                  <Button variant="ghost" className="w-full mt-3 text-blue-600 hover:bg-blue-100 rounded-xl">
                    Ver agenda <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          <Card className="bg-white border-[#FCE7F0] rounded-3xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-[#1A1A2E]">Alertas</h3>
                </div>
                {alertas.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700">{alertas.length}</Badge>
                )}
              </div>
              
              {alertas.length > 0 ? (
                <div className="space-y-2">
                  {visibleAlerts.map((a, i) => (
                    <AlertItem key={i} message={a.mensaje} type={a.tipo} />
                  ))}
                  {alertas.length > 3 && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-[#64748B] hover:text-[#E84A8A]"
                      onClick={() => setShowAllAlerts(!showAllAlerts)}
                    >
                      {showAllAlerts ? 'Ver menos' : `Ver ${alertas.length - 3} más`}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <p className="text-emerald-600 text-sm flex items-center justify-center gap-2">
                    <Star className="w-4 h-4" fill="currentColor" />
                    Todo en orden
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Upsell */}
          {!isPremium && (
            <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-200 rounded-3xl overflow-hidden">
              <CardContent className="p-5 text-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce-soft">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-amber-800 text-lg">Pasa a Premium</h3>
                  <p className="text-sm text-amber-700 mt-1 mb-4">
                    Reportes, simulación y más
                  </p>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full shadow-lg">
                    Ver Beneficios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { Dashboard };
