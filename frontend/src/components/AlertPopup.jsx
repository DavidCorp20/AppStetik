import { useState, useEffect } from "react";
import { X, AlertTriangle, TrendingDown, Package, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ALERT_STORAGE_KEY = "nailcost_alerts_dismissed";

export function AlertPopup({ alerts, onDismiss }) {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    // Load dismissed alerts from localStorage
    const stored = localStorage.getItem(ALERT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Only keep alerts dismissed in the last 24 hours
        const now = Date.now();
        const valid = parsed.filter(d => now - d.time < 24 * 60 * 60 * 1000);
        setDismissed(valid.map(d => d.id));
      } catch (e) {
        setDismissed([]);
      }
    }
  }, []);

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter(a => !dismissed.includes(a.id));

  useEffect(() => {
    if (activeAlerts.length === 0) {
      setIsVisible(false);
    }
  }, [activeAlerts.length]);

  const handleDismiss = (alertId) => {
    const newDismissed = [...dismissed, alertId];
    setDismissed(newDismissed);
    
    // Store in localStorage with timestamp
    const stored = JSON.parse(localStorage.getItem(ALERT_STORAGE_KEY) || '[]');
    stored.push({ id: alertId, time: Date.now() });
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(stored));
    
    if (currentAlert >= activeAlerts.length - 1) {
      setCurrentAlert(Math.max(0, activeAlerts.length - 2));
    }
    
    onDismiss?.(alertId);
  };

  const handleDismissAll = () => {
    activeAlerts.forEach(a => handleDismiss(a.id));
    setIsVisible(false);
  };

  if (!isVisible || activeAlerts.length === 0) return null;

  const alert = activeAlerts[currentAlert];
  if (!alert) return null;

  const getAlertStyle = (type) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-red-50 border-red-200",
          icon: "bg-red-100 text-red-600",
          title: "text-red-800",
          text: "text-red-600"
        };
      case "warning":
        return {
          bg: "bg-amber-50 border-amber-200",
          icon: "bg-amber-100 text-amber-600",
          title: "text-amber-800",
          text: "text-amber-600"
        };
      case "rentability":
        return {
          bg: "bg-orange-50 border-orange-200",
          icon: "bg-orange-100 text-orange-600",
          title: "text-orange-800",
          text: "text-orange-600"
        };
      default:
        return {
          bg: "bg-blue-50 border-blue-200",
          icon: "bg-blue-100 text-blue-600",
          title: "text-blue-800",
          text: "text-blue-600"
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "critical":
      case "warning":
        return Package;
      case "rentability":
        return TrendingDown;
      default:
        return Bell;
    }
  };

  const style = getAlertStyle(alert.type);
  const Icon = getIcon(alert.type);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up" data-testid="alert-popup">
      <div className={`rounded-xl border shadow-lg overflow-hidden ${style.bg}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-current/10">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${style.text}`} />
            <span className={`text-xs font-medium ${style.text}`}>
              {activeAlerts.length > 1 ? `${currentAlert + 1} de ${activeAlerts.length} alertas` : "Alerta"}
            </span>
          </div>
          <button 
            onClick={() => handleDismiss(alert.id)}
            className={`p-1 rounded hover:bg-black/5 ${style.text}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.icon}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${style.title}`}>{alert.title}</h4>
              <p className={`text-sm mt-1 ${style.text}`}>{alert.message}</p>
              
              {alert.action && (
                <Link to={alert.action.link}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className={`mt-2 h-8 px-0 ${style.text} hover:bg-transparent hover:underline`}
                  >
                    {alert.action.label}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer with navigation */}
        {activeAlerts.length > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-current/10 bg-white/50">
            <div className="flex gap-1">
              {activeAlerts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentAlert(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentAlert ? style.icon.replace('text-', 'bg-') : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={handleDismissAll}
              className={`text-xs ${style.text} hover:underline`}
            >
              Descartar todas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook to generate alerts based on app data
export function useAlerts({ productos = [], reporte = null, gastos = [], configGanancias = null }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const newAlerts = [];

    // Check for out of stock products
    const agotados = productos.filter(p => (p.cantidad_disponible ?? p.cantidad_comprada ?? 0) === 0);
    if (agotados.length > 0) {
      newAlerts.push({
        id: `stock-critical-${agotados.length}`,
        type: "critical",
        title: `${agotados.length} producto${agotados.length > 1 ? 's' : ''} agotado${agotados.length > 1 ? 's' : ''}`,
        message: agotados.slice(0, 3).map(p => p.nombre).join(", ") + (agotados.length > 3 ? ` y ${agotados.length - 3} más` : ""),
        action: { label: "Ver inventario", link: "/inventario" }
      });
    }

    // Check for low stock products
    const stockBajo = productos.filter(p => {
      const stock = p.cantidad_disponible ?? p.cantidad_comprada ?? 0;
      const minimo = p.stock_minimo || 5;
      return stock > 0 && stock <= minimo;
    });
    if (stockBajo.length > 0) {
      newAlerts.push({
        id: `stock-warning-${stockBajo.length}`,
        type: "warning",
        title: `${stockBajo.length} producto${stockBajo.length > 1 ? 's' : ''} con stock bajo`,
        message: stockBajo.slice(0, 2).map(p => `${p.nombre} (${p.cantidad_disponible ?? p.cantidad_comprada})`).join(", "),
        action: { label: "Reponer stock", link: "/inventario" }
      });
    }

    // Check for negative rentability
    if (reporte && configGanancias) {
      const ingresos = reporte.rentabilidad_mensual_estimada || 0;
      const gastosTotal = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
      
      if (ingresos < gastosTotal && gastosTotal > 0) {
        const perdida = gastosTotal - ingresos;
        newAlerts.push({
          id: `rentability-negative-${Math.round(perdida)}`,
          type: "rentability",
          title: "Rentabilidad negativa",
          message: `Tus gastos ($${gastosTotal.toFixed(0)}) superan tus ingresos estimados ($${ingresos.toFixed(0)}) en $${perdida.toFixed(0)}`,
          action: { label: "Ver reportes", link: "/reportes-financieros" }
        });
      }
    }

    // Check for low goal progress
    if (reporte && configGanancias?.meta_ingreso_mensual > 0) {
      const progreso = (reporte.rentabilidad_mensual_estimada || 0) / configGanancias.meta_ingreso_mensual * 100;
      const diaDelMes = new Date().getDate();
      const diasEnMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const progresoEsperado = (diaDelMes / diasEnMes) * 100;
      
      if (progreso < progresoEsperado * 0.7 && diaDelMes > 10) {
        newAlerts.push({
          id: `goal-behind-${Math.round(progreso)}`,
          type: "warning",
          title: "Meta mensual en riesgo",
          message: `Solo has alcanzado ${progreso.toFixed(0)}% de tu meta. Deberías estar al ${progresoEsperado.toFixed(0)}%`,
          action: { label: "Ver simulador", link: "/simulacion" }
        });
      }
    }

    setAlerts(newAlerts);
  }, [productos, reporte, gastos, configGanancias]);

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return { alerts, dismissAlert };
}

export default AlertPopup;
