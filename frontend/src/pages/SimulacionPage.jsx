import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Calculator, 
  Loader2, 
  TrendingUp, 
  DollarSign,
  Clock,
  Target,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { PremiumGate } from "@/components/PremiumGate";

export default function SimulacionPage() {
  return (
    <PremiumGate feature="La simulación de ingresos">
      <SimulacionContent />
    </PremiumGate>
  );
}

function SimulacionContent() {
  const { simularIngresos, configGanancias, loading } = useApp();
  const [serviciosPorDia, setServiciosPorDia] = useState(3);
  const [diasTrabajo, setDiasTrabajo] = useState(22);
  const [simulacion, setSimulacion] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimular = async () => {
    setSimulating(true);
    try {
      const result = await simularIngresos(serviciosPorDia, diasTrabajo);
      setSimulacion(result);
    } catch (err) {
      toast.error("Error al simular");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const metaMensual = configGanancias?.meta_ingreso_mensual || 2000;
  const bestService = simulacion?.simulacion?.[0];
  const avgIncome = simulacion?.simulacion?.length > 0 
    ? simulacion.simulacion.reduce((sum, s) => sum + s.ingresos_estimados, 0) / simulacion.simulacion.length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="simulacion-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Simulación de Ingresos
        </h1>
        <p className="text-stone-500 mt-1">
          Proyecta tus ingresos mensuales según tu capacidad
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <Card className="bg-white border-stone-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Calculator className="w-5 h-5 text-stone-600" />
              Parámetros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Servicios por día */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-stone-600">Servicios por Día</Label>
                <span className="text-xl font-bold text-stone-800" data-testid="servicios-dia-value">
                  {serviciosPorDia}
                </span>
              </div>
              <Slider
                value={[serviciosPorDia]}
                onValueChange={(val) => setServiciosPorDia(val[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
                data-testid="servicios-dia-slider"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-2">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Días de trabajo */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-stone-600">Días de Trabajo/Mes</Label>
                <span className="text-xl font-bold text-stone-800" data-testid="dias-trabajo-value">
                  {diasTrabajo}
                </span>
              </div>
              <Slider
                value={[diasTrabajo]}
                onValueChange={(val) => setDiasTrabajo(val[0])}
                max={30}
                min={10}
                step={1}
                className="w-full"
                data-testid="dias-trabajo-slider"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-2">
                <span>10</span>
                <span>20</span>
                <span>30</span>
              </div>
            </div>

            {/* Total servicios */}
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-sm text-stone-500">Total Servicios/Mes</p>
              <p className="text-3xl font-bold text-stone-800">
                {serviciosPorDia * diasTrabajo}
              </p>
            </div>

            <Button
              onClick={handleSimular}
              disabled={simulating}
              className="w-full bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="simular-btn"
            >
              {simulating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Simular Ingresos
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {simulacion ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-50 border-emerald-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-600">Ingreso Promedio</p>
                        <p className="text-xl font-bold text-emerald-700" data-testid="avg-income">
                          ${avgIncome.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-violet-50 border-violet-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-xs text-violet-600">Meta Mensual</p>
                        <p className="text-xl font-bold text-violet-700">
                          ${metaMensual.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200 col-span-2 md:col-span-1">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-amber-600">Gastos Operativos</p>
                        <p className="text-xl font-bold text-amber-700">
                          ${simulacion.parametros.gastos_operativos.toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Best Service Recommendation */}
              {bestService && (
                <Card className="bg-gradient-to-r from-stone-800 to-stone-700 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-stone-300 uppercase tracking-wider">Servicio Más Rentable</p>
                        <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {bestService.estilo}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-stone-300">Precio</p>
                            <p className="text-lg font-semibold">${bestService.precio_servicio}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-300">Ganancia/Hora</p>
                            <p className="text-lg font-semibold">${bestService.rentabilidad_hora}</p>
                          </div>
                          <div>
                            <p className="text-xs text-stone-300">Ganancia/Mes</p>
                            <p className="text-lg font-semibold">${bestService.ganancia_estimada}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chart */}
              <Card className="bg-white border-stone-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Proyección por Servicio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={simulacion.simulacion} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis 
                        dataKey="estilo" 
                        type="category" 
                        tick={{ fontSize: 10 }} 
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          `$${value}`, 
                          name === 'ingresos_estimados' ? 'Ingresos' : 'Ganancia'
                        ]}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5E4' }}
                      />
                      <Bar dataKey="ingresos_estimados" fill="#A16E5E" radius={[0, 4, 4, 0]} name="Ingresos" />
                      <Bar dataKey="ganancia_estimada" fill="#849686" radius={[0, 4, 4, 0]} name="Ganancia" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Table */}
              <Card className="bg-white border-stone-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Ranking de Rentabilidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-stone-100">
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase">#</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase">Servicio</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Precio</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">$/Hora</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Ingresos/Mes</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Ganancia/Mes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simulacion.simulacion.map((item, idx) => (
                        <TableRow key={idx} className="border-stone-100 hover:bg-stone-50">
                          <TableCell>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              idx === 0 ? 'bg-amber-100 text-amber-700' :
                              idx === 1 ? 'bg-stone-200 text-stone-600' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-stone-100 text-stone-500'
                            }`}>
                              {idx + 1}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{item.estilo}</TableCell>
                          <TableCell className="text-right">${item.precio_servicio}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={
                              item.rentabilidad_hora >= 20 
                                ? "bg-emerald-50 text-emerald-700" 
                                : item.rentabilidad_hora >= 10 
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                            }>
                              ${item.rentabilidad_hora}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">${item.ingresos_estimados}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700">
                            ${item.ganancia_estimada}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-stone-50 border-stone-200 border-dashed h-full min-h-[400px]">
              <CardContent className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-lg font-medium text-stone-600 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Configura tus parámetros
                </h3>
                <p className="text-sm text-stone-400 text-center max-w-xs">
                  Ajusta los servicios por día y días de trabajo, luego haz clic en "Simular Ingresos"
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { SimulacionPage };
