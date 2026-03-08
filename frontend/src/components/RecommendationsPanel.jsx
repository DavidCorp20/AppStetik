import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Package,
  Users,
  Target,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Recommendation types with icons and colors
const RECOMMENDATION_CONFIG = {
  profit: { icon: TrendingUp, color: "emerald", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-200" },
  cost: { icon: TrendingDown, color: "amber", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-200" },
  warning: { icon: AlertTriangle, color: "red", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-200" },
  inventory: { icon: Package, color: "blue", bgColor: "bg-blue-50", textColor: "text-blue-700", borderColor: "border-blue-200" },
  growth: { icon: Target, color: "violet", bgColor: "bg-violet-50", textColor: "text-violet-700", borderColor: "border-violet-200" },
};

// Single recommendation card
const RecommendationCard = ({ type, title, description, metric, trend }) => {
  const config = RECOMMENDATION_CONFIG[type] || RECOMMENDATION_CONFIG.profit;
  const Icon = config.icon;
  
  return (
    <div className={`p-4 rounded-xl border ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.textColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${config.textColor} text-sm`}>{title}</h4>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {trend > 0 ? <ArrowUp className="w-3 h-3" /> : trend < 0 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          {metric && (
            <p className={`text-lg font-bold ${config.textColor} mt-2`}>{metric}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export function RecommendationsPanel({ className = "" }) {
  const { productos, estilos, clientes, gastos, configGanancias } = useApp();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    generateRecommendations();
  }, [productos, estilos, clientes, gastos, configGanancias]);

  const generateRecommendations = () => {
    const recs = [];

    // 1. Analyze low margin services
    if (estilos.length > 0) {
      const lowMarginStyles = estilos.filter(e => {
        const costo = e.costo_productos || 0;
        const precio = e.precio_sugerido || costo * 1.5;
        const margen = precio > 0 ? ((precio - costo) / precio) * 100 : 0;
        return margen < 30 && margen > 0;
      });
      
      if (lowMarginStyles.length > 0) {
        recs.push({
          type: "warning",
          title: `${lowMarginStyles.length} servicio(s) con margen bajo`,
          description: `Considera aumentar el precio de: ${lowMarginStyles.slice(0, 2).map(s => s.nombre).join(", ")}`,
          metric: null,
        });
      }

      // Best performing service
      const sortedByMargin = [...estilos].sort((a, b) => {
        const marginA = (a.precio_sugerido || 0) - (a.costo_productos || 0);
        const marginB = (b.precio_sugerido || 0) - (b.costo_productos || 0);
        return marginB - marginA;
      });
      
      if (sortedByMargin[0]?.nombre) {
        recs.push({
          type: "profit",
          title: "Tu servicio más rentable",
          description: `"${sortedByMargin[0].nombre}" genera mejor margen. Promuévelo más.`,
          metric: formatCurrency((sortedByMargin[0].precio_sugerido || 0) - (sortedByMargin[0].costo_productos || 0)) + " ganancia",
        });
      }
    }

    // 2. Analyze inventory
    if (productos.length > 0) {
      const lowStock = productos.filter(p => (p.cantidad_disponible || 0) <= (p.stock_minimo || 5));
      const outOfStock = productos.filter(p => (p.cantidad_disponible || 0) === 0);
      
      if (outOfStock.length > 0) {
        recs.push({
          type: "warning",
          title: `${outOfStock.length} producto(s) agotados`,
          description: `Reabastecer: ${outOfStock.slice(0, 3).map(p => p.nombre).join(", ")}`,
          metric: null,
        });
      } else if (lowStock.length > 0) {
        recs.push({
          type: "inventory",
          title: `${lowStock.length} producto(s) con stock bajo`,
          description: "Revisa tu inventario antes de quedarte sin material",
          metric: null,
        });
      }

      // Calculate total inventory value
      const inventoryValue = productos.reduce((sum, p) => {
        return sum + ((p.precio_compra || 0) * (p.cantidad_disponible || 0));
      }, 0);
      
      if (inventoryValue > 0) {
        recs.push({
          type: "inventory",
          title: "Valor de tu inventario",
          description: "Capital invertido en productos y materiales",
          metric: formatCurrency(inventoryValue),
        });
      }
    }

    // 3. Analyze costs
    if (gastos) {
      const totalGastos = Object.entries(gastos)
        .filter(([key]) => !['clientes_mes', 'servicios_mes', 'dias_trabajo', 'user_id', 'id'].includes(key))
        .reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);
      
      if (totalGastos > 0) {
        const highestCost = Object.entries(gastos)
          .filter(([key, val]) => !['clientes_mes', 'servicios_mes', 'dias_trabajo', 'user_id', 'id'].includes(key) && typeof val === 'number')
          .sort((a, b) => b[1] - a[1])[0];
        
        if (highestCost && highestCost[1] > totalGastos * 0.3) {
          const costNames = {
            renta: "Renta", luz: "Luz", agua: "Agua", internet: "Internet",
            telefono: "Teléfono", publicidad: "Publicidad", mantenimiento: "Mantenimiento",
            material_limpieza: "Material de limpieza", otros: "Otros"
          };
          recs.push({
            type: "cost",
            title: "Tu mayor gasto",
            description: `${costNames[highestCost[0]] || highestCost[0]} representa ${((highestCost[1] / totalGastos) * 100).toFixed(0)}% de tus gastos`,
            metric: formatCurrency(highestCost[1]) + "/mes",
          });
        }
      }
    }

    // 4. Client analysis
    if (clientes.length > 0) {
      recs.push({
        type: "growth",
        title: "Tu cartera de clientes",
        description: clientes.length >= 20 
          ? "¡Excelente base de clientes! Considera crear un programa de fidelidad"
          : "Sigue creciendo. Pide referidos a tus clientes actuales",
        metric: `${clientes.length} clientes`,
      });
    }

    // 5. Growth opportunity
    if (configGanancias?.meta_ingreso_mensual > 0 && estilos.length > 0) {
      const avgPrice = estilos.reduce((sum, e) => sum + (e.precio_sugerido || 0), 0) / estilos.length;
      const servicesNeeded = Math.ceil(configGanancias.meta_ingreso_mensual / avgPrice);
      
      recs.push({
        type: "growth",
        title: "Para alcanzar tu meta",
        description: `Necesitas aproximadamente ${servicesNeeded} servicios al mes`,
        metric: formatCurrency(configGanancias.meta_ingreso_mensual) + " meta",
      });
    }

    setRecommendations(recs.slice(0, 5)); // Max 5 recommendations
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className={`border-gray-100 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Recomendaciones Inteligentes
          <Badge variant="outline" className="ml-2 text-xs">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <RecommendationCard key={index} {...rec} />
        ))}
      </CardContent>
    </Card>
  );
}

export default RecommendationsPanel;
