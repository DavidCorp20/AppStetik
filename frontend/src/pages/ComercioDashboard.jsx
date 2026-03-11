import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutorialModal, useComercioTutorial } from "@/components/TutorialModal";
import { AlertPopup, useAlerts } from "@/components/AlertPopup";
import { AutoTutorial, TutorialHelpButton } from "@/components/FeatureTutorial";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Users, 
  Calendar,
  TrendingUp,
  Calculator,
  AlertTriangle,
  DollarSign,
  UserCheck,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Activity,
  Minus,
  Wallet,
  CircleDollarSign,
  Star,
  Clock,
  Target,
  Eye,
  Sparkles
} from "lucide-react";

// Minimal Stat Card
const StatCard = ({ label, value, subvalue, trend, icon: Icon, color = "gray" }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all hover:border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subvalue && <p className="text-xs text-gray-500 mt-1">{subvalue}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
        color === 'blue' ? 'bg-blue-100 text-blue-600' :
        color === 'amber' ? 'bg-amber-100 text-amber-600' :
        color === 'violet' ? 'bg-violet-100 text-violet-600' :
        'bg-gray-100 text-gray-600'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${
        trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-gray-500'
      }`}>
        {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        <span>{Math.abs(trend)}% vs mes anterior</span>
      </div>
    )}
  </div>
);

// Progress Bar
const ProgressBar = ({ value, max, color = "gray", showLabel = false }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            color === 'emerald' ? 'bg-emerald-500' : 
            color === 'amber' ? 'bg-amber-500' : 
            color === 'red' ? 'bg-red-500' :
            color === 'blue' ? 'bg-blue-500' : 'bg-gray-800'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && <p className="text-right text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</p>}
    </div>
  );
};

// Status Dot
const StatusDot = ({ status }) => {
  const colors = {
    confirmada: 'bg-emerald-500',
    pendiente: 'bg-amber-500',
    cancelada: 'bg-red-500',
    completada: 'bg-blue-500',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />;
};

// Top Service Card (Professional Design)
const TopServiceCard = ({ service, rank, maxRentability }) => {
  const rentabilidad = service.rentabilidad_hora || 0;
  const percentage = maxRentability > 0 ? (rentabilidad / maxRentability) * 100 : 0;
  
  const rankColors = {
    1: 'from-amber-400 to-orange-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-amber-600 to-amber-700',
  };
  
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rankColors[rank] || 'from-gray-200 to-gray-300'} flex items-center justify-center flex-shrink-0`}>
        {rank <= 3 ? <Star className="w-4 h-4 text-white" /> : <span className="text-xs font-bold text-gray-600">{rank}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{service.nombre}</p>
        <div className="flex items-center gap-2 mt-1">
          <ProgressBar value={percentage} max={100} color={rank === 1 ? 'emerald' : 'gray'} />
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">${rentabilidad.toFixed(0)}</p>
        <p className="text-xs text-gray-500">por hora</p>
      </div>
    </div>
  );
};

export default function ComercioDashboard() {
  const { user, isPremium } = useAuth();
  const { productos = [], estilos = [], clientes = [], gastos = [], configGanancias, getReporte, getCitasProximas } = useApp();
  const [empleados, setEmpleados] = useState([]);
  const [stats, setStats] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [ingresos, setIngresos] = useState({ mes: 0, anterior: 0 });
  const [gastosTotal, setGastosTotal] = useState({ mes: 0, anterior: 0 });
  const [loading, setLoading] = useState(true);
  const [showAllServices, setShowAllServices] = useState(false);
  
  // Tutorial hook for Comercio
  const { showTutorial, closeTutorial } = useComercioTutorial();
  
  // Alerts hook
  const { alerts, dismissAlert } = useAlerts({ 
    productos, 
    reporte, 
    gastos, 
    configGanancias 
  });

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nailcost_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [empRes, repRes, citasRes] = await Promise.all([
          fetch(`${API}/empleados`, { headers }).then(r => r.json()).catch(() => []),
          getReporte(),
          getCitasProximas(7)
        ]);
        
        setEmpleados(empRes || []);
        setReporte(repRes);
        
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayCitas = (citasRes || []).filter(c => c.fecha === today);
        setCitasHoy(todayCitas);
        
        // Calculate totals
        const gastosArr = Array.isArray(gastos) ? gastos : [];
        const gastosSum = gastosArr.reduce((sum, g) => sum + (g.monto || 0), 0);
        setGastosTotal({ mes: gastosSum, anterior: gastosSum * 0.9 });
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gastos]);

  // Calculate alerts
  const getStock = (p) => p.cantidad_disponible ?? p.cantidad_comprada ?? 0;
  const criticalAlerts = productos.filter(p => getStock(p) === 0).length;
  const warningAlerts = productos.filter(p => {
    const stock = getStock(p);
    const min = p.stock_minimo || 5;
    return stock > 0 && stock <= min;
  }).length;

  // Calculate goal progress
  const metaProgress = () => {
    if (!configGanancias?.meta_ingreso_mensual || configGanancias.meta_ingreso_mensual === 0) return 0;
    return ((reporte?.rentabilidad_mensual_estimada || 0) / configGanancias.meta_ingreso_mensual) * 100;
  };

  // Top services - limit to 3 or show all
  const topServices = reporte?.servicios_ranking || [];
  const displayedServices = showAllServices ? topServices : topServices.slice(0, 3);
  const maxRentability = topServices[0]?.rentabilidad_hora || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto" data-testid="comercio-dashboard">
      {/* Tutorial */}
      <AutoTutorial feature="dashboard" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Resumen de tu negocio</p>
          </div>
          <TutorialHelpButton feature="dashboard" />
        </div>
        <div className="flex gap-2">
          <Link to="/calculadora">
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Calculator className="w-4 h-4 mr-2" />
              Cotizar
            </Button>
          </Link>
          <Link to="/inventario">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Package className="w-4 h-4 mr-2" />
              Inventario
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Ingresos Est." 
          value={formatCurrency(reporte?.rentabilidad_mensual_estimada, 0)}
          subvalue="Este mes"
          icon={CircleDollarSign}
          color="emerald"
        />
        <StatCard 
          label="Gastos" 
          value={formatCurrency(gastosTotal.mes, 0)}
          subvalue="Operativos"
          icon={Wallet}
          color="amber"
        />
        <StatCard 
          label="Clientes" 
          value={clientes.length}
          subvalue="Registrados"
          icon={Users}
          color="blue"
        />
        <StatCard 
          label="Inventario" 
          value={productos.length}
          subvalue={criticalAlerts > 0 ? `${criticalAlerts} agotados` : `${warningAlerts} alertas`}
          icon={Package}
          color={criticalAlerts > 0 ? 'amber' : 'violet'}
        />
      </div>

      {/* Goal Progress */}
      {configGanancias?.meta_ingreso_mensual > 0 && (
        <Card className="border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Meta Mensual</p>
                  <p className="text-xs text-gray-500">Progreso de ingresos</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${metaProgress() >= 100 ? 'text-emerald-600' : metaProgress() >= 70 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {metaProgress().toFixed(0)}%
                </p>
              </div>
            </div>
            <ProgressBar 
              value={reporte?.rentabilidad_mensual_estimada || 0} 
              max={configGanancias.meta_ingreso_mensual}
              color={metaProgress() >= 100 ? 'emerald' : metaProgress() >= 70 ? 'amber' : 'gray'}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{formatCurrency(reporte?.rentabilidad_mensual_estimada, 0)} generados</span>
              <span>Meta: {formatCurrency(configGanancias.meta_ingreso_mensual, 0)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - Wider */}
        <div className="lg:col-span-3 space-y-6">
          {/* Today's Appointments */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Agenda de Hoy</CardTitle>
                    <p className="text-xs text-gray-500">{citasHoy.length} citas programadas</p>
                  </div>
                </div>
                <Link to="/agenda">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                    Ver todo <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {citasHoy.length > 0 ? (
                <div className="space-y-2">
                  {citasHoy.slice(0, 5).map((cita, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-12 text-center">
                        <p className="text-sm font-bold text-gray-900">{cita.hora}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{cita.cliente_nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{cita.estilo_nombre}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusDot status={cita.estado || 'pendiente'} />
                        <span className="text-xs text-gray-500 capitalize">{cita.estado || 'Pendiente'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Sin citas para hoy</p>
                  <Link to="/agenda">
                    <Button size="sm" variant="outline" className="mt-3">
                      Agendar cita
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Summary */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Tu Equipo</CardTitle>
                    <p className="text-xs text-gray-500">{empleados.filter(e => e.activo).length} activos</p>
                  </div>
                </div>
                <Link to="/empleados">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                    Gestionar <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {empleados.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {empleados.slice(0, 4).map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${emp.activo ? 'bg-violet-500' : 'bg-gray-400'}`}>
                        {emp.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{emp.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">{emp.especialidad || 'General'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <UserCheck className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Sin empleados registrados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Services - IMPROVED DESIGN */}
          <Card className="border-gray-100">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">Top Servicios</CardTitle>
                    <p className="text-xs text-gray-500">Por rentabilidad/hora</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {topServices.length > 0 ? (
                <div className="space-y-1">
                  {displayedServices.map((s, i) => (
                    <TopServiceCard 
                      key={i} 
                      service={s} 
                      rank={i + 1} 
                      maxRentability={maxRentability} 
                    />
                  ))}
                  {topServices.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2 text-gray-500"
                      onClick={() => setShowAllServices(!showAllServices)}
                    >
                      {showAllServices ? 'Ver menos' : `Ver ${topServices.length - 3} más`}
                      <Eye className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <BarChart3 className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Agrega estilos para ver análisis</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card className="border-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Resumen Rápido
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Estilos activos</span>
                  <span className="font-semibold text-white">{estilos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Citas hoy</span>
                  <span className="font-semibold text-white">{citasHoy.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Alertas stock</span>
                  <span className={`font-semibold ${criticalAlerts > 0 ? 'text-red-400' : warningAlerts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {criticalAlerts + warningAlerts || '✓'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Rentabilidad</span>
                  <span className={`font-semibold ${(reporte?.rentabilidad_mensual_estimada || 0) >= gastosTotal.mes ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(reporte?.rentabilidad_mensual_estimada || 0) >= gastosTotal.mes ? '+' : '-'}
                    ${Math.abs((reporte?.rentabilidad_mensual_estimada || 0) - gastosTotal.mes).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium CTA */}
          {!isPremium && (
            <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-5 relative">
                <Crown className="w-8 h-8 mb-3" />
                <h3 className="font-bold">Premium Business</h3>
                <p className="text-sm text-white/80 mt-1 mb-4">Reportes avanzados, más empleados y sin límites</p>
                <Button className="w-full bg-white text-amber-600 hover:bg-gray-100">
                  Actualizar Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Tutorial Modal for Comercio */}
      <TutorialModal 
        isOpen={showTutorial} 
        onClose={closeTutorial} 
        variant="comercio" 
      />
      
      {/* Alert Popup */}
      <AlertPopup alerts={alerts} onDismiss={dismissAlert} />
    </div>
  );
}

export { ComercioDashboard };
