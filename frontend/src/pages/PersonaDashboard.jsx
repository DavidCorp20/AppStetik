import { useEffect, useState } from "react";
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
  Clock,
  DollarSign,
  ChevronRight,
  Heart,
  Zap,
  Star,
  Crown,
  ArrowRight,
  Bell
} from "lucide-react";
import { toast } from "sonner";

// Quick Action Card - App-like button
const QuickAction = ({ icon: Icon, label, to, color = "rose", badge }) => {
  const colors = {
    rose: "from-[#E84A8A] to-[#FF6B9D]",
    purple: "from-[#8B5CF6] to-[#A78BFA]",
    blue: "from-[#3B82F6] to-[#60A5FA]",
    emerald: "from-[#10B981] to-[#34D399]",
    amber: "from-[#F59E0B] to-[#FBBF24]",
  };

  return (
    <Link to={to} className="block">
      <div className="group relative bg-white rounded-3xl p-4 border border-[#FCE7F0] active:scale-95 transition-all duration-200 hover:shadow-lg hover:border-[#E84A8A]/30">
        <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg group-active:scale-90 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="text-center text-sm font-medium text-[#1A1A2E] mt-3">{label}</p>
        {badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
};

// Recent Calculation Card
const RecentCalcCard = ({ calc, delay }) => (
  <div 
    className="bg-white rounded-2xl p-4 border border-[#FCE7F0] animate-slide-up"
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1A2E] truncate">{calc.estilo_nombre}</p>
        <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" />
          {new Date(calc.created_at).toLocaleDateString('es-MX', { 
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
          })}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-[#E84A8A]">${calc.precio_recomendado?.toFixed(2)}</p>
        <p className="text-xs text-emerald-500">+${calc.ganancia?.toFixed(2)}</p>
      </div>
    </div>
  </div>
);

// Stat Bubble
const StatBubble = ({ value, label, icon: Icon }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-[#FDF2F7]">
      <span className="text-xl font-bold text-[#1A1A2E]">{value}</span>
    </div>
    <div className="flex items-center gap-1 mt-2">
      <Icon className="w-3 h-3 text-[#E84A8A]" />
      <span className="text-xs text-[#64748B]">{label}</span>
    </div>
  </div>
);

export default function PersonaDashboard() {
  const { user, isPremium } = useAuth();
  const { estilos, clientes, getCitasProximas } = useApp();
  const [historial, setHistorial] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('nailcost_token');
      if (!token) return;

      try {
        // Fetch calculation history
        const histRes = await fetch(`${API}/historial-calculos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (histRes.ok) {
          const data = await histRes.json();
          setHistorial(data.slice(0, 5));
        }

        // Fetch quick stats
        const statsRes = await fetch(`${API}/quick-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        // Fetch upcoming appointments
        const citas = await getCitasProximas();
        setCitasHoy(citas.filter(c => c.fecha === new Date().toISOString().split('T')[0]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API, getCitasProximas]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="space-y-6 pb-24" data-testid="persona-dashboard">
      {/* Hero Header - App Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#E84A8A] via-[#FF6B9D] to-[#FF8FAB] rounded-[28px] p-5 text-white">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-white/80" fill="currentColor" />
            <span className="text-white/80 text-sm">{greeting()}</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            {user?.nombre || 'Artista'}
          </h1>
          
          {/* Quick Stats Bubbles */}
          <div className="flex justify-around mt-6 mb-2">
            <StatBubble value={stats?.calculos_hoy || 0} label="Hoy" icon={Calculator} />
            <StatBubble value={citasHoy.length} label="Citas" icon={Calendar} />
            <StatBubble value={clientes.length} label="Clientes" icon={Users} />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#E84A8A]" />
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Calculator} label="Calcular" to="/calculadora" color="rose" />
          <QuickAction icon={Users} label="Clientes" to="/clientes" color="purple" badge={clientes.length > 0 ? null : "!"} />
          <QuickAction icon={Calendar} label="Agenda" to="/agenda" color="blue" badge={citasHoy.length > 0 ? citasHoy.length : null} />
          <QuickAction icon={History} label="Historial" to="/historial" color="emerald" />
        </div>
      </div>

      {/* Today's Appointments */}
      {citasHoy.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-blue-800">Citas de Hoy</h3>
          </div>
          <div className="space-y-2">
            {citasHoy.map((cita, i) => (
              <div key={i} className="bg-white rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-[#1A1A2E]">{cita.cliente_nombre}</p>
                  <p className="text-xs text-[#64748B]">{cita.estilo_nombre}</p>
                </div>
                <span className="text-lg font-bold text-blue-600">{cita.hora}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Calculations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
            <History className="w-5 h-5 text-[#E84A8A]" />
            Cálculos Recientes
          </h2>
          <Link to="/historial" className="text-sm text-[#E84A8A] flex items-center gap-1">
            Ver todo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {historial.length > 0 ? (
          <div className="space-y-3">
            {historial.map((calc, i) => (
              <RecentCalcCard key={calc.id} calc={calc} delay={i * 0.1} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FDF2F7] rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Calculator className="w-8 h-8 text-[#E84A8A]/50" />
            </div>
            <p className="text-[#64748B] mb-3">Aún no tienes cálculos</p>
            <Link to="/calculadora">
              <Button className="bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white rounded-full px-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Hacer mi primer cálculo
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-800">Tip del día</h3>
            <p className="text-sm text-amber-700 mt-1">
              {estilos.length < 3 
                ? "Agrega más estilos de uñas para ofrecer variedad a tus clientes."
                : "Comparte tus cotizaciones por WhatsApp directamente desde la calculadora."}
            </p>
          </div>
        </div>
      </div>

      {/* Premium Upsell - Only if not premium */}
      {!isPremium && (
        <Link to="/premium" className="block">
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Crown className="w-20 h-20 text-white/20" />
            </div>
            <div className="relative z-10">
              <p className="font-bold text-lg">¡Desbloquea Premium!</p>
              <p className="text-sm text-white/90 mt-1">Reportes, simulaciones y más</p>
              <div className="flex items-center gap-2 mt-3 text-sm">
                <span>Ver beneficios</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

export { PersonaDashboard };
