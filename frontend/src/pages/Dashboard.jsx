import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Palette, 
  Sparkles, 
  TrendingUp, 
  Calculator, 
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Clock,
  Loader2,
  Database
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { 
    productos, 
    estilos, 
    disenos, 
    gastos, 
    configGanancias, 
    loading, 
    seedData,
    getReporte 
  } = useApp();
  
  const [reporte, setReporte] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetchReporte = async () => {
      if (estilos.length > 0) {
        try {
          const data = await getReporte();
          setReporte(data);
        } catch (err) {
          console.error('Error fetching reporte:', err);
        }
      }
    };
    fetchReporte();
  }, [estilos, getReporte]);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await seedData();
      toast.success("Datos de ejemplo cargados correctamente");
    } catch (err) {
      toast.error("Error al cargar los datos de ejemplo");
    } finally {
      setSeeding(false);
    }
  };

  const calcGastoTotal = () => {
    if (!gastos) return 0;
    return (
      (gastos.renta || 0) + (gastos.luz || 0) + (gastos.agua || 0) +
      (gastos.internet || 0) + (gastos.telefono || 0) + (gastos.publicidad || 0) +
      (gastos.mantenimiento || 0) + (gastos.material_limpieza || 0) +
      (gastos.plataformas_pago || 0) + (gastos.impuestos || 0) + (gastos.otros || 0)
    );
  };

  const gastoPorServicio = () => {
    const total = calcGastoTotal();
    const servicios = gastos?.servicios_mes || 60;
    return servicios > 0 ? total / servicios : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="dashboard-loading">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const isEmpty = productos.length === 0 && estilos.length === 0 && disenos.length === 0;

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Bienvenida
          </h1>
          <p className="text-stone-500 mt-1">
            Tu resumen de costos y rentabilidad
          </p>
        </div>
        {isEmpty && (
          <Button 
            onClick={handleSeedData} 
            disabled={seeding}
            className="bg-stone-800 hover:bg-stone-900 text-white rounded-full px-6"
            data-testid="seed-data-btn"
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            Cargar Datos de Ejemplo
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white border-stone-100 hover:shadow-md transition-shadow duration-300" data-testid="stat-productos">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Productos</p>
                <p className="text-3xl font-semibold text-stone-800 mt-1">{productos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-100 hover:shadow-md transition-shadow duration-300" data-testid="stat-estilos">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Estilos</p>
                <p className="text-3xl font-semibold text-stone-800 mt-1">{estilos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                <Palette className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-100 hover:shadow-md transition-shadow duration-300" data-testid="stat-disenos">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Diseños</p>
                <p className="text-3xl font-semibold text-stone-800 mt-1">{disenos.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-stone-100 hover:shadow-md transition-shadow duration-300" data-testid="stat-gastos">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Gasto/Serv.</p>
                <p className="text-3xl font-semibold text-stone-800 mt-1">${gastoPorServicio().toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profit Summary */}
        <Card className="lg:col-span-2 bg-white border-stone-100" data-testid="profit-summary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Resumen de Rentabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reporte && reporte.servicios_ranking.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Rentabilidad Mensual Est.</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">
                      ${reporte.rentabilidad_mensual_estimada.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Meta Mensual</p>
                    <p className="text-2xl font-semibold text-stone-800 mt-1">
                      ${configGanancias?.meta_ingreso_mensual?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Top Services */}
                <div>
                  <h4 className="text-sm font-medium text-stone-700 mb-3">Servicios Más Rentables</h4>
                  <div className="space-y-2">
                    {reporte.servicios_ranking.slice(0, 3).map((servicio, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            idx === 0 ? 'bg-amber-100 text-amber-700' :
                            idx === 1 ? 'bg-stone-200 text-stone-600' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-medium text-stone-700">{servicio.nombre}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-stone-800">${servicio.rentabilidad_hora.toFixed(2)}/hr</p>
                          <p className="text-xs text-stone-500">{servicio.tiempo_minutos} min</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500">Agrega estilos para ver tu rentabilidad</p>
                <Link to="/estilos">
                  <Button variant="link" className="mt-2 text-stone-700">
                    Agregar Estilos <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card className="bg-white border-stone-100" data-testid="alerts-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEmpty ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-800">
                    Comienza agregando productos y estilos para calcular tus costos.
                  </p>
                </div>
              ) : gastos && calcGastoTotal() === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-800">
                    No has configurado tus gastos operativos. Esto afecta el cálculo de precios.
                  </p>
                  <Link to="/gastos">
                    <Button variant="link" className="p-0 h-auto mt-1 text-amber-700">
                      Configurar ahora <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    Todo está configurado correctamente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white border-stone-100" data-testid="quick-actions">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/calculadora" className="block">
                <Button 
                  className="w-full justify-start bg-stone-800 hover:bg-stone-900 text-white rounded-xl"
                  data-testid="quick-calc-btn"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Nueva Calculación
                </Button>
              </Link>
              <Link to="/productos" className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl border-stone-200 hover:border-stone-300"
                  data-testid="quick-product-btn"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Agregar Producto
                </Button>
              </Link>
              <Link to="/estilos" className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-xl border-stone-200 hover:border-stone-300"
                  data-testid="quick-style-btn"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Agregar Estilo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Config Summary */}
      {configGanancias && (
        <Card className="bg-white border-stone-100" data-testid="config-summary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              <Clock className="w-5 h-5 text-stone-600" />
              Tu Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-stone-50 rounded-xl text-center">
                <p className="text-xs text-stone-500">% Ganancia</p>
                <p className="text-lg font-semibold text-stone-800">{configGanancias.porcentaje_ganancia}%</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center">
                <p className="text-xs text-stone-500">Meta Mensual</p>
                <p className="text-lg font-semibold text-stone-800">${configGanancias.meta_ingreso_mensual}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center">
                <p className="text-xs text-stone-500">Meta Diaria</p>
                <p className="text-lg font-semibold text-stone-800">${configGanancias.meta_diaria}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center">
                <p className="text-xs text-stone-500">Sueldo Obj.</p>
                <p className="text-lg font-semibold text-stone-800">${configGanancias.sueldo_objetivo}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center">
                <p className="text-xs text-stone-500">$/Hora</p>
                <p className="text-lg font-semibold text-stone-800">${configGanancias.costo_hora_trabajo}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { Dashboard };
