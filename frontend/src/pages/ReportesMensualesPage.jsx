import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  FileText, 
  Loader2, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ['#A16E5E', '#849686', '#D4A373', '#7CA1B3', '#E6CFA8', '#C3CDC4'];

export default function ReportesMensualesPage() {
  const { getReporteMensual, getComparativa, estilos, clientes } = useApp();
  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState(null);
  const [comparativa, setComparativa] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { anio: now.getFullYear().toString(), mes: (now.getMonth() + 1).toString().padStart(2, '0') };
  });

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reporteData, comparativaData] = await Promise.all([
        getReporteMensual(selectedMonth.anio, selectedMonth.mes),
        getComparativa()
      ]);
      setReporte(reporteData);
      setComparativa(comparativaData);
    } catch (err) {
      console.error('Error fetching report:', err);
      toast.error("Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    let newMonth = parseInt(selectedMonth.mes) + direction;
    let newYear = parseInt(selectedMonth.anio);
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setSelectedMonth({ 
      anio: newYear.toString(), 
      mes: newMonth.toString().padStart(2, '0') 
    });
  };

  const getMonthName = (mes) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[parseInt(mes) - 1];
  };

  const handleExportPDF = () => {
    // Generate PDF-like content for sharing
    const content = generateReportText();
    
    // Create a simple printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte Mensual - ${getMonthName(selectedMonth.mes)} ${selectedMonth.anio}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1C1917; border-bottom: 2px solid #A16E5E; padding-bottom: 10px; }
            h2 { color: #78716C; margin-top: 30px; }
            .stat { display: inline-block; margin: 10px 20px 10px 0; padding: 15px; background: #F5F5F4; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #78716C; }
            .stat-value { font-size: 24px; font-weight: bold; color: #1C1917; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #E7E5E4; }
            th { background: #F5F5F4; font-weight: 600; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E7E5E4; font-size: 12px; color: #78716C; }
          </style>
        </head>
        <body>
          <h1>Reporte Mensual - NailCost Pro</h1>
          <p><strong>Período:</strong> ${getMonthName(selectedMonth.mes)} ${selectedMonth.anio}</p>
          
          <h2>Resumen General</h2>
          <div class="stat">
            <div class="stat-label">Total Servicios</div>
            <div class="stat-value">${reporte?.total_servicios || 0}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Ingresos</div>
            <div class="stat-value">$${reporte?.total_ingresos?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Ganancia Neta</div>
            <div class="stat-value">$${reporte?.ganancia_neta?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Clientes Atendidos</div>
            <div class="stat-value">${reporte?.clientes_atendidos || 0}</div>
          </div>
          
          <h2>Desglose por Servicio</h2>
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Cantidad</th>
                <th>Ingresos</th>
                <th>Ganancia</th>
              </tr>
            </thead>
            <tbody>
              ${reporte?.estilos?.map(e => `
                <tr>
                  <td>${e.nombre}</td>
                  <td>${e.cantidad}</td>
                  <td>$${e.ingresos.toFixed(2)}</td>
                  <td>$${e.ganancia.toFixed(2)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="footer">
            Generado con NailCost Pro - ${new Date().toLocaleDateString('es-ES')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    toast.success("Reporte listo para imprimir/guardar como PDF");
  };

  const handleExportExcel = () => {
    if (!reporte) return;

    // Generate CSV content
    let csv = "Reporte Mensual - NailCost Pro\n";
    csv += `Período: ${getMonthName(selectedMonth.mes)} ${selectedMonth.anio}\n\n`;
    csv += "RESUMEN GENERAL\n";
    csv += `Total Servicios,${reporte.total_servicios}\n`;
    csv += `Total Ingresos,$${reporte.total_ingresos}\n`;
    csv += `Total Costos,$${reporte.total_costos}\n`;
    csv += `Ganancia Neta,$${reporte.ganancia_neta}\n`;
    csv += `Clientes Atendidos,${reporte.clientes_atendidos}\n\n`;
    
    csv += "DESGLOSE POR SERVICIO\n";
    csv += "Servicio,Cantidad,Ingresos,Costos,Ganancia\n";
    reporte.estilos?.forEach(e => {
      csv += `${e.nombre},${e.cantidad},$${e.ingresos},$${e.costos},$${e.ganancia}\n`;
    });
    
    csv += "\nDESGLOSE DIARIO\n";
    csv += "Fecha,Servicios,Ingresos\n";
    reporte.por_dia?.forEach(d => {
      csv += `${d.fecha},${d.servicios},$${d.ingresos}\n`;
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${selectedMonth.anio}_${selectedMonth.mes}.csv`;
    link.click();
    toast.success("Excel descargado");
  };

  const generateReportText = () => {
    if (!reporte) return "";
    return `Reporte ${getMonthName(selectedMonth.mes)} ${selectedMonth.anio}: ${reporte.total_servicios} servicios, $${reporte.total_ingresos} ingresos, $${reporte.ganancia_neta} ganancia neta`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="reportes-mensuales-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Reportes Mensuales
          </h1>
          <p className="text-stone-500 mt-1">
            Análisis detallado de tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="rounded-full"
            data-testid="export-pdf-btn"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="rounded-full"
            data-testid="export-excel-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <Card className="bg-white border-stone-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center min-w-[200px]">
              <p className="text-xl font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                {getMonthName(selectedMonth.mes)} {selectedMonth.anio}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)} className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">{reporte?.total_servicios || 0}</p>
                <p className="text-xs text-stone-500">Servicios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">${reporte?.total_ingresos?.toFixed(0) || 0}</p>
                <p className="text-xs text-stone-500">Ingresos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-emerald-700">${reporte?.ganancia_neta?.toFixed(0) || 0}</p>
                <p className="text-xs text-emerald-600">Ganancia Neta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">{reporte?.clientes_atendidos || 0}</p>
                <p className="text-xs text-stone-500">Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Income Chart */}
        <Card className="bg-white border-stone-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ingresos Diarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reporte?.por_dia?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reporte.por_dia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => val.split('-')[2]}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Ingresos']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5E4' }}
                  />
                  <Bar dataKey="ingresos" fill="#A16E5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-stone-400">
                No hay datos para este mes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Distribution */}
        <Card className="bg-white border-stone-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              Distribución por Servicio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reporte?.estilos?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reporte.estilos}
                    dataKey="cantidad"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {reporte.estilos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [value, props.payload.nombre]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5E4' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-stone-400">
                No hay datos para este mes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparativa Chart */}
      {comparativa?.meses?.length > 0 && (
        <Card className="bg-white border-stone-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
              Comparativa Mensual (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comparativa.meses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis 
                  dataKey="periodo" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => {
                    const [y, m] = val.split('-');
                    return getMonthName(m).substring(0, 3);
                  }}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value, name) => [`$${value}`, name === 'ingresos' ? 'Ingresos' : 'Ganancia']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E7E5E4' }}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#A16E5E" strokeWidth={2} dot={{ fill: '#A16E5E' }} />
                <Line type="monotone" dataKey="ganancia" stroke="#849686" strokeWidth={2} dot={{ fill: '#849686' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Services Table */}
      <Card className="bg-white border-stone-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
            Detalle por Servicio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reporte?.estilos?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-stone-100">
                  <TableHead className="text-xs font-semibold text-stone-500 uppercase">Servicio</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-500 uppercase text-center">Cantidad</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Ingresos</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Costos</TableHead>
                  <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Ganancia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporte.estilos.map((estilo, idx) => (
                  <TableRow key={idx} className="border-stone-100">
                    <TableCell className="font-medium">{estilo.nombre}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-stone-100">{estilo.cantidad}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${estilo.ingresos.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-stone-500">${estilo.costos.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700">
                      ${estilo.ganancia.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-stone-400">
              No hay servicios registrados este mes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { ReportesMensualesPage };
