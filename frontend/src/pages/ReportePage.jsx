import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  FileText, 
  Loader2, 
  Share2, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Award,
  Clock,
  DollarSign,
  Copy,
  Check
} from "lucide-react";
import { toast } from "sonner";

export default function ReportePage() {
  const { getReporte, loading: appLoading } = useApp();
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReporte = async () => {
      try {
        const data = await getReporte();
        setReporte(data);
      } catch (err) {
        console.error('Error fetching reporte:', err);
        toast.error("Error al cargar el reporte");
      } finally {
        setLoading(false);
      }
    };
    fetchReporte();
  }, [getReporte]);

  const handleShare = async () => {
    if (!reporte) return;

    const shareText = generateShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NailCost Pro - Reporte de Rentabilidad',
          text: shareText,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Reporte copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const generateShareText = () => {
    if (!reporte) return "";

    let text = `📊 REPORTE DE RENTABILIDAD - NailCost Pro\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📅 Fecha: ${new Date(reporte.fecha_generacion).toLocaleDateString('es-ES')}\n\n`;
    
    text += `📈 RESUMEN GENERAL\n`;
    text += `• Total Productos: ${reporte.total_productos}\n`;
    text += `• Total Estilos: ${reporte.total_estilos}\n`;
    text += `• Total Diseños: ${reporte.total_disenos}\n\n`;
    
    text += `💰 GASTOS OPERATIVOS\n`;
    text += `• Gasto Total Mensual: $${reporte.gasto_operativo_total.toFixed(2)}\n`;
    text += `• Gasto por Servicio: $${reporte.gasto_por_servicio.toFixed(2)}\n\n`;
    
    text += `🏆 SERVICIOS MÁS RENTABLES\n`;
    reporte.servicios_ranking.slice(0, 3).forEach((s, i) => {
      text += `${i + 1}. ${s.nombre}: $${s.rentabilidad_hora.toFixed(2)}/hr\n`;
    });
    
    text += `\n💵 Rentabilidad Mensual Estimada: $${reporte.rentabilidad_mensual_estimada.toFixed(2)}\n\n`;
    text += `Generado con NailCost Pro`;
    
    return text;
  };

  if (loading || appLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  if (!reporte) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <p className="text-stone-500">No se pudo cargar el reporte</p>
      </div>
    );
  }

  const topService = reporte.servicios_ranking[0];
  const bottomService = reporte.servicios_ranking[reporte.servicios_ranking.length - 1];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reporte-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Reporte de Rentabilidad
          </h1>
          <p className="text-stone-500 mt-1">
            Análisis completo de tu negocio
          </p>
        </div>
        <Button
          onClick={handleShare}
          className="bg-stone-800 hover:bg-stone-900 text-white rounded-full"
          data-testid="share-report-btn"
        >
          {copied ? (
            <Check className="w-4 h-4 mr-2" />
          ) : (
            <Share2 className="w-4 h-4 mr-2" />
          )}
          Compartir Reporte
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wider">Productos</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1" data-testid="total-productos">
              {reporte.total_productos}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wider">Estilos</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1" data-testid="total-estilos">
              {reporte.total_estilos}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <p className="text-xs text-stone-500 uppercase tracking-wider">Diseños</p>
            <p className="text-2xl font-semibold text-stone-800 mt-1" data-testid="total-disenos">
              {reporte.total_disenos}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 uppercase tracking-wider">Rentabilidad Est.</p>
            <p className="text-2xl font-semibold text-emerald-700 mt-1" data-testid="rentabilidad-mensual">
              ${reporte.rentabilidad_mensual_estimada.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking Table */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-stone-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <Award className="w-5 h-5 text-amber-500" />
                Ranking de Servicios por Rentabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {reporte.servicios_ranking.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-stone-500">No hay servicios para mostrar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-stone-100">
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase w-12">#</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase">Servicio</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Costo</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Precio</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Ganancia</TableHead>
                        <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">$/Hora</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reporte.servicios_ranking.map((servicio, idx) => (
                        <TableRow 
                          key={idx} 
                          className="border-stone-100 hover:bg-stone-50"
                          data-testid={`ranking-row-${idx}`}
                        >
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
                          <TableCell>
                            <div>
                              <p className="font-medium text-stone-800">{servicio.nombre}</p>
                              <p className="text-xs text-stone-500">{servicio.tiempo_minutos} min</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-stone-600">
                            ${servicio.costo_total.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-stone-800">
                            ${servicio.precio_recomendado.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700">
                            ${servicio.ganancia.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={
                              servicio.rentabilidad_hora >= 20 
                                ? "bg-emerald-50 text-emerald-700" 
                                : servicio.rentabilidad_hora >= 10 
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                            }>
                              ${servicio.rentabilidad_hora.toFixed(2)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Cards */}
        <div className="space-y-4">
          {/* Best Service */}
          {topService && (
            <Card className="bg-emerald-50 border-emerald-200" data-testid="best-service-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 uppercase tracking-wider font-medium">Más Rentable</p>
                    <p className="font-semibold text-emerald-800 mt-1">{topService.nombre}</p>
                    <p className="text-2xl font-bold text-emerald-700 mt-1">
                      ${topService.rentabilidad_hora.toFixed(2)}/hr
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Worst Service */}
          {bottomService && reporte.servicios_ranking.length > 1 && (
            <Card className="bg-rose-50 border-rose-200" data-testid="worst-service-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-rose-600 uppercase tracking-wider font-medium">Menos Rentable</p>
                    <p className="font-semibold text-rose-800 mt-1">{bottomService.nombre}</p>
                    <p className="text-2xl font-bold text-rose-700 mt-1">
                      ${bottomService.rentabilidad_hora.toFixed(2)}/hr
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gastos Summary */}
          <Card className="bg-white border-stone-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-stone-600">
                Gastos Operativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Total Mensual</span>
                <span className="font-semibold text-stone-800" data-testid="gasto-total-reporte">
                  ${reporte.gasto_operativo_total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Por Servicio</span>
                <span className="font-semibold text-stone-800" data-testid="gasto-servicio-reporte">
                  ${reporte.gasto_por_servicio.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Config Summary */}
          <Card className="bg-stone-800 text-white border-0">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-stone-300 uppercase tracking-wider">Tu Configuración</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-300">Margen de Ganancia</span>
                <span className="font-semibold text-white">
                  {reporte.config_ganancias.porcentaje_ganancia}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-300">Costo por Hora</span>
                <span className="font-semibold text-white">
                  ${reporte.config_ganancias.costo_hora_trabajo.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-300">Meta Mensual</span>
                <span className="font-semibold text-white">
                  ${reporte.config_ganancias.meta_ingreso_mensual.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Date */}
          <p className="text-xs text-stone-400 text-center">
            Generado el {new Date(reporte.fecha_generacion).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export { ReportePage };
