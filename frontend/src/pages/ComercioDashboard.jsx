import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Crown,
  PieChart,
  Briefcase,
  Activity,
  FileText,
  Settings,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

// KPI Card Component
const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, variant = "default" }) => {
  const variants = {
    default: "kpi-card",
    blue: "kpi-card kpi-card-blue",
    green: "kpi-card kpi-card-green",
    amber: "kpi-card kpi-card-amber",
    purple: "kpi-card kpi-card-purple",
  };

  return (
    <div className={variants[variant]}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#0F172A]">{value}</p>
          {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center shadow-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span className="font-medium">{trendValue}</span>
          <span className="text-[#64748B]">vs mes anterior</span>
        </div>
      )}
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    confirmada: { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
    pendiente: { bg: "bg-amber-100", text: "text-amber-700", icon: AlertCircle },
    cancelada: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
  };
  const s = styles[status] || styles.pendiente;
  const Icon = s.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Appointment Row
const AppointmentRow = ({ cita, index }) => (
  <div 
    className="flex items-center gap-4 p-4 bg-white border border-[#E2E8F0] rounded-xl hover:border-[#3B82F6]/30 hover:shadow-sm transition-all animate-slide-up"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex flex-col items-center justify-center text-white">
      <span className="text-lg font-bold leading-none">{cita.hora?.split(':')[0]}</span>
      <span className="text-xs opacity-80">{cita.hora?.split(':')[1]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-[#0F172A] truncate">{cita.cliente_nombre}</p>
      <p className="text-sm text-[#64748B] truncate">{cita.estilo_nombre}</p>
    </div>
    <StatusBadge status={cita.estado || 'pendiente'} />
    <Button variant="ghost" size="icon" className="text-[#64748B] hover:text-[#1E3A5F]">
      <MoreHorizontal className="w-5 h-5" />
    </Button>
  </div>
);

// Employee Mini Card
const EmployeeMini = ({ employee }) => (
  <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#3B82F6]/30 transition-colors">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm ${
      employee.activo ? 'bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6]' : 'bg-gray-400'
    }`}>
      {employee.nombre?.charAt(0).toUpperCase()}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#0F172A] text-sm truncate">{employee.nombre}</p>
      <p className="text-xs text-[#64748B]">{employee.especialidad || 'General'}</p>
    </div>
    <div className={`w-2 h-2 rounded-full ${employee.activo ? 'bg-emerald-500' : 'bg-gray-400'}`} />
  </div>
);

// Alert Item
const AlertItem = ({ alert }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg ${
    alert.tipo === 'agotado' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'
  }`}>
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
      alert.tipo === 'agotado' ? 'bg-red-100' : 'bg-amber-100'
    }`}>
      <Box className={`w-4 h-4 ${alert.tipo === 'agotado' ? 'text-red-600' : 'text-amber-600'}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-[#0F172A] text-sm truncate">{alert.producto_nombre}</p>
      <p className={`text-xs ${alert.tipo === 'agotado' ? 'text-red-600' : 'text-amber-600'}`}>
        {alert.tipo === 'agotado' ? 'Sin stock' : `Stock: ${alert.cantidad_actual} unidades`}
      </p>
    </div>
  </div>
);

// Service Performance Row
const ServiceRow = ({ service, index, maxValue }) => {
  const percentage = (service.rentabilidad_hora / maxValue) * 100;
  return (
    <div className="space-y-2 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-md bg-[#1E3A5F] text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-medium text-[#0F172A] text-sm">{service.nombre}</span>
        </div>
        <span className="font-bold text-[#1E3A5F]">${service.rentabilidad_hora.toFixed(2)}/h</span>
      </div>
      <div className="progress-corp">
        <div className="progress-corp-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

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
    // Add comercio theme class to body
    document.body.classList.add('comercio-theme');
    return () => document.body.classList.remove('comercio-theme');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('nailcost_token');
      if (!token) return;

      try {
        const [empRes, alertRes, statsRes] = await Promise.all([
          fetch(`${API}/empleados`, { headers: { Authorization: `Bearer ${token}` }}),
          fetch(`${API}/alertas-inventario`, { headers: { Authorization: `Bearer ${token}` }}),
          fetch(`${API}/quick-stats`, { headers: { Authorization: `Bearer ${token}` }})
        ]);

        if (empRes.ok) setEmpleados(await empRes.json());
        if (alertRes.ok) setAlertasInventario(await alertRes.json());
        if (statsRes.ok) setStats(await statsRes.json());

        if (estilos.length > 0) {
          const data = await getReporte();
          setReporte(data);
        }

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
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1">
            <Activity className="w-4 h-4" />
            <span>Panel de Control</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0F172A]">
            {user?.nombre_negocio || 'Mi Negocio'}
          </h1>
        </div>
        <div className="flex gap-3 animate-slide-left">
          <Link to="/calculadora">
            <Button className="btn-corp rounded-xl h-11">
              <Calculator className="w-4 h-4 mr-2" />
              Nueva Cotización
            </Button>
          </Link>
          <Link to="/reportes-mensuales">
            <Button variant="outline" className="btn-corp-outline rounded-xl h-11">
              <FileText className="w-4 h-4 mr-2" />
              Reportes
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Ingresos Estimados"
          value={`$${reporte?.rentabilidad_mensual_estimada?.toFixed(0) || '0'}`}
          subtitle="Este mes"
          icon={DollarSign}
          variant="green"
        />
        <KPICard 
          title="Clientes Activos"
          value={clientes.length}
          subtitle="Registrados"
          icon={Users}
          variant="blue"
        />
        <KPICard 
          title="Equipo"
          value={empleados.filter(e => e.activo).length}
          subtitle={`de ${empleados.length} total`}
          icon={UserCheck}
          variant="purple"
        />
        <KPICard 
          title="Gastos Mensuales"
          value={`$${gastosTotal().toFixed(0)}`}
          subtitle="Operativos"
          icon={PieChart}
          variant="amber"
        />
      </div>

      {/* Monthly Goal Progress */}
      {configGanancias?.meta_ingreso_mensual > 0 && (
        <Card className="card-corp">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">Meta Mensual</h3>
                  <p className="text-sm text-[#64748B]">Progreso hacia tu objetivo</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#1E3A5F]">{metaProgress().toFixed(0)}%</span>
                <p className="text-sm text-[#64748B]">completado</p>
              </div>
            </div>
            <div className="progress-corp h-3">
              <div className="progress-corp-fill" style={{ width: `${metaProgress()}%` }} />
            </div>
            <div className="flex justify-between mt-3 text-sm">
              <span className="text-[#64748B]">Actual: <strong className="text-[#0F172A]">${reporte?.rentabilidad_mensual_estimada?.toFixed(0) || '0'}</strong></span>
              <span className="text-[#64748B]">Meta: <strong className="text-[#0F172A]">${configGanancias.meta_ingreso_mensual}</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <Card className="card-corp">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">Agenda de Hoy</h3>
                    <p className="text-sm text-[#64748B]">{citasHoy.length} citas programadas</p>
                  </div>
                </div>
                <Link to="/agenda">
                  <Button variant="ghost" className="text-[#1E3A5F] hover:bg-[#F1F5F9]">
                    Ver todo <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
              
              {citasHoy.length > 0 ? (
                <div className="space-y-3">
                  {citasHoy.slice(0, 4).map((cita, i) => (
                    <AppointmentRow key={i} cita={cita} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#F8FAFC] rounded-xl">
                  <Calendar className="w-12 h-12 mx-auto text-[#CBD5E1] mb-3" />
                  <p className="text-[#64748B]">No hay citas programadas para hoy</p>
                  <Link to="/agenda" className="inline-block mt-3">
                    <Button variant="outline" size="sm" className="btn-corp-outline">
                      Programar cita
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Performance */}
          <Card className="card-corp">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0F172A]">Rendimiento por Servicio</h3>
                    <p className="text-sm text-[#64748B]">Rentabilidad por hora</p>
                  </div>
                </div>
                {isPremium && (
                  <Link to="/reportes-mensuales">
                    <Button variant="ghost" className="text-[#1E3A5F] hover:bg-[#F1F5F9]">
                      Análisis <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
              
              {reporte?.servicios_ranking?.length > 0 ? (
                <div className="space-y-4">
                  {reporte.servicios_ranking.slice(0, 5).map((s, i) => (
                    <ServiceRow 
                      key={i} 
                      service={s} 
                      index={i} 
                      maxValue={reporte.servicios_ranking[0]?.rentabilidad_hora || 1} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#F8FAFC] rounded-xl">
                  <BarChart3 className="w-12 h-12 mx-auto text-[#CBD5E1] mb-3" />
                  <p className="text-[#64748B]">Agrega estilos para ver análisis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-6">
          {/* Team Section */}
          <Card className="card-corp">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#1E3A5F]" />
                  <h3 className="font-semibold text-[#0F172A]">Equipo</h3>
                </div>
                <Link to="/empleados">
                  <Button variant="ghost" size="sm" className="text-[#1E3A5F] hover:bg-[#F1F5F9] h-8 px-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {empleados.length > 0 ? (
                <div className="space-y-2">
                  {empleados.slice(0, 4).map((emp) => (
                    <EmployeeMini key={emp.id} employee={emp} />
                  ))}
                  {empleados.length > 4 && (
                    <Link to="/empleados" className="block">
                      <Button variant="ghost" className="w-full text-[#1E3A5F] hover:bg-[#F1F5F9] text-sm">
                        Ver {empleados.length - 4} más
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-[#F8FAFC] rounded-lg">
                  <p className="text-sm text-[#64748B] mb-3">Sin empleados</p>
                  <Link to="/empleados">
                    <Button size="sm" className="btn-corp text-sm">
                      Agregar
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="card-corp">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${alertasInventario.length > 0 ? 'text-amber-500' : 'text-[#CBD5E1]'}`} />
                  <h3 className="font-semibold text-[#0F172A]">Inventario</h3>
                </div>
                {alertasInventario.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{alertasInventario.length}</Badge>
                )}
              </div>
              
              {alertasInventario.length > 0 ? (
                <div className="space-y-2">
                  {alertasInventario.slice(0, 4).map((alert, i) => (
                    <AlertItem key={i} alert={alert} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-emerald-50 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-sm text-emerald-700 font-medium">Inventario en orden</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="card-corp bg-gradient-to-br from-[#1E3A5F] to-[#0F172A] text-white">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Resumen Rápido
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Productos</span>
                  <span className="font-semibold">{productos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Estilos</span>
                  <span className="font-semibold">{estilos.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Citas Hoy</span>
                  <span className="font-semibold">{citasHoy.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">Alertas</span>
                  <span className={`font-semibold ${alertasInventario.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {alertasInventario.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Upsell */}
          {!isPremium && (
            <Card className="card-corp overflow-hidden border-none bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              <CardContent className="p-5 relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                <Crown className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg">Actualiza a Premium</h3>
                <p className="text-sm text-white/90 mt-1 mb-4">
                  Reportes avanzados, análisis y más
                </p>
                <Button className="w-full bg-white text-orange-600 hover:bg-white/90 font-semibold">
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

export { ComercioDashboard };
