import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Search, 
  Trash2, 
  Copy, 
  Share2, 
  Clock, 
  DollarSign,
  TrendingUp,
  Calendar,
  Loader2,
  Calculator,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function HistorialPage() {
  const { user } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    const token = localStorage.getItem('nailcost_token');
    if (!token) return;

    try {
      const res = await fetch(`${API}/historial-calculos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistorial(await res.json());
      }
    } catch (err) {
      toast.error("Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/historial-calculos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHistorial(prev => prev.filter(h => h.id !== id));
        toast.success("Cálculo eliminado");
      }
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const handleCopy = (calc) => {
    const text = `💅 *Cotización NailCost*\n\n` +
      `Servicio: ${calc.estilo_nombre}\n` +
      `Precio: $${calc.precio_recomendado?.toFixed(2)}\n` +
      (calc.cliente_nombre ? `Cliente: ${calc.cliente_nombre}\n` : '') +
      `\n¡Gracias por tu preferencia! ✨`;
    
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleShare = (calc) => {
    const text = encodeURIComponent(
      `💅 *Cotización NailCost*\n\n` +
      `Servicio: ${calc.estilo_nombre}\n` +
      `Precio: $${calc.precio_recomendado?.toFixed(2)}\n` +
      `\n¡Gracias por tu preferencia! ✨`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredHistorial = historial.filter(h => 
    h.estilo_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const groupedHistorial = groupByDate(filteredHistorial);

  // Stats
  const totalCalculos = historial.length;
  const totalGanancia = historial.reduce((sum, h) => sum + (h.ganancia || 0), 0);
  const promedioPrecio = historial.length > 0 
    ? historial.reduce((sum, h) => sum + (h.precio_recomendado || 0), 0) / historial.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E84A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24" data-testid="historial-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Historial de Cálculos
          </h1>
          <p className="text-sm text-[#64748B]">Tus cotizaciones guardadas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-[#FDF2F7] to-[#FFE4EE] border-none">
          <CardContent className="p-4 text-center">
            <Calculator className="w-5 h-5 text-[#E84A8A] mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1A1A2E]">{totalCalculos}</p>
            <p className="text-xs text-[#64748B]">Cálculos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-none">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1A1A2E]">${totalGanancia.toFixed(0)}</p>
            <p className="text-xs text-[#64748B]">Ganancia Est.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-[#1A1A2E]">${promedioPrecio.toFixed(0)}</p>
            <p className="text-xs text-[#64748B]">Promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
        <Input
          placeholder="Buscar por estilo o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-2xl border-[#FCE7F0] focus:border-[#E84A8A]"
          data-testid="historial-search"
        />
      </div>

      {/* Historial List */}
      {Object.keys(groupedHistorial).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedHistorial).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-[#E84A8A]" />
                <h3 className="text-sm font-medium text-[#64748B] capitalize">{date}</h3>
              </div>
              <div className="space-y-3">
                {items.map((calc) => (
                  <Card 
                    key={calc.id} 
                    className="bg-white border-[#FCE7F0] overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedId(expandedId === calc.id ? null : calc.id)}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1A1A2E] truncate">{calc.estilo_nombre}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-[#64748B]" />
                              <span className="text-xs text-[#64748B]">
                                {new Date(calc.created_at).toLocaleTimeString('es-MX', { 
                                  hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                              {calc.cliente_nombre && (
                                <span className="text-xs text-[#E84A8A]">• {calc.cliente_nombre}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xl font-bold text-[#E84A8A]">
                                ${calc.precio_recomendado?.toFixed(2)}
                              </p>
                              <p className="text-xs text-emerald-500">
                                +${calc.ganancia?.toFixed(2)}
                              </p>
                            </div>
                            {expandedId === calc.id ? (
                              <ChevronUp className="w-5 h-5 text-[#64748B]" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-[#64748B]" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedId === calc.id && (
                        <div className="px-4 pb-4 pt-0 border-t border-[#FCE7F0] mt-2 animate-fade-in">
                          <div className="grid grid-cols-2 gap-3 py-3">
                            <div className="bg-[#F8FAFC] rounded-xl p-3">
                              <p className="text-xs text-[#64748B]">Costo Total</p>
                              <p className="font-semibold text-[#1A1A2E]">${calc.costo_total?.toFixed(2)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3">
                              <p className="text-xs text-[#64748B]">Ganancia</p>
                              <p className="font-semibold text-emerald-600">${calc.ganancia?.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {calc.notas && (
                            <p className="text-sm text-[#64748B] italic mb-3">"{calc.notas}"</p>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCopy(calc)}
                              variant="outline"
                              size="sm"
                              className="flex-1 rounded-xl border-[#FCE7F0]"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar
                            </Button>
                            <Button
                              onClick={() => handleShare(calc)}
                              size="sm"
                              className="flex-1 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              WhatsApp
                            </Button>
                            <Button
                              onClick={() => handleDelete(calc.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-[#FDF2F7] flex items-center justify-center mx-auto mb-4">
            <History className="w-10 h-10 text-[#E84A8A]/50" />
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
            {searchTerm ? "Sin resultados" : "Sin historial"}
          </h3>
          <p className="text-[#64748B] mb-4">
            {searchTerm 
              ? "Intenta con otro término de búsqueda" 
              : "Tus cálculos aparecerán aquí"}
          </p>
          {!searchTerm && (
            <Link to="/calculadora">
              <Button className="bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white rounded-full px-6">
                <Calculator className="w-4 h-4 mr-2" />
                Hacer un cálculo
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export { HistorialPage };
