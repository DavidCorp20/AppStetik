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
  Clock,
  DollarSign,
  ChevronRight,
  Heart,
  Zap,
  Star,
  Crown,
  ArrowRight,
  Bell,
  PartyPopper,
  Gift,
  Flame,
  Target,
  Award,
  Share2,
  Copy,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Confetti Component
const Confetti = ({ active }) => {
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${1 + Math.random() * 1}s`,
          }}
        />
      ))}
    </div>
  );
};

// Quick Action - Interactive Card with tap effect
const QuickAction = ({ icon: Icon, label, to, color = "rose", badge, delay = 0 }) => {
  const colors = {
    rose: "from-[#E84A8A] to-[#FF6B9D]",
    purple: "from-[#8B5CF6] to-[#A78BFA]",
    blue: "from-[#3B82F6] to-[#60A5FA]",
    emerald: "from-[#10B981] to-[#34D399]",
    amber: "from-[#F59E0B] to-[#FBBF24]",
    pink: "from-[#EC4899] to-[#F472B6]",
  };

  return (
    <Link to={to} className="block animate-pop" style={{ animationDelay: `${delay}s` }}>
      <div className="group relative bg-white rounded-3xl p-4 border border-[#FCE7F0] tap-effect hover:shadow-xl hover:border-[#E84A8A]/30 transition-all duration-300">
        <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg group-hover:scale-110 group-active:scale-95 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <p className="text-center text-sm font-medium text-[#1A1A2E] mt-3">{label}</p>
        {badge && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-soft shadow-lg">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
};

// Recent Calculation Card - Interactive
const RecentCalcCard = ({ calc, delay, onShare }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={`bg-white rounded-2xl border border-[#FCE7F0] overflow-hidden tap-effect animate-slide-up hover:shadow-lg transition-all duration-300 ${expanded ? 'ring-2 ring-[#E84A8A]/30' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="w-full p-4 text-left"
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
            <p className="text-xs text-emerald-500 font-medium">+${calc.ganancia?.toFixed(2)}</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 animate-slide-down">
          <div className="h-px bg-gradient-to-r from-transparent via-[#FCE7F0] to-transparent my-3" />
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#FDF2F7] rounded-xl p-3 text-center">
              <p className="text-xs text-[#64748B]">Costo</p>
              <p className="font-semibold text-[#1A1A2E]">${calc.costo_total?.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xs text-[#64748B]">Ganancia</p>
              <p className="font-semibold text-emerald-600">${calc.ganancia?.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const text = `💅 Cotización: ${calc.estilo_nombre} - $${calc.precio_recomendado?.toFixed(2)}`;
                navigator.clipboard.writeText(text);
                toast.success("¡Copiado!");
              }}
              variant="outline"
              size="sm"
              className="flex-1 rounded-xl border-[#FCE7F0] tap-effect"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copiar
            </Button>
            <Button
              onClick={() => onShare(calc)}
              size="sm"
              className="flex-1 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white tap-effect"
            >
              <Share2 className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Bubble - Animated
const StatBubble = ({ value, label, icon: Icon, delay = 0 }) => (
  <div className="flex flex-col items-center animate-pop" style={{ animationDelay: `${delay}s` }}>
    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-[#FDF2F7] hover:scale-110 tap-effect transition-transform">
      <span className="text-xl font-bold text-[#1A1A2E]">{value}</span>
    </div>
    <div className="flex items-center gap-1 mt-2">
      <Icon className="w-3 h-3 text-[#E84A8A]" />
      <span className="text-xs text-white/90">{label}</span>
    </div>
  </div>
);

// Achievement Card
const AchievementCard = ({ icon: Icon, title, description, color }) => (
  <div className={`flex items-center gap-3 p-3 rounded-2xl ${color} tap-effect hover:scale-102 transition-transform`}>
    <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-sm">
      <Icon className="w-5 h-5 text-[#E84A8A]" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-[#1A1A2E] text-sm">{title}</p>
      <p className="text-xs text-[#64748B]">{description}</p>
    </div>
    <ChevronRight className="w-5 h-5 text-[#E84A8A]/50" />
  </div>
);

export default function PersonaDashboard() {
  const { user, isPremium } = useAuth();
  const { estilos, clientes, getCitasProximas } = useApp();
  const [historial, setHistorial] = useState([]);
  const [citasHoy, setCitasHoy] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    // Add persona theme class to body
    document.body.classList.add('persona-theme');
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
          setHistorial(data.slice(0, 5));
        }
        if (statsRes.ok) setStats(await statsRes.json());

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

  const handleShare = useCallback((calc) => {
    const text = encodeURIComponent(
      `💅 *Cotización NailCost*\n\n` +
      `✨ Servicio: ${calc.estilo_nombre}\n` +
      `💰 Precio: $${calc.precio_recomendado?.toFixed(2)}\n\n` +
      `¡Gracias por tu preferencia! 💖`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Buenos días", emoji: "☀️" };
    if (hour < 19) return { text: "Buenas tardes", emoji: "🌤️" };
    return { text: "Buenas noches", emoji: "🌙" };
  };

  const greet = greeting();

  // Calculate streak (days with activity)
  const streak = historial.length > 0 ? Math.min(7, historial.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center mx-auto mb-4 animate-bounce-soft">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-[#64748B]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24" data-testid="persona-dashboard">
      <Confetti active={showConfetti} />

      {/* Hero Header - Interactive */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#E84A8A] via-[#FF6B9D] to-[#FF8FAB] rounded-[28px] p-5 text-white animate-fade-in">
        {/* Animated background shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{greet.emoji}</span>
            <span className="text-white/80 text-sm">{greet.text}</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
            {user?.nombre || 'Artista'}
          </h1>
          
          {/* Streak indicator */}
          {streak > 0 && (
            <div className="flex items-center gap-2 mt-2 bg-white/20 rounded-full px-3 py-1 w-fit">
              <Flame className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-medium">{streak} días activa</span>
            </div>
          )}
          
          {/* Quick Stats Bubbles */}
          <div className="flex justify-around mt-6 mb-2">
            <StatBubble value={stats?.calculos_hoy || 0} label="Hoy" icon={Calculator} delay={0.1} />
            <StatBubble value={citasHoy.length} label="Citas" icon={Calendar} delay={0.2} />
            <StatBubble value={clientes.length} label="Clientes" icon={Users} delay={0.3} />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid - Animated */}
      <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#E84A8A]" />
          Acceso Rápido
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={Calculator} label="Calcular" to="/calculadora" color="rose" delay={0.1} />
          <QuickAction icon={Users} label="Clientes" to="/clientes" color="purple" delay={0.15} badge={clientes.length === 0 ? "!" : null} />
          <QuickAction icon={Calendar} label="Agenda" to="/agenda" color="blue" delay={0.2} badge={citasHoy.length > 0 ? citasHoy.length : null} />
          <QuickAction icon={History} label="Historial" to="/historial" color="emerald" delay={0.25} />
        </div>
      </div>

      {/* Today's Appointments - Interactive */}
      {citasHoy.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-blue-800">Citas de Hoy</h3>
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{citasHoy.length}</span>
            </div>
            <div className="space-y-2">
              {citasHoy.slice(0, 3).map((cita, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl p-3 flex justify-between items-center tap-effect hover:shadow-md transition-all animate-slide-right"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <div>
                    <p className="font-medium text-[#1A1A2E]">{cita.cliente_nombre}</p>
                    <p className="text-xs text-[#64748B]">{cita.estilo_nombre}</p>
                  </div>
                  <span className="text-lg font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{cita.hora}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Calculations - Interactive Cards */}
      <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
            <History className="w-5 h-5 text-[#E84A8A]" />
            Cálculos Recientes
          </h2>
          <Link to="/historial" className="text-sm text-[#E84A8A] flex items-center gap-1 tap-effect">
            Ver todo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {historial.length > 0 ? (
          <div className="space-y-3">
            {historial.map((calc, i) => (
              <RecentCalcCard key={calc.id} calc={calc} delay={i * 0.1} onShare={handleShare} />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#FDF2F7] to-[#FFE4EE] rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce-soft">
              <Calculator className="w-8 h-8 text-[#E84A8A]" />
            </div>
            <p className="text-[#64748B] mb-3">¡Haz tu primer cálculo!</p>
            <Link to="/calculadora">
              <Button className="btn-interactive rounded-full px-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Comenzar
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Achievement/Tips Section */}
      <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-lg font-semibold text-[#1A1A2E] flex items-center gap-2">
          <Award className="w-5 h-5 text-[#E84A8A]" />
          Logros y Tips
        </h2>
        
        {estilos.length >= 5 && (
          <AchievementCard 
            icon={Star}
            title="¡5 Estilos Creados!"
            description="Tu catálogo está creciendo"
            color="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
          />
        )}
        
        {clientes.length >= 10 && (
          <AchievementCard 
            icon={Heart}
            title="¡10 Clientes!"
            description="Tu negocio está despegando"
            color="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100"
          />
        )}

        {/* Tip of the day */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100 tap-effect">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-800">Tip del día</h3>
              <p className="text-sm text-purple-700 mt-1">
                {estilos.length < 3 
                  ? "Agrega más estilos de uñas para ofrecer variedad a tus clientes."
                  : clientes.length < 5
                  ? "Registra a tus clientes frecuentes para dar seguimiento personalizado."
                  : "Comparte tus cotizaciones por WhatsApp directamente desde la calculadora."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upsell - Animated */}
      {!isPremium && (
        <Link to="/premium" className="block animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-5 text-white tap-effect hover:scale-102 transition-transform">
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-20">
              <Crown className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <PartyPopper className="w-5 h-5" />
                <span className="text-sm font-medium text-white/90">Oferta especial</span>
              </div>
              <p className="font-bold text-xl">¡Desbloquea Premium!</p>
              <p className="text-sm text-white/90 mt-1">Reportes, simulaciones y funciones ilimitadas</p>
              <div className="flex items-center gap-2 mt-3 text-sm font-medium">
                <span>Ver beneficios</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}

export { PersonaDashboard };
