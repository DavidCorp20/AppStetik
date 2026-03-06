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
  Users, 
  Calendar,
  TrendingUp,
  Calculator,
  AlertTriangle,
  DollarSign,
  Building2,
  UserCheck,
  BarChart3,
  Clock,
  Target,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Box,
  Sparkles,
  Crown,
  PieChart,
  Briefcase
} from "lucide-react";

// Metric Card for business dashboard
const MetricCard = ({ title, value, change, changeType, icon: Icon, color, to }) => {
  const colors = {
    rose: { bg: 'bg-[#FDF2F7]', icon: 'bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D]', text: 'text-[#E84A8A]' },
    purple: { bg: 'bg-purple-50', icon: 'bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]', text: 'text-purple-600' },
    blue: { bg: 'bg-blue-50', icon: 'bg-gradient-to-br from-[#3B82F6] to-[#60A5FA]', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-gradient-to-br from-[#10B981] to-[#34D399]', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', icon: 'bg-gradient-to-br from-[#F59E0B] to-[#FBBF24]', text: 'text-amber-600' },
  };
  const c = colors[color] || colors.rose;

  const content = (
    <Card className={`${c.bg} border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-[#1A1A2E] mt-1">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                {changeType === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{change}% vs mes anterior</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center shadow-sm`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return to ? <Link to={to} className="block">{content}</Link> : content;
};

// Employee Status Card
const EmployeeCard = ({ employee }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-purple-100 hover:border-purple-200 transition-colors">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
      {employee.nombre?.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#1A1A2E] truncate">{employee.nombre}</p>
      <p className="text-xs text-[#64748B]">{employee.especialidad || 'General'}</p>
    </div>
    <Badge variant={employee.activo ? "default" : "secondary"} className={employee.activo ? "bg-emerald-100 text-emerald-700" : ""}>
      {employee.activo ? 'Activo' : 'Inactivo'}
    </Badge>
  </div>
);

// Inventory Alert Card
const InventoryAlertCard = ({ alert }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl ${alert.tipo === 'agotado' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.tipo === 'agotado' ? 'bg-red-100' : 'bg-amber-100'}`}>
      <Box className={`w-5 h-5 ${alert.tipo === 'agotado' ? 'text-red-600' : 'text-amber-600'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#1A1A2E] truncate">{alert.producto_nombre}</p>
      <p className={`text-xs ${alert.tipo === 'agotado' ? 'text-red-600' : 'text-amber-600'}`}>
        {alert.tipo === 'agotado' ? 'Agotado' : `Stock: ${alert.cantidad_actual}`}
      </p>
    </div>
    <Link to="/productos">
      <Button size="sm" variant="ghost" className="text-[#64748B]">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </Link>
  </div>
);

export default function ComercioDashboard() {
  const { user, isPremium } = useAuth();
  const { productos, estilos, clientes, gastos, configGanancias, getReporte, getCitasProximas } = useApp();
  const [empleados, setEmpleados] = useState([]);
  const [alertasInventario, setAlertasInventario] = useState([]);
  const [stats, setStats] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [citasHoy, setCitasHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('nailcost_token');
      if (!token) return;

      try {
        // Fetch employees
        const empRes = await fetch(`${API}/empleados`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (empRes.ok) setEmpleados(await empRes.json());

        // Fetch inventory alerts
        const alertRes = await fetch(`${API}/alertas-inventario`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (alertRes.ok) setAlertasInventario(await alertRes.json());

        // Fetch quick stats
        const statsRes = await fetch(`${API}/quick-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) setStats(await statsRes.json());

        // Fetch report
        if (estilos.length > 0) {
          const data = await getReporte();
          setReporte(data);
        }

        // Fetch today's appointments
        const citas = await getCitasProximas();
        setCitasHoy(citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API, estilos, getReporte, getCitasProximas]);

  const gastosTotal = () => {
    if (!gastos) return 0;
    return Object.entries(gastos)
      .filter(([key]) => !['clientes_mes', 'servicios_mes', 'dias_trabajo'].includes(key))
      .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);
  };

  const metaProgress = () => {
    if (!configGanancias?.meta_ingreso_mensual || !reporte?.rentabilidad_mensual_estimada) return 0;
    return Math.min(100, (reporte.rentabilidad_mensual_estimada / configGanancias.meta_ingreso_mensual) * 100);
  };

  return (
    <div className="space-y-6 pb-8" data-testid="comercio-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {user?.nombre_negocio || 'Mi Negocio'}
              </h1>
              <p className="text-sm text-[#64748B]">Panel de Control</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/calculadora">
            <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white rounded-xl">
              <Calculator className="w-4 h-4 mr-2" />
              Nueva Cotización
            </Button>
          </Link>
          <Link to="/agenda">
            <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Agenda
            </Button>
          </Link>
        </div>
      </div>

      {/* Monthly Goal Progress */}
      {reporte && configGanancias?.meta_ingreso_mensual > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Meta Mensual</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{metaProgress().toFixed(0)}%</span>
            </div>
            <Progress value={metaProgress()} className="h-3 bg-purple-100" />
            <div className="flex justify-between mt-2 text-sm text-purple-600">
              <span>${reporte.rentabilidad_mensual_estimada?.toFixed(2) || '0'}</span>
              <span>Meta: ${configGanancias.meta_ingreso_mensual}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Ingresos Est." 
          value={`$${reporte?.rentabilidad_mensual_estimada?.toFixed(0) || '0'}`} 
          icon={DollarSign} 
          color="emerald"
          to="/reportes-mensuales"
        />
        <MetricCard 
          title="Clientes" 
          value={clientes.length} 
          icon={Users} 
          color="purple"
          to="/clientes"
        />
        <MetricCard 
          title="Empleados" 
          value={empleados.filter(e => e.activo).length} 
          icon={UserCheck} 
          color="blue"
          to="/empleados"
        />
        <MetricCard 
          title="Gastos/Mes" 
          value={`$${gastosTotal().toFixed(0)}`} 
          icon={PieChart} 
          color="amber"
          to="/gastos"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h2 className="font-semibold text-[#1A1A2E]">Agenda de Hoy</h2>
                </div>
                <Link to="/agenda">
                  <Button variant="ghost" size="sm" className="text-purple-600">
                    Ver todo <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {citasHoy.length > 0 ? (
                <div className="space-y-2">
                  {citasHoy.map((cita, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="text-center">
                        <p className="text-lg font-bold text-purple-600">{cita.hora}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1A1A2E]">{cita.cliente_nombre}</p>
                        <p className="text-sm text-[#64748B]">{cita.estilo_nombre}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">{cita.estado || 'Pendiente'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#64748B]">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay citas programadas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h2 className="font-semibold text-[#1A1A2E]">Rendimiento</h2>
                </div>
                {isPremium && (
                  <Link to="/reportes-mensuales">
                    <Button variant="ghost" size="sm" className="text-purple-600">
                      Reportes <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
              
              {reporte?.servicios_ranking?.length > 0 ? (
                <div className="space-y-3">
                  {reporte.servicios_ranking.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-[#1A1A2E]">{s.nombre}</span>
                          <span className="text-sm font-bold text-purple-600">${s.rentabilidad_hora.toFixed(2)}/h</span>
                        </div>
                        <Progress value={(s.rentabilidad_hora / (reporte.servicios_ranking[0]?.rentabilidad_hora || 1)) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[#64748B]">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Agrega estilos para ver el rendimiento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-6">
          {/* Employees */}
          <Card className="border-purple-100 bg-gradient-to-br from-white to-purple-50/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-[#1A1A2E]">Equipo</h3>
                </div>
                <Link to="/empleados">
                  <Button variant="ghost" size="sm" className="text-purple-600">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {empleados.length > 0 ? (
                <div className="space-y-2">
                  {empleados.slice(0, 3).map((emp) => (
                    <EmployeeCard key={emp.id} employee={emp} />
                  ))}
                  {empleados.length > 3 && (
                    <Link to="/empleados" className="block">
                      <Button variant="ghost" className="w-full text-purple-600 mt-2">
                        Ver {empleados.length - 3} más
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#64748B] mb-3">No hay empleados registrados</p>
                  <Link to="/empleados">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                      Agregar Empleado
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className={`border-amber-100 ${alertasInventario.length > 0 ? 'bg-gradient-to-br from-white to-amber-50/50' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${alertasInventario.length > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
                  <h3 className="font-semibold text-[#1A1A2E]">Inventario</h3>
                </div>
                {alertasInventario.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700">{alertasInventario.length}</Badge>
                )}
              </div>
              
              {alertasInventario.length > 0 ? (
                <div className="space-y-2">
                  {alertasInventario.slice(0, 4).map((alert, i) => (
                    <InventoryAlertCard key={i} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-emerald-600 bg-emerald-50 rounded-xl">
                  <Box className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Inventario en orden</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium Upsell for Business */}
          {!isPremium && (
            <Card className="bg-gradient-to-br from-amber-400 to-orange-500 border-none text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <CardContent className="p-5 relative z-10">
                <Crown className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg">Premium Business</h3>
                <p className="text-sm text-white/90 mt-1 mb-4">
                  Reportes avanzados, análisis por empleado y más
                </p>
                <Button className="w-full bg-white text-amber-600 hover:bg-white/90">
                  Actualizar Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { ComercioDashboard };
