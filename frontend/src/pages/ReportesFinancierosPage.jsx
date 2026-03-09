import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Receipt, PieChart, Calendar,
  ArrowUpRight, ArrowDownRight, Loader2, Download, Building2, Target, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { FeatureHelpButton, AutoFeatureTutorial } from "@/components/FeatureTutorial";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function ReportesFinancierosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("financiero");
  const [financiero, setFinanciero] = useState(null);
  const [estadoEmpresa, setEstadoEmpresa] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [finRes, estadoRes] = await Promise.all([
        authAxios.get(`${API}/reportes/financiero`),
        authAxios.get(`${API}/reportes/estado-empresa`)
      ]);
      setFinanciero(finRes.data);
      setEstadoEmpresa(estadoRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const TrendIndicator = ({ value, label }) => (
    <div className={`flex items-center gap-1 text-sm ${value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {value >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
      <span>{Math.abs(value)}%</span>
      <span className="text-stone-400">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reportes-financieros-page">
      {/* Auto Tutorial */}
      <AutoFeatureTutorial feature="reportes" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Reportes Financieros</h1>
              <FeatureHelpButton feature="reportes" />
            </div>
            <p className="text-stone-500">Análisis completo de tu negocio</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      {/* Estado de Empresa - Cards Principales */}
      {estadoEmpresa && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
            <CardContent className="p-4">
              <DollarSign className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">${estadoEmpresa.resumen.ingresos_mes}</p>
              <p className="text-xs text-emerald-100">Ingresos del Mes</p>
              {estadoEmpresa.tendencias && <TrendIndicator value={estadoEmpresa.tendencias.ingresos} label="vs mes ant." />}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <CardContent className="p-4">
              <Receipt className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">${estadoEmpresa.resumen.facturado_mes}</p>
              <p className="text-xs text-blue-100">Facturado</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Calendar className="w-6 h-6 mb-2 text-violet-500" />
              <p className="text-2xl font-bold">{estadoEmpresa.resumen.servicios_mes}</p>
              <p className="text-xs text-stone-500">Servicios</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Building2 className="w-6 h-6 mb-2 text-pink-500" />
              <p className="text-2xl font-bold">{estadoEmpresa.resumen.clientes_total}</p>
              <p className="text-xs text-stone-500">Clientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Target className="w-6 h-6 mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{estadoEmpresa.resumen.citas_pendientes}</p>
              <p className="text-xs text-stone-500">Citas Pendientes</p>
            </CardContent>
          </Card>

          <Card className={estadoEmpresa.resumen.productos_stock_bajo > 0 ? "border-red-200 bg-red-50" : ""}>
            <CardContent className="p-4">
              <AlertTriangle className={`w-6 h-6 mb-2 ${estadoEmpresa.resumen.productos_stock_bajo > 0 ? 'text-red-500' : 'text-stone-400'}`} />
              <p className="text-2xl font-bold">{estadoEmpresa.resumen.productos_stock_bajo}</p>
              <p className="text-xs text-stone-500">Stock Bajo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Reportes */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-stone-100">
          <TabsTrigger value="financiero" className="gap-2"><DollarSign className="w-4 h-4" />Estado de Resultados</TabsTrigger>
          <TabsTrigger value="servicios" className="gap-2"><BarChart3 className="w-4 h-4" />Servicios</TabsTrigger>
          <TabsTrigger value="gastos" className="gap-2"><PieChart className="w-4 h-4" />Gastos</TabsTrigger>
        </TabsList>

        {/* Estado de Resultados */}
        <TabsContent value="financiero" className="space-y-4">
          {financiero && (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Estado de Resultados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado de Resultados - {financiero.periodo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span>Ingresos Brutos</span>
                      <span className="font-bold text-emerald-600">${financiero.estado_resultados.ingresos_brutos}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b text-stone-600">
                      <span>(-) Costos Directos</span>
                      <span>${financiero.estado_resultados.costos_directos}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b font-medium">
                      <span>= Utilidad Bruta</span>
                      <span className="text-blue-600">${financiero.estado_resultados.utilidad_bruta}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b text-stone-600">
                      <span>(-) Gastos Operativos</span>
                      <span>${financiero.estado_resultados.gastos_operativos}</span>
                    </div>
                    <div className="flex justify-between py-3 bg-stone-100 rounded-lg px-3 font-bold text-lg">
                      <span>= Utilidad Neta</span>
                      <span className={financiero.estado_resultados.utilidad_neta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                        ${financiero.estado_resultados.utilidad_neta}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{financiero.estado_resultados.margen_bruto}%</p>
                        <p className="text-xs text-stone-500">Margen Bruto</p>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <p className="text-2xl font-bold text-emerald-600">{financiero.estado_resultados.margen_neto}%</p>
                        <p className="text-xs text-stone-500">Margen Neto</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Facturación */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Facturación del Mes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-stone-100 rounded-lg">
                        <p className="text-xl font-bold">${financiero.facturacion.total_facturado}</p>
                        <p className="text-xs text-stone-500">Total</p>
                      </div>
                      <div className="p-3 bg-emerald-100 rounded-lg">
                        <p className="text-xl font-bold text-emerald-700">${financiero.facturacion.cobrado}</p>
                        <p className="text-xs text-stone-500">Cobrado</p>
                      </div>
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <p className="text-xl font-bold text-orange-700">${financiero.facturacion.pendiente}</p>
                        <p className="text-xs text-stone-500">Pendiente</p>
                      </div>
                    </div>

                    {/* Por método de pago */}
                    {financiero.facturacion.por_metodo_pago && Object.keys(financiero.facturacion.por_metodo_pago).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Por Método de Pago</p>
                        <div className="space-y-2">
                          {Object.entries(financiero.facturacion.por_metodo_pago).map(([metodo, data]) => (
                            <div key={metodo} className="flex justify-between items-center p-2 bg-stone-50 rounded">
                              <span className="capitalize text-sm">{metodo.replace('_', ' ')}</span>
                              <div className="text-right">
                                <span className="font-medium">${data.total}</span>
                                <span className="text-xs text-stone-400 ml-2">({data.count})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Indicadores */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold">${financiero.indicadores.ticket_promedio}</p>
                        <p className="text-xs text-stone-500">Ticket Promedio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold">{financiero.indicadores.servicios_por_dia}</p>
                        <p className="text-xs text-stone-500">Servicios/Día</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico */}
              {estadoEmpresa?.historico && estadoEmpresa.historico.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Evolución Últimos Meses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={estadoEmpresa.historico}>
                        <XAxis dataKey="periodo" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#10B981" />
                        <Bar dataKey="facturado" name="Facturado" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Servicios */}
        <TabsContent value="servicios" className="space-y-4">
          {financiero?.servicios && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ranking de Servicios</CardTitle>
              </CardHeader>
              <CardContent>
                {financiero.servicios.ranking.length === 0 ? (
                  <p className="text-center text-stone-500 py-8">No hay servicios registrados este mes</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={financiero.servicios.ranking} layout="vertical">
                        <XAxis type="number" />
                        <YAxis dataKey="servicio" type="category" width={120} />
                        <Tooltip />
                        <Bar dataKey="ganancia" name="Ganancia" fill="#10B981" />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>

                    <div className="mt-6 space-y-2">
                      {financiero.servicios.ranking.map((s, i) => (
                        <div key={s.servicio} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-stone-400' : i === 2 ? 'bg-amber-700' : 'bg-stone-300'}`}>
                              {i + 1}
                            </span>
                            <span className="font-medium">{s.servicio}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">${s.ganancia}</p>
                            <p className="text-xs text-stone-500">{s.count} servicios</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Gastos */}
        <TabsContent value="gastos" className="space-y-4">
          {financiero?.gastos && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribución de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  {financiero.gastos.desglose.length === 0 ? (
                    <p className="text-center text-stone-500 py-8">No hay gastos registrados</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <RePieChart>
                        <Pie
                          data={financiero.gastos.desglose}
                          dataKey="monto"
                          nameKey="categoria"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                        >
                          {financiero.gastos.desglose.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                      </RePieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Desglose de Gastos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-center pb-4 border-b">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-700">${financiero.gastos.fijos}</p>
                      <p className="text-xs text-stone-500">Fijos</p>
                    </div>
                    <div className="p-3 bg-violet-50 rounded-lg">
                      <p className="text-lg font-bold text-violet-700">${financiero.gastos.variables}</p>
                      <p className="text-xs text-stone-500">Variables</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-lg font-bold text-orange-700">${financiero.gastos.impuestos}</p>
                      <p className="text-xs text-stone-500">Impuestos</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {financiero.gastos.desglose.map((g, i) => (
                      <div key={g.categoria} className="flex justify-between items-center p-2 rounded hover:bg-stone-50">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span>{g.categoria}</span>
                        </div>
                        <span className="font-medium">${g.monto}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-3 bg-stone-100 rounded-lg font-bold mt-4">
                    <span>Total Gastos</span>
                    <span className="text-red-600">${financiero.gastos.total}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportesFinancierosPage;
