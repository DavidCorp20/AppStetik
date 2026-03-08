import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Loader2, 
  Receipt, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  TrendingUp,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function CalculadoraPage() {
  const { estilos, disenos, calcularPrecio, loading } = useApp();
  const [selectedEstilo, setSelectedEstilo] = useState("");
  const [selectedDisenos, setSelectedDisenos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const handleDisenoToggle = (disenoId) => {
    setSelectedDisenos(prev => 
      prev.includes(disenoId) 
        ? prev.filter(id => id !== disenoId)
        : [...prev, disenoId]
    );
  };

  const handleCalcular = async () => {
    if (!selectedEstilo) {
      toast.error("Selecciona un estilo de uñas");
      return;
    }

    setCalculating(true);
    try {
      const result = await calcularPrecio(selectedEstilo, selectedDisenos);
      setResultado(result);
    } catch (err) {
      toast.error("Error al calcular el precio");
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setSelectedEstilo("");
    setSelectedDisenos([]);
    setResultado(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="calculadora-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Calculadora de Precios
        </h1>
        <p className="text-stone-500 mt-1">
          Calcula el precio ideal para tus servicios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Input Section */}
        <div className="lg:col-span-5 space-y-6">
          {/* Estilo Selection */}
          <Card className="bg-white border-stone-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center">1</span>
                Selecciona el Estilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {estilos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-stone-500 text-sm">No hay estilos registrados</p>
                </div>
              ) : (
                <Select value={selectedEstilo} onValueChange={setSelectedEstilo}>
                  <SelectTrigger className="rounded-xl" data-testid="estilo-select">
                    <SelectValue placeholder="Selecciona un estilo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {estilos.map((estilo) => (
                      <SelectItem key={estilo.id} value={estilo.id}>
                        <div className="flex items-center gap-2">
                          <span>{estilo.nombre}</span>
                          <span className="text-stone-400 text-xs">({estilo.tiempo_trabajo_minutos} min)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Diseños Selection */}
          <Card className="bg-white border-stone-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="w-6 h-6 rounded-full bg-stone-800 text-white text-xs flex items-center justify-center">2</span>
                Agregar Diseños (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {disenos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-stone-500 text-sm">No hay diseños registrados</p>
                </div>
              ) : (
                <ScrollArea className="max-h-64">
                  <div className="space-y-2">
                    {disenos.map((diseno) => (
                      <div 
                        key={diseno.id}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                          selectedDisenos.includes(diseno.id) 
                            ? "bg-stone-100 border border-stone-300" 
                            : "bg-stone-50 hover:bg-stone-100"
                        }`}
                        onClick={() => handleDisenoToggle(diseno.id)}
                        data-testid={`diseno-option-${diseno.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={selectedDisenos.includes(diseno.id)}
                            onCheckedChange={() => handleDisenoToggle(diseno.id)}
                          />
                          <div>
                            <p className="font-medium text-stone-700">{diseno.nombre}</p>
                            <p className="text-xs text-stone-500">+{diseno.tiempo_adicional_minutos} min</p>
                          </div>
                        </div>
                        <span className="font-semibold text-emerald-700">+{formatCurrency(diseno.costo_adicional)}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Calculate Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 rounded-full"
              disabled={calculating}
              data-testid="reset-calc-btn"
            >
              Limpiar
            </Button>
            <Button
              onClick={handleCalcular}
              disabled={calculating || !selectedEstilo}
              className="flex-1 bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="calculate-btn"
            >
              {calculating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4 mr-2" />
              )}
              Calcular Precio
            </Button>
          </div>
        </div>

        {/* Result Section - Receipt Style */}
        <div className="lg:col-span-7">
          {resultado ? (
            <div className="space-y-4 animate-fade-in" data-testid="resultado-section">
              {/* Main Receipt */}
              <Card className="bg-white border-stone-100 shadow-lg receipt-shadow overflow-hidden">
                <div className="p-6 bg-stone-800 text-white text-center">
                  <p className="text-xs uppercase tracking-widest text-stone-300">Recibo de Cálculo</p>
                  <h2 className="text-2xl font-semibold mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {resultado.estilo_nombre}
                  </h2>
                  {selectedDisenos.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1 mt-2">
                      {selectedDisenos.map((id) => {
                        const dis = disenos.find(d => d.id === id);
                        return dis ? (
                          <Badge key={id} className="bg-white/20 text-white text-xs">
                            + {dis.nombre}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  {/* Cost Breakdown */}
                  <div className="space-y-3 border-b border-dashed border-stone-200 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Costo de Productos</span>
                      <span className="font-medium" data-testid="costo-productos">{formatCurrency(resultado.costo_productos)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Gasto Operativo</span>
                      <span className="font-medium" data-testid="costo-operativo">{formatCurrency(resultado.costo_operativo_prorrateado)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Costo de Tiempo</span>
                      <span className="font-medium" data-testid="costo-tiempo">{formatCurrency(resultado.costo_tiempo_trabajo)}</span>
                    </div>
                    {resultado.costo_disenos > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Diseños</span>
                        <span className="font-medium" data-testid="costo-disenos">{formatCurrency(resultado.costo_disenos)}</span>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="py-4 border-b border-dashed border-stone-200">
                    <div className="flex justify-between">
                      <span className="text-stone-700 font-medium">Costo Total</span>
                      <span className="font-semibold text-stone-800" data-testid="costo-total">{formatCurrency(resultado.costo_total)}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-emerald-700">
                      <span className="font-medium">+ Margen de Ganancia</span>
                      <span className="font-semibold" data-testid="margen-ganancia">{formatCurrency(resultado.margen_ganancia)}</span>
                    </div>
                  </div>

                  {/* Final Price */}
                  <div className="py-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-stone-800">Precio Recomendado</span>
                      <span className="text-3xl font-bold text-stone-800" data-testid="precio-recomendado">
                        {formatCurrency(resultado.precio_recomendado)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm text-stone-500">
                      <span>Precio Mínimo Rentable</span>
                      <span data-testid="precio-minimo">{formatCurrency(resultado.precio_minimo_rentable)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200">
                    <div className="text-center p-3 bg-stone-50 rounded-xl">
                      <DollarSign className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                      <p className="text-xs text-stone-500">Ganancia</p>
                      <p className="font-semibold text-stone-800" data-testid="ganancia-real">{formatCurrency(resultado.ganancia_real)}</p>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-xl">
                      <Clock className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                      <p className="text-xs text-stone-500">Tiempo</p>
                      <p className="font-semibold text-stone-800" data-testid="tiempo-total">{resultado.tiempo_total_minutos} min</p>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-xl">
                      <TrendingUp className="w-5 h-5 mx-auto text-violet-600 mb-1" />
                      <p className="text-xs text-stone-500">$/Hora</p>
                      <p className="font-semibold text-stone-800" data-testid="rentabilidad-hora">{formatCurrency(resultado.rentabilidad_hora)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts */}
              {resultado.alertas && resultado.alertas.length > 0 && (
                <Card className="bg-amber-50 border-amber-200" data-testid="alertas-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {resultado.alertas.map((alerta, idx) => (
                          <p key={idx} className="text-sm text-amber-800">{alerta}</p>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Empty State */
            <Card className="bg-stone-50 border-stone-200 border-dashed h-full min-h-[400px]">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-medium text-stone-600 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Tu Recibo Aparecerá Aquí
                </h3>
                <p className="text-sm text-stone-400 text-center max-w-xs">
                  Selecciona un estilo y opcionalmente diseños adicionales, luego haz clic en "Calcular Precio"
                </p>
                <div className="flex items-center gap-2 mt-6 text-stone-400">
                  <span className="text-sm">Selecciona</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm">Calcula</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-sm">Gana</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { CalculadoraPage };
