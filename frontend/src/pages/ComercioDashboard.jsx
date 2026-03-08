import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Users, 
  Calendar,
  TrendingUp,
  TrendingDown,
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
  Box,
  Crown,
  PieChart,
  Activity,
  FileText,
  MoreVertical,
  CheckCircle,
  XCircle,
  Minus,
  Wallet,
  ShoppingCart,
  CircleDollarSign
} from "lucide-react";

// Minimal Stat Card
const StatCard = ({ label, value, subvalue, trend, icon: Icon }) => (
  <div className="bg-white border border-gray-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {subvalue && <p className="text-xs text-gray-500 mt-1">{subvalue}</p>}
      </div>
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
    </div>
    {trend && (
      <div className={`flex items-center gap-1 mt-3 text-xs ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
        {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        <span>{Math.abs(trend)}% vs mes anterior</span>
      </div>
    )}
  </div>
);

// Progress Bar Minimal
const ProgressBar = ({ value, max, color = "gray" }) => {
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${
          color === 'emerald' ? 'bg-emerald-500' : 
          color === 'amber' ? 'bg-amber-500' : 
          color === 'red' ? 'bg-red-500' : 'bg-gray-800'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Data Table Row
const TableRow = ({ data, columns }) => (
  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
    {columns.map((col, i) => (
      <td key={i} className={`py-3 px-4 text-sm ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}>
        {col.render ? col.render(data) : data[col.key]}
      </td>
    ))}
  </tr>
);

// Appointment Status
const StatusDot = ({ status }) => {
  const colors = {
    confirmada: 'bg-emerald-500',
    pendiente: 'bg-amber-500',
    cancelada: 'bg-red-500',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-400'}`} />;
};

// Alert Badge
const AlertBadge = ({ type, count }) => {
  if (count === 0) return null;
  const styles = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles[type] || styles.info}`}>
      {count}
    </span>
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
  const [ingresos, setIngresos] = useState({ mes: 0, anterior: 0 });
  const [gastosTotal, setGastosTotal] = useState({ mes: 0, anterior: 0 });
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    document.body.classList.remove('persona-theme');
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
        const hoy = new Date().toISOString().split('T')[0];
        setCitasHoy(citas.filter(c => c.fecha === hoy));

        // Calculate gastos total
        if (gastos) {
          const total = Object.entries(gastos)
            .filter(([key]) => !['clientes_mes', 'servicios_mes', 'dias_trabajo'].includes(key))
            .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);
          setGastosTotal({ mes: total, anterior: total * 0.95 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API, estilos, gastos, getReporte, getCitasProximas]);

  const metaProgress = () => {
    if (!configGanancias?.meta_ingreso_mensual || !reporte?.rentabilidad_mensual_estimada) return 0;
    return Math.min(100, (reporte.rentabilidad_mensual_estimada / configGanancias.meta_ingreso_mensual) * 100);
  };

  const criticalAlerts = alertasInventario.filter(a => a.tipo === 'agotado').length;
  const warningAlerts = alertasInventario.filter(a => a.tipo !== 'agotado').length;

  return (
    <div className="space-y-6 pb-8 bg-gray-50/30 min-h-screen -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 -mt-6 md:-mt-8 pt-6 md:pt-8" data-testid="comercio-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Panel de Control</p>
          <h1 className="text-2xl font-semibold text-gray-900">
            {user?.nombre_negocio || 'Mi Negocio'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to="/calculadora">
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50">
              <Calculator className="w-4 h-4 mr-2" />
              Nueva Cotización
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

      {/* Alerts Banner */}
      {(criticalAlerts > 0 || warningAlerts > 0) && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${criticalAlerts > 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
          <AlertTriangle className={`w-5 h-5 ${criticalAlerts > 0 ? 'text-red-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${criticalAlerts > 0 ? 'text-red-800' : 'text-amber-800'}`}>
              {criticalAlerts > 0 ? `${criticalAlerts} productos agotados` : `${warningAlerts} productos con stock bajo`}
            </p>
          </div>
          <Link to="/inventario">
            <Button variant="ghost" size="sm" className={criticalAlerts > 0 ? 'text-red-700 hover:bg-red-100' : 'text-amber-700 hover:bg-amber-100'}>
              Ver inventario
            </Button>
          </Link>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Ingresos Est." 
          value={formatCurrency(reporte?.rentabilidad_mensual_estimada, 0)}
          subvalue="Este mes"
          icon={CircleDollarSign}
        />
        <StatCard 
          label="Gastos" 
          value={formatCurrency(gastosTotal.mes, 0)}
          subvalue="Operativos"
          icon={Wallet}
        />
        <StatCard 
          label="Clientes" 
          value={clientes.length}
          subvalue="Registrados"
          icon={Users}
        />
        <StatCard 
          label="Inventario" 
          value={productos.length}
          subvalue={`${criticalAlerts + warningAlerts} alertas`}
          icon={Package}
        />
      </div>

      {/* Progress to Goal */}
      {configGanancias?.meta_ingreso_mensual > 0 && (
        <Card className="border-gray-100">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Meta Mensual</p>
                <p className="text-xs text-gray-500">Progreso de ingresos</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-gray-900">{metaProgress().toFixed(0)}%</p>
              </div>
            </div>
            <ProgressBar 
              value={reporte?.rentabilidad_mensual_estimada || 0} 
              max={configGanancias.meta_ingreso_mensual}
              color={metaProgress() >= 100 ? 'emerald' : metaProgress() >= 70 ? 'amber' : 'gray'}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{formatCurrency(reporte?.rentabilidad_mensual_estimada, 0)}</span>
              <span>Meta: {formatCurrency(configGanancias.meta_ingreso_mensual, 0)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-gray-900">Agenda de Hoy</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">{citasHoy.length} citas programadas</p>
                </div>
                <Link to="/agenda">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    Ver todo
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {citasHoy.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 px-4">Hora</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 px-4">Cliente</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 px-4">Servicio</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase py-2 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasHoy.slice(0, 5).map((cita, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{cita.hora}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{cita.cliente_nombre}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{cita.estilo_nombre}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <StatusDot status={cita.estado || 'pendiente'} />
                              <span className="text-xs text-gray-600 capitalize">{cita.estado || 'Pendiente'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Sin citas para hoy</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-gray-900">Servicios Más Rentables</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">Por rentabilidad/hora</p>
                </div>
                <Link to="/reportes-mensuales">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    Reportes
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {reporte?.servicios_ranking?.length > 0 ? (
                <div className="space-y-3">
                  {reporte.servicios_ranking.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded bg-gray-100 text-xs font-medium text-gray-600 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.nombre}</p>
                        <ProgressBar 
                          value={s.rentabilidad_hora} 
                          max={reporte.servicios_ranking[0]?.rentabilidad_hora || 1}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">${s.rentabilidad_hora.toFixed(0)}/h</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Agrega estilos para ver análisis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="border-gray-100 bg-gray-900 text-white">
            <CardContent className="p-5">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Resumen</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Empleados activos</span>
                  <span className="font-medium">{empleados.filter(e => e.activo).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Estilos</span>
                  <span className="font-medium">{estilos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Citas hoy</span>
                  <span className="font-medium">{citasHoy.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Alertas stock</span>
                  <span className={`font-medium ${criticalAlerts > 0 ? 'text-red-400' : warningAlerts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {criticalAlerts + warningAlerts || '0'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-gray-900">Equipo</CardTitle>
                <Link to="/empleados">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-8 px-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {empleados.length > 0 ? (
                <div className="space-y-2">
                  {empleados.slice(0, 4).map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${emp.activo ? 'bg-gray-800' : 'bg-gray-400'}`}>
                        {emp.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{emp.nombre}</p>
                        <p className="text-xs text-gray-500">{emp.especialidad || 'General'}</p>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${emp.activo ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Sin empleados</p>
                  <Link to="/empleados">
                    <Button size="sm" variant="outline" className="mt-2">
                      Agregar
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inventory Alerts */}
          <Card className="border-gray-100">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-medium text-gray-900">Stock</CardTitle>
                  <AlertBadge type="critical" count={criticalAlerts} />
                  <AlertBadge type="warning" count={warningAlerts} />
                </div>
                <Link to="/inventario">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-8 px-2">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {alertasInventario.length > 0 ? (
                <div className="space-y-2">
                  {alertasInventario.slice(0, 4).map((alert, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${alert.tipo === 'agotado' ? 'bg-red-50' : 'bg-amber-50'}`}>
                      <Box className={`w-4 h-4 ${alert.tipo === 'agotado' ? 'text-red-600' : 'text-amber-600'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{alert.producto_nombre}</p>
                        <p className={`text-xs ${alert.tipo === 'agotado' ? 'text-red-600' : 'text-amber-600'}`}>
                          {alert.tipo === 'agotado' ? 'Agotado' : `Stock: ${alert.cantidad_actual}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-emerald-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
                  <p className="text-sm text-emerald-700">Stock en orden</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Premium CTA */}
          {!isPremium && (
            <Card className="border-gray-100 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <CardContent className="p-5">
                <Crown className="w-8 h-8 mb-3 text-amber-400" />
                <h3 className="font-medium">Premium Business</h3>
                <p className="text-sm text-gray-400 mt-1 mb-4">Reportes avanzados y más</p>
                <Button className="w-full bg-white text-gray-900 hover:bg-gray-100">
                  Actualizar
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
