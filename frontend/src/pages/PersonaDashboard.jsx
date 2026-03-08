import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Users, 
  Calendar,
  History,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  ChevronRight,
  Heart,
  Zap,
  Star,
  Crown,
  ArrowRight,
  Bell,
  Gift,
  Target,
  Award,
  Share2,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PiggyBank,
  Wallet,
  Receipt,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Eye,
  Package
} from "lucide-react";
import { toast } from "sonner";

// Visual Progress Ring
const ProgressRing = ({ value, max, size = 80, strokeWidth = 8, color = "#E84A8A" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FCE7F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-[#1A1A2E]">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

// Visual Stat Card - Easy to understand
const VisualStatCard = ({ icon: Icon, label, value, subtext, trend, color = "rose", onClick }) => {
  const colors = {
    rose: { bg: "bg-gradient-to-br from-[#FDF2F7] to-[#FFE4EE]", icon: "text-[#E84A8A]", accent: "#E84A8A" },
    emerald: { bg: "bg-gradient-to-br from-emerald-50 to-teal-50", icon: "text-emerald-600", accent: "#10B981" },
    amber: { bg: "bg-gradient-to-br from-amber-50 to-orange-50", icon: "text-amber-600", accent: "#F59E0B" },
    blue: { bg: "bg-gradient-to-br from-blue-50 to-indigo-50", icon: "text-blue-600", accent: "#3B82F6" },
  };
  const c = colors[color];

  return (
    <button 
      onClick={onClick}
      className={`${c.bg} rounded-2xl p-4 text-left w-full transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="flex items-start justify-between mb-2">
        <Icon className={`w-6 h-6 ${c.icon}`} />
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1A1A2E]">{value}</p>
      <p className="text-sm text-[#64748B] mt-1">{label}</p>
      {subtext && <p className="text-xs text-[#94A3B8] mt-0.5">{subtext}</p>}
    </button>
  );
};

// Alert Card - Friendly notifications
const AlertCard = ({ type, title, message, action, actionLabel }) => {
  const styles = {
    warning: { bg: "bg-amber-50 border-amber-200", icon: AlertCircle, iconColor: "text-amber-500" },
    success: { bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-500" },
    info: { bg: "bg-blue-50 border-blue-200", icon: Bell, iconColor: "text-blue-500" },
    danger: { bg: "bg-red-50 border-red-200", icon: AlertCircle, iconColor: "text-red-500" },
  };
  const s = styles[type] || styles.info;
  const Icon = s.icon;

  return (
    <div className={`${s.bg} border rounded-2xl p-4 flex items-start gap-3`}>
      <Icon className={`w-5 h-5 ${s.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[#1A1A2E] text-sm">{title}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{message}</p>
      </div>
      {action && (
        <Button size="sm" variant="ghost" onClick={action} className="text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Simple Bar Chart
const SimpleBarChart = ({ data, maxValue }) => (
  <div className="flex items-end gap-1 h-16">
    {data.map((item, i) => (
      <div key={i} className="flex-1 flex flex-col items-center gap-1">
        <div 
          className="w-full bg-gradient-to-t from-[#E84A8A] to-[#FF6B9D] rounded-t-sm transition-all duration-500"
          style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minHeight: item.value > 0 ? 4 : 0 }}
        />
        <span className="text-[9px] text-[#94A3B8]">{item.label}</span>
      </div>
    ))}
  </div>
);

// Quick Action Button
const QuickAction = ({ icon: Icon, label, to, color = "rose", badge }) => {
  const colors = {
    rose: "from-[#E84A8A] to-[#FF6B9D]",
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-indigo-500",
    amber: "from-amber-500 to-orange-500",
  };

  return (
    <Link to={to} className="block">
      <div className="group bg-white rounded-2xl p-4 border border-[#FCE7F0] active:scale-95 transition-all hover:shadow-lg">
        <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-center text-xs font-medium text-[#1A1A2E] mt-2">{label}</p>
        {badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
};

// Insight Card - Easy explanations
const InsightCard = ({ emoji, title, value, explanation, color = "rose" }) => {
  const colors = {
    rose: "from-[#FDF2F7] to-white",
    emerald: "from-emerald-50 to-white",
    amber: "from-amber-50 to-white",
  };

  return (
    <div className={`bg-gradient-to-b ${colors[color]} rounded-2xl p-4 border border-[#FCE7F0]`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-sm font-medium text-[#1A1A2E]">{title}</span>
      </div>
      <p className="text-2xl font-bold text-[#1A1A2E] mb-1">{value}</p>
      <p className="text-xs text-[#64748B] leading-relaxed">{explanation}</p>
    </div>
  );
};

export default function PersonaDashboard() {
  const { user, isPremium } = useAuth();
  const { estilos, clientes, productos, gastos, configGanancias, getCitasProximas, getReporte } = useApp();
  const [historial, setHistorial] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [stats, setStats] = useState(null);
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    document.body.classList.add('persona-theme');
    document.body.classList.remove('comercio-theme');
    return () => document.body.classList.remove('persona-theme');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('nailcost_token');
      if (!token) return;

      try {
        const [histRes, statsRes] = await Promise.all([
          fetch(`${API}/historial-calculos`, { headers: { Authorization: `Bearer ${token}` }}),
          fetch(`${API}/quick-stats`, { headers: { Authorization: `Bearer ${token}` }})
        ]);

        if (histRes.ok) {
          const data = await histRes.json();
          setHistorial(data);
          
          // Generate weekly data
          const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dayStr = date.toISOString().split('T')[0];
            const dayCalcs = data.filter(h => h.created_at?.startsWith(dayStr));
            return {
              label: date.toLocaleDateString('es-MX', { weekday: 'short' }).charAt(0).toUpperCase(),
              value: dayCalcs.reduce((sum, h) => sum + (h.precio_recomendado || 0), 0)
            };
          });
          setWeeklyData(last7Days);
        }
        if (statsRes.ok) setStats(await statsRes.json());

        const citas = await getCitasProximas();
        const hoy = new Date().toISOString().split('T')[0];
        setCitasHoy(citas.filter(c => c.fecha === hoy));

        if (estilos.length > 0) {
          const rep = await getReporte();
          setReporte(rep);
        }

        // Generate alerts
        const newAlerts = [];
        
        // Low stock alert
        const lowStockProducts = productos.filter(p => (p.cantidad_disponible || 0) <= (p.stock_minimo || 5));
        if (lowStockProducts.length > 0) {
          newAlerts.push({
            type: 'warning',
            title: `${lowStockProducts.length} producto(s) con stock bajo`,
            message: 'Revisa tu inventario antes de quedarte sin material'
          });
        }

        // Upcoming appointments
        if (citasHoy.length > 0) {
          newAlerts.push({
            type: 'info',
            title: `Tienes ${citasHoy.length} cita(s) hoy`,
            message: `Próxima: ${citasHoy[0]?.cliente_nombre} a las ${citasHoy[0]?.hora}`
          });
        }

        // Goal progress
        if (configGanancias?.meta_ingreso_mensual && reporte?.rentabilidad_mensual_estimada) {
          const progress = (reporte.rentabilidad_mensual_estimada / configGanancias.meta_ingreso_mensual) * 100;
          if (progress >= 100) {
            newAlerts.push({
              type: 'success',
              title: '¡Felicidades! Alcanzaste tu meta',
              message: 'Tu esfuerzo está dando frutos. ¡Sigue así!'
            });
          } else if (progress >= 80) {
            newAlerts.push({
              type: 'info',
              title: '¡Ya casi llegas a tu meta!',
              message: `Te falta ${(100 - progress).toFixed(0)}% para alcanzarla`
            });
          }
        }

        setAlerts(newAlerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API, estilos, productos, configGanancias, getCitasProximas, getReporte]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Buenos días", emoji: "☀️" };
    if (hour < 19) return { text: "Buenas tardes", emoji: "🌤️" };
    return { text: "Buenas noches", emoji: "🌙" };
  };

  // Calculations for insights
  const totalGastosOperativos = gastos 
    ? Object.entries(gastos)
        .filter(([key]) => !['clientes_mes', 'servicios_mes', 'dias_trabajo'].includes(key))
        .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0)
    : 0;

  const gananciaReal = (reporte?.rentabilidad_mensual_estimada || 0) - totalGastosOperativos;
  const margenGanancia = reporte?.rentabilidad_mensual_estimada > 0 
    ? ((gananciaReal / reporte.rentabilidad_mensual_estimada) * 100) 
    : 0;

  const totalIngresos7Dias = weeklyData.reduce((sum, d) => sum + d.value, 0);
  const maxWeeklyValue = Math.max(...weeklyData.map(d => d.value), 1);

  const metaProgress = configGanancias?.meta_ingreso_mensual > 0 
    ? (reporte?.rentabilidad_mensual_estimada || 0) / configGanancias.meta_ingreso_mensual 
    : 0;

  const greet = greeting();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-[#64748B]">Cargando tu resumen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24" data-testid="persona-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#64748B] flex items-center gap-1">
            <span>{greet.emoji}</span> {greet.text}
          </p>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {user?.nombre?.split(' ')[0] || 'Hola'}
          </h1>
        </div>
        <Link to="/reportes-mensuales">
          <Button variant="outline" size="sm" className="rounded-full border-[#FCE7F0] text-[#E84A8A]">
            <Eye className="w-4 h-4 mr-1" />
            Ver Reportes
          </Button>
        </Link>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 2).map((alert, i) => (
            <AlertCard key={i} {...alert} />
          ))}
        </div>
      )}

      {/* Main Financial Summary - Easy to understand */}
      <Card className="bg-gradient-to-br from-[#E84A8A] via-[#FF6B9D] to-[#FF8FAB] border-none text-white overflow-hidden">
        <CardContent className="p-5 relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/80 text-sm">Este mes estás ganando</p>
              <p className="text-3xl font-bold mt-1">${(reporte?.rentabilidad_mensual_estimada || 0).toFixed(0)}</p>
            </div>
            {configGanancias?.meta_ingreso_mensual > 0 && (
              <ProgressRing 
                value={reporte?.rentabilidad_mensual_estimada || 0} 
                max={configGanancias.meta_ingreso_mensual}
                color="#ffffff"
                size={70}
                strokeWidth={6}
              />
            )}
          </div>

          {/* Simple explanation */}
          <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-white/90">Tu ganancia real después de gastos</p>
                <p className="text-xl font-bold text-white">${gananciaReal.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Margen</p>
                <p className={`text-lg font-bold ${margenGanancia >= 50 ? 'text-white' : 'text-amber-200'}`}>
                  {margenGanancia.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <QuickAction icon={Calculator} label="Calcular" to="/calculadora" color="rose" />
        <QuickAction icon={Users} label="Clientes" to="/clientes" color="blue" />
        <QuickAction icon={Calendar} label="Agenda" to="/agenda" color="emerald" badge={citasHoy.length || null} />
        <QuickAction icon={Receipt} label="Gastos" to="/gastos" color="amber" />
      </div>

      {/* Weekly Performance Chart */}
      <Card className="border-[#FCE7F0]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[#1A1A2E]">Tu semana</h3>
              <p className="text-xs text-[#64748B]">Últimos 7 días</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#E84A8A]">${totalIngresos7Dias.toFixed(0)}</p>
              <p className="text-xs text-[#64748B]">en cotizaciones</p>
            </div>
          </div>
          <SimpleBarChart data={weeklyData} maxValue={maxWeeklyValue} />
        </CardContent>
      </Card>

      {/* Easy Insights */}
      <div className="grid grid-cols-2 gap-3">
        <InsightCard 
          emoji="💰"
          title="Cobras en promedio"
          value={`$${historial.length > 0 ? (historial.reduce((s, h) => s + (h.precio_recomendado || 0), 0) / historial.length).toFixed(0) : '0'}`}
          explanation="Por cada servicio que cotizas"
          color="rose"
        />
        <InsightCard 
          emoji="📊"
          title="Gastos del mes"
          value={`$${totalGastosOperativos.toFixed(0)}`}
          explanation="Renta, luz, materiales y más"
          color="amber"
        />
      </div>

      {/* Visual Stats */}
      <div className="grid grid-cols-2 gap-3">
        <VisualStatCard 
          icon={Users}
          label="Clientes"
          value={clientes.length}
          subtext="registrados"
          color="blue"
        />
        <VisualStatCard 
          icon={Package}
          label="Productos"
          value={productos.length}
          subtext="en inventario"
          color="emerald"
        />
      </div>

      {/* Recent Activity */}
      {historial.length > 0 && (
        <Card className="border-[#FCE7F0]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1A1A2E]">Actividad reciente</h3>
              <Link to="/historial" className="text-sm text-[#E84A8A] flex items-center gap-1">
                Ver todo <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {historial.slice(0, 3).map((h, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#FDF2F7] rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A2E] text-sm truncate">{h.estilo_nombre}</p>
                    <p className="text-xs text-[#64748B]">
                      {new Date(h.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-[#E84A8A]">${h.precio_recomendado?.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Appointments */}
      {citasHoy.length > 0 && (
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-[#1A1A2E]">Citas de hoy</h3>
            </div>
            <div className="space-y-2">
              {citasHoy.slice(0, 3).map((cita, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl">
                  <div>
                    <p className="font-medium text-[#1A1A2E] text-sm">{cita.cliente_nombre}</p>
                    <p className="text-xs text-[#64748B]">{cita.estilo_nombre}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{cita.hora}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tip / CTA */}
      <Card className="border-[#FCE7F0] bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A2E]">Tip para crecer</h3>
              <p className="text-sm text-[#64748B] mt-1">
                {clientes.length < 10 
                  ? "Registra a tus clientes frecuentes para enviarles recordatorios y ofertas especiales."
                  : historial.length < 20
                  ? "Cada cotización que guardas te ayuda a entender mejor tu negocio. ¡Sigue así!"
                  : "Revisa tus reportes mensuales para identificar qué servicios te dan más ganancia."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tutorial - Show only if new user */}
      {(estilos.length === 0 || clientes.length === 0) && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#1A1A2E] mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              Tutorial Rápido
            </h3>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 p-2 rounded-lg ${estilos.length > 0 ? 'bg-emerald-100' : 'bg-white'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${estilos.length > 0 ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {estilos.length > 0 ? '✓' : '1'}
                </span>
                <Link to="/estilos" className="text-sm text-[#1A1A2E]">
                  <strong>Crear estilos:</strong> Define tus servicios y tiempos
                </Link>
              </div>
              <div className={`flex items-center gap-3 p-2 rounded-lg ${productos.length > 0 ? 'bg-emerald-100' : 'bg-white'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${productos.length > 0 ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {productos.length > 0 ? '✓' : '2'}
                </span>
                <Link to="/productos" className="text-sm text-[#1A1A2E]">
                  <strong>Agregar productos:</strong> Registra tus materiales y costos
                </Link>
              </div>
              <div className={`flex items-center gap-3 p-2 rounded-lg ${clientes.length > 0 ? 'bg-emerald-100' : 'bg-white'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${clientes.length > 0 ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600'}`}>
                  {clientes.length > 0 ? '✓' : '3'}
                </span>
                <Link to="/clientes" className="text-sm text-[#1A1A2E]">
                  <strong>Registrar clientes:</strong> Guarda los datos de tus clientas
                </Link>
              </div>
              <div className={`flex items-center gap-3 p-2 rounded-lg bg-white`}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-600">4</span>
                <Link to="/calculadora" className="text-sm text-[#1A1A2E]">
                  <strong>Calcular precios:</strong> Obtén precios justos basados en tus costos
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Upsell */}
      {!isPremium && (
        <Card className="border-none bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <Crown className="w-10 h-10" />
            <div className="flex-1">
              <p className="font-bold">Pasa a Premium</p>
              <p className="text-sm text-white/90">Reportes detallados y sin límites</p>
            </div>
            <ChevronRight className="w-6 h-6" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { PersonaDashboard };
