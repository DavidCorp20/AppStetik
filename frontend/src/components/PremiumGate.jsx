import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Sparkles } from "lucide-react";

export function PremiumGate({ children, feature = "esta función" }) {
  const { isPremium } = useAuth();

  if (isPremium) {
    return children;
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          
          <h2 className="text-2xl font-semibold text-stone-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Función Premium
          </h2>
          
          <p className="text-stone-600 mb-6">
            {feature} está disponible exclusivamente para usuarios con <span className="font-semibold text-amber-700">Plan Premium</span>.
          </p>

          <div className="bg-white/70 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-stone-700 mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Beneficios Premium:
            </p>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Productos, estilos y diseños ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Clientes ilimitados
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Reportes mensuales detallados
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Simulación de ingresos
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Exportar a PDF y Excel
              </li>
            </ul>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full h-12"
            data-testid="upgrade-premium-btn"
          >
            <Crown className="w-4 h-4 mr-2" />
            Actualizar a Premium
          </Button>
          
          <p className="text-xs text-stone-400 mt-4">
            Contacta al administrador para activar tu plan Premium
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function PremiumBadge() {
  const { isPremium } = useAuth();
  
  if (!isPremium) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
      <Crown className="w-3 h-3" />
      Premium
    </span>
  );
}
