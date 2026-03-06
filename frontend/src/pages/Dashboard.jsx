import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import { 
  Package, 
  Palette, 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Clock,
  Loader2,
  Database,
  Bell,
  ChevronDown,
  Users,
  Calendar,
  Target,
  Zap,
  TrendingDown,
  BarChart3,
  PlusCircle,
  ArrowUpRight,
  Star,
  Award
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ['#A17A8E', '#9C8B7E', '#D4A5A5', '#7A9E7A', '#D4A373'];

// Metric Card Component - Interactive
const MetricCard = ({ title, value, icon: Icon, color, subtitle, trend, to }) => {
  const colorStyles = {
    mauve: { bg: 'bg-[#A17A8E]/10', icon: 'text-[#A17A8E]', border: 'hover:border-[#A17A8E]/30' },
    taupe: { bg: 'bg-[#9C8B7E]/10', icon: 'text-[#9C8B7E]', border: 'hover:border-[#9C8B7E]/30' },
    rose: { bg: 'bg-[#D4A5A5]/20', icon: 'text-[#D4A5A5]', border: 'hover:border-[#D4A5A5]/30' },
    green: { bg: 'bg-[#7A9E7A]/10', icon: 'text-[#7A9E7A]', border: 'hover:border-[#7A9E7A]/30' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'hover:border-amber-200' },
  };
  
  const styles = colorStyles[color] || colorStyles.mauve;
  
  const content = (
    <Card className={`bg-white border-[#E8E2DF] ${styles.border} hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[#9C8B7E] uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold text-[#3D3231]">{value}</p>
              {trend && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${trend > 0 ? 'text-[#7A9E7A]' : 'text-[#C45C5C]'}`}>
                  {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-[#9C8B7E] mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-2xl ${styles.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${styles.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// Quick Action Button
const QuickActionButton = ({ icon: Icon, label, to, primary, onClick }) => {
  const content = (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
        primary 
          ? 'bg-gradient-to-r from-[#A17A8E] to-[#8B6578] text-white shadow-lg shadow-[#A17A8E]/25 hover:shadow-xl hover:shadow-[#A17A8E]/30 hover:-translate-y-0.5'
          : 'bg-white border border-[#E8E2DF] text-[#3D3231] hover:border-[#A17A8E]/30 hover:bg-[#FAF7F5]'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        primary ? 'bg-white/20' : 'bg-[#A17A8E]/10'
      }`}>
        <Icon className={`w-5 h-5 ${primary ? 'text-white' : 'text-[#A17A8E]'}`} />
      </div>
      <span className="font-medium">{label}</span>
      <ArrowRight className={`w-4 h-4 ml-auto ${primary ? 'text-white/70' : 'text-[#9C8B7E]'}`} />
    </button>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// Mini Chart for Services
const MiniServiceChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  return (
    <ResponsiveContainer width="100%" height={60}>
      <BarChart data={data.slice(0, 5)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Bar dataKey="rentabilidad_hora" fill="#A17A8E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Alerts Card Component
const AlertsCard = ({ alertas, isEmpty, gastos, calcGastoTotal }) => {
  const [showAll, setShowAll] = useState(false);
  const visibleAlertas = showAll ? alertas : alertas.slice(0, 3);
  const hasMore = alertas.length > 3;

  const getAlertStyle = (tipo) => {
    switch (tipo) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className="bg-white border-[#E8E2DF]" data-testid="alerts-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertas
          </CardTitle>
          {alertas.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-0">
              {alertas.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {alertas.length > 0 ? (
          <>
            {visibleAlertas.map((alerta, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border text-sm animate-fade-in ${getAlertStyle(alerta.tipo)}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {alerta.mensaje}
              </div>
            ))}
            {hasMore && (
              <Button 
                variant="ghost" 
                className="w-full justify-center text-[#9C8B7E] hover:text-[#A17A8E] h-8"
                onClick={() => setShowAll(!showAll)}
              >
                <span className="text-sm">{showAll ? 'Ver menos' : `Ver más (${alertas.length - 3})`}</span>
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showAll ? 'rotate-180' : ''}`} />
              </Button>
            )}
          </>
        ) : isEmpty ? (
          <div className="p-4 bg-[#A17A8E]/5 rounded-xl border border-[#A17A8E]/20">
            <p className="text-sm text-[#6B5E5C]">
              Comienza agregando productos y estilos para calcular tus costos.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-[#7A9E7A]/10 rounded-xl border border-[#7A9E7A]/20">
            <p className="text-sm text-[#7A9E7A] flex items-center gap-2">
              <Star className="w-4 h-4" />
              Todo configurado correctamente
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Service Ranking Card
const ServiceRankingCard = ({ ranking }) => {
  if (!ranking || ranking.length === 0) return null;

  return (
    <div className="space-y-3">
      {ranking.slice(0, 5).map((servicio, idx) => (
        <div 
          key={idx}
          className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8E2DF] hover:border-[#A17A8E]/30 hover:shadow-md transition-all duration-300 cursor-pointer group"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
            idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
            idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
            idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
            'bg-[#F5F1EE] text-[#6B5E5C]'
          }`}>
            {idx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-[#3D3231] truncate">{servicio.nombre}</p>
            <p className="text-xs text-[#9C8B7E]">{servicio.tiempo_minutos} min</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#A17A8E]">${servicio.rentabilidad_hora.toFixed(2)}</p>
            <p className="text-xs text-[#9C8B7E]">por hora</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#9C8B7E] group-hover:text-[#A17A8E] transition-colors" />
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user, isPremium } = useAuth();
  const { 
    productos, 
    estilos, 
    disenos, 
    gastos, 
    configGanancias,
    alertas,
    clientes,
    citas,
    getCitasProximas,
    loading, 
    seedData,
    getReporte 
  } = useApp();
  
  const [reporte, setReporte] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [citasProximas, setCitasProximas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (estilos.length > 0) {
        try {
          const data = await getReporte();
          setReporte(data);
        } catch (err) {
          console.error('Error fetching reporte:', err);
        }
      }
      try {
        const citasData = await getCitasProximas();
        setCitasProximas(citasData);
      } catch (err) {
        console.error('Error fetching citas:', err);
      }
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

  const calcGastoTotal = () => {
    if (!gastos) return 0;
    return Object.values(gastos).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  };

  const gastoPorServicio = () => {
    const total = calcGastoTotal();
    const servicios = gastos?.servicios_mes || 60;
    return servicios > 0 ? total / servicios : 0;
  };

  const metaProgress = () => {
    if (!configGanancias?.meta_ingreso_mensual || !reporte?.rentabilidad_mensual_estimada) return 0;
    return Math.min(100, (reporte.rentabilidad_mensual_estimada / configGanancias.meta_ingreso_mensual) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="dashboard-loading">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#A17A8E] mx-auto mb-3" />
          <p className="text-[#9C8B7E]">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  const isEmpty = productos.length === 0 && estilos.length === 0 && disenos.length === 0;

  return (
    <div className="space-y-6 animate-fade-in pb-6" data-testid="dashboard">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#A17A8E] to-[#8B6578] rounded-3xl p-6 md:p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium">Bienvenida de vuelta</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                {user?.nombre || 'Profesional'}
              </h1>
              {user?.nombre_negocio && (
                <p className="text-white/80 mt-1">{user.nombre_negocio}</p>
              )}
            </div>
            
            {isEmpty ? (
              <Button 
                onClick={handleSeedData} 
                disabled={seeding}
                className="bg-white text-[#A17A8E] hover:bg-white/90 rounded-full px-6 shadow-lg"
                data-testid="seed-data-btn"
              >
                {seeding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                Cargar Datos de Ejemplo
              </Button>
            ) : (
              <Link to="/calculadora">
                <Button className="bg-white text-[#A17A8E] hover:bg-white/90 rounded-full px-6 shadow-lg">
                  <Calculator className="w-4 h-4 mr-2" />
                  Nuevo Cálculo
                </Button>
              </Link>
            )}
          </div>

          {/* Progress to Goal */}
          {reporte && configGanancias?.meta_ingreso_mensual > 0 && (
            <div className="mt-6 bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">Progreso hacia tu meta mensual</span>
                <span className="font-bold">{metaProgress().toFixed(0)}%</span>
              </div>
              <Progress value={metaProgress()} className="h-2 bg-white/20" />
              <div className="flex justify-between mt-2 text-xs text-white/60">
                <span>${reporte.rentabilidad_mensual_estimada?.toFixed(2) || '0.00'} estimado</span>
                <span>Meta: ${configGanancias.meta_ingreso_mensual}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid - 2x2 on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard 
          title="Productos" 
          value={productos.length} 
          icon={Package} 
          color="amber"
          subtitle="en inventario"
          to="/productos"
        />
        <MetricCard 
          title="Estilos" 
          value={estilos.length} 
          icon={Palette} 
          color="mauve"
          subtitle="servicios"
          to="/estilos"
        />
        <MetricCard 
          title="Clientes" 
          value={clientes.length} 
          icon={Users} 
          color="taupe"
          subtitle="registrados"
          to="/clientes"
        />
        <MetricCard 
          title="Costo/Servicio" 
          value={`$${gastoPorServicio().toFixed(2)}`} 
          icon={DollarSign} 
          color="green"
          subtitle="gasto operativo"
          to="/gastos"
        />
      </div>

      {/* Main Content - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profitability Card */}
          <Card className="bg-white border-[#E8E2DF] overflow-hidden">
            <CardHeader className="pb-2 border-b border-[#F5F1EE]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <TrendingUp className="w-5 h-5 text-[#7A9E7A]" />
                  Rentabilidad
                </CardTitle>
                {isPremium && (
                  <Link to="/reportes-mensuales">
                    <Button variant="ghost" size="sm" className="text-[#A17A8E] hover:bg-[#A17A8E]/10">
                      Ver reportes <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {reporte && reporte.servicios_ranking?.length > 0 ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#A17A8E]/10 to-[#A17A8E]/5 rounded-2xl p-4 border border-[#A17A8E]/10">
                      <p className="text-xs text-[#6B5E5C] uppercase tracking-wider">Rentabilidad Mensual</p>
                      <p className="text-2xl md:text-3xl font-bold text-[#A17A8E] mt-1">
                        ${reporte.rentabilidad_mensual_estimada?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-xs text-[#9C8B7E] mt-1">estimada</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#7A9E7A]/10 to-[#7A9E7A]/5 rounded-2xl p-4 border border-[#7A9E7A]/10">
                      <p className="text-xs text-[#6B5E5C] uppercase tracking-wider">Promedio/Hora</p>
                      <p className="text-2xl md:text-3xl font-bold text-[#7A9E7A] mt-1">
                        ${(reporte.servicios_ranking.reduce((a, b) => a + b.rentabilidad_hora, 0) / reporte.servicios_ranking.length).toFixed(2)}
                      </p>
                      <p className="text-xs text-[#9C8B7E] mt-1">todos los servicios</p>
                    </div>
                  </div>

                  {/* Service Ranking */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-[#3D3231] flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#A17A8E]" />
                        Top Servicios Rentables
                      </h4>
                    </div>
                    <ServiceRankingCard ranking={reporte.servicios_ranking} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-[#F5F1EE] flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-[#9C8B7E]" />
                  </div>
                  <p className="text-[#6B5E5C] mb-4">Agrega estilos para ver tu rentabilidad</p>
                  <Link to="/estilos">
                    <Button className="bg-[#A17A8E] hover:bg-[#8B6578] text-white rounded-full">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Agregar Estilos
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          {configGanancias && (
            <Card className="bg-white border-[#E8E2DF]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Target className="w-5 h-5 text-[#9C8B7E]" />
                  Tu Configuración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: '% Ganancia', value: `${configGanancias.porcentaje_ganancia}%` },
                    { label: 'Meta Mensual', value: `$${configGanancias.meta_ingreso_mensual}` },
                    { label: 'Meta Diaria', value: `$${configGanancias.meta_diaria}` },
                    { label: 'Sueldo Obj.', value: `$${configGanancias.sueldo_objetivo}` },
                    { label: '$/Hora', value: `$${configGanancias.costo_hora_trabajo}` },
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#FAF7F5] rounded-xl text-center hover:bg-[#F5F1EE] transition-colors">
                      <p className="text-xs text-[#9C8B7E]">{item.label}</p>
                      <p className="text-lg font-bold text-[#3D3231] mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Actions & Alerts */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {citasProximas.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-blue-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Bell className="w-5 h-5" />
                  Próximas Citas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {citasProximas.slice(0, 3).map((cita, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-blue-100 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#3D3231]">{cita.cliente_nombre}</p>
                        <p className="text-xs text-[#9C8B7E]">{cita.estilo_nombre}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">{cita.hora}</p>
                        <p className="text-xs text-[#9C8B7E]">{cita.fecha}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <Link to="/agenda" className="block">
                  <Button variant="ghost" className="w-full text-blue-700 hover:bg-blue-100">
                    Ver agenda completa <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          <AlertsCard 
            alertas={alertas} 
            isEmpty={isEmpty} 
            gastos={gastos} 
            calcGastoTotal={calcGastoTotal} 
          />

          {/* Quick Actions */}
          <Card className="bg-white border-[#E8E2DF]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-[#3D3231]" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Zap className="w-5 h-5 text-[#A17A8E]" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickActionButton 
                icon={Calculator} 
                label="Nuevo Cálculo" 
                to="/calculadora" 
                primary 
              />
              <QuickActionButton 
                icon={Users} 
                label="Agregar Cliente" 
                to="/clientes" 
              />
              <QuickActionButton 
                icon={Calendar} 
                label="Nueva Cita" 
                to="/agenda" 
              />
              <QuickActionButton 
                icon={Package} 
                label="Agregar Producto" 
                to="/productos" 
              />
            </CardContent>
          </Card>

          {/* Premium Upsell for Free Users */}
          {!isPremium && (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-amber-800 mb-1">Actualiza a Premium</h3>
                <p className="text-sm text-amber-700 mb-3">
                  Desbloquea reportes, simulación y más
                </p>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full w-full">
                  Ver Beneficios
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { Dashboard };
