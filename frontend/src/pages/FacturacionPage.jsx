import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, Plus, Search, Download, Eye, Printer, Calendar, User, DollarSign, Loader2,
  CheckCircle, Clock, XCircle, Hash, Building2, Phone, Mail, Receipt, BarChart3,
  TrendingUp, AlertTriangle, FileDown, Settings
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// IVA Venezuela 2025
const IVA_RATE = 0.16; // 16%

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    pagada: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagada' },
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
    anulada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulada' },
  };
  const s = styles[status] || styles.pendiente;
  return <span className={`px-2 py-1 rounded text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>;
};

// Generate Venezuelan Fiscal Invoice PDF
const generateFacturaFiscalVE = (factura, negocio, config) => {
  const baseImponible = factura.subtotal - (factura.descuento || 0);
  const montoIVA = config.aplicaIVA ? baseImponible * IVA_RATE : 0;
  const totalConIVA = baseImponible + montoIVA;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Factura ${factura.numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Arial', sans-serif; padding: 30px; color: #1f2937; font-size: 12px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1f2937; padding-bottom: 15px; margin-bottom: 20px; }
    .empresa { max-width: 60%; }
    .empresa-nombre { font-size: 18px; font-weight: bold; color: #1f2937; }
    .empresa-rif { font-size: 14px; font-weight: bold; color: #dc2626; margin-top: 5px; }
    .empresa-datos { color: #6b7280; margin-top: 8px; line-height: 1.5; }
    .factura-info { text-align: right; }
    .factura-titulo { font-size: 16px; font-weight: bold; color: #1f2937; background: #f3f4f6; padding: 8px 15px; border-radius: 4px; }
    .factura-numero { font-size: 14px; font-weight: bold; color: #dc2626; margin-top: 8px; }
    .control { font-size: 11px; color: #6b7280; margin-top: 5px; }
    .cliente-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
    .cliente-titulo { font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 8px; }
    .cliente-nombre { font-size: 14px; font-weight: 600; }
    .cliente-rif { color: #dc2626; font-weight: 600; margin-top: 3px; }
    .cliente-datos { color: #6b7280; margin-top: 5px; line-height: 1.5; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .items-table th { background: #1f2937; color: white; padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
    .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .items-table .right { text-align: right; }
    .totales { display: flex; justify-content: flex-end; }
    .totales-box { width: 280px; background: #f9fafb; border-radius: 6px; padding: 15px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
    .total-row.subtotal { border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 5px; }
    .total-row.iva { color: #dc2626; }
    .total-row.final { border-top: 2px solid #1f2937; margin-top: 10px; padding-top: 12px; font-size: 16px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
    .legal { font-size: 10px; color: #6b7280; text-align: center; line-height: 1.6; }
    .legal strong { color: #1f2937; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .status-pagada { background: #d1fae5; color: #065f46; }
    .status-pendiente { background: #fef3c7; color: #92400e; }
    .metodo-pago { background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 4px; font-size: 11px; margin-top: 10px; display: inline-block; }
    @media print { body { padding: 15px; } @page { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="empresa">
      <div class="empresa-nombre">${config.nombreEmpresa || negocio.nombre_negocio || negocio.nombre}</div>
      ${config.rif ? `<div class="empresa-rif">RIF: ${config.rif}</div>` : ''}
      <div class="empresa-datos">
        ${config.direccion ? `${config.direccion}<br>` : ''}
        ${negocio.telefono ? `Tel: ${negocio.telefono}<br>` : ''}
        ${negocio.email ? `Email: ${negocio.email}` : ''}
      </div>
    </div>
    <div class="factura-info">
      <div class="factura-titulo">FACTURA</div>
      <div class="factura-numero">N° ${factura.numero}</div>
      <div class="control">Control: ${factura.numero_control || factura.numero}</div>
      <div class="control">Fecha: ${new Date(factura.fecha).toLocaleDateString('es-VE')}</div>
      <div class="control">Hora: ${new Date(factura.fecha).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</div>
      <span class="status-badge status-${factura.estado}">${factura.estado.toUpperCase()}</span>
    </div>
  </div>

  <div class="cliente-box">
    <div class="cliente-titulo">Datos del Cliente</div>
    <div class="cliente-nombre">${factura.cliente_nombre}</div>
    ${factura.cliente_rif ? `<div class="cliente-rif">RIF/CI: ${factura.cliente_rif}</div>` : ''}
    <div class="cliente-datos">
      ${factura.cliente_direccion ? `${factura.cliente_direccion}<br>` : ''}
      ${factura.cliente_telefono ? `Tel: ${factura.cliente_telefono}` : ''}
      ${factura.cliente_email ? ` | ${factura.cliente_email}` : ''}
    </div>
    <div class="metodo-pago">Forma de Pago: ${factura.metodo_pago?.replace('_', ' ').toUpperCase() || 'EFECTIVO'}</div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%">Descripción</th>
        <th class="right">Cant.</th>
        <th class="right">Precio Unit.</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${factura.items.map(item => `
        <tr>
          <td>${item.descripcion}</td>
          <td class="right">${item.cantidad}</td>
          <td class="right">$${item.precio_unitario.toFixed(2)}</td>
          <td class="right">$${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totales">
    <div class="totales-box">
      <div class="total-row subtotal">
        <span>Subtotal</span>
        <span>$${factura.subtotal.toFixed(2)}</span>
      </div>
      ${factura.descuento > 0 ? `
      <div class="total-row">
        <span>Descuento</span>
        <span>-$${factura.descuento.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row">
        <span>Base Imponible</span>
        <span>$${baseImponible.toFixed(2)}</span>
      </div>
      ${config.aplicaIVA ? `
      <div class="total-row iva">
        <span>IVA (16%)</span>
        <span>$${montoIVA.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row final">
        <span>TOTAL</span>
        <span>$${totalConIVA.toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${factura.notas ? `<div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 4px; font-size: 11px;"><strong>Notas:</strong> ${factura.notas}</div>` : ''}

  <div class="footer">
    <div class="legal">
      ${config.aplicaIVA ? `<strong>Contribuyente Formal</strong> | Alícuota IVA: 16%<br>` : ''}
      Documento generado conforme a la normativa fiscal vigente.<br>
      ${config.rif ? `RIF: ${config.rif} | ` : ''}Fecha de emisión: ${new Date().toLocaleDateString('es-VE')}
    </div>
  </div>
</body>
</html>`;
};

// Generate Monthly Report
const generateReporteMensual = (facturas, mes, config) => {
  const facturasDelMes = facturas.filter(f => f.fecha?.startsWith(mes));
  const pagadas = facturasDelMes.filter(f => f.estado === 'pagada');
  const pendientes = facturasDelMes.filter(f => f.estado === 'pendiente');
  
  const totalFacturado = facturasDelMes.reduce((sum, f) => sum + (f.total || 0), 0);
  const totalCobrado = pagadas.reduce((sum, f) => sum + (f.total || 0), 0);
  const totalPendiente = pendientes.reduce((sum, f) => sum + (f.total || 0), 0);
  
  const baseImponible = totalFacturado;
  const ivaGenerado = config.aplicaIVA ? baseImponible * IVA_RATE : 0;
  
  // Group by payment method
  const porMetodo = {};
  facturasDelMes.forEach(f => {
    const metodo = f.metodo_pago || 'efectivo';
    if (!porMetodo[metodo]) porMetodo[metodo] = { count: 0, total: 0 };
    porMetodo[metodo].count++;
    porMetodo[metodo].total += f.total || 0;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Reporte Fiscal ${mes}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 30px; color: #1f2937; font-size: 12px; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1f2937; }
    .titulo { font-size: 20px; font-weight: bold; }
    .subtitulo { color: #6b7280; margin-top: 5px; }
    .periodo { background: #1f2937; color: white; padding: 8px 20px; border-radius: 4px; display: inline-block; margin-top: 10px; }
    .empresa-info { margin-top: 10px; }
    .empresa-rif { color: #dc2626; font-weight: bold; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; background: #f3f4f6; padding: 10px; margin-bottom: 10px; border-left: 4px solid #1f2937; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
    .stat-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; text-align: center; }
    .stat-value { font-size: 20px; font-weight: bold; color: #1f2937; }
    .stat-value.success { color: #059669; }
    .stat-value.warning { color: #d97706; }
    .stat-value.danger { color: #dc2626; }
    .stat-label { font-size: 11px; color: #6b7280; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1f2937; color: white; padding: 10px; text-align: left; font-size: 11px; }
    td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .right { text-align: right; }
    .fiscal-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 20px; }
    .fiscal-title { font-weight: bold; color: #92400e; margin-bottom: 10px; }
    .fiscal-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .fiscal-row.total { border-top: 2px solid #92400e; margin-top: 10px; padding-top: 10px; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #6b7280; }
    @media print { @page { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="titulo">REPORTE DE FACTURACIÓN MENSUAL</div>
    <div class="subtitulo">Resumen Contable y Fiscal</div>
    <div class="periodo">Período: ${mes}</div>
    <div class="empresa-info">
      ${config.nombreEmpresa || 'Mi Negocio'}
      ${config.rif ? `<span class="empresa-rif"> | RIF: ${config.rif}</span>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">RESUMEN GENERAL</div>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${facturasDelMes.length}</div>
        <div class="stat-label">Facturas Emitidas</div>
      </div>
      <div class="stat-box">
        <div class="stat-value success">$${totalCobrado.toFixed(2)}</div>
        <div class="stat-label">Total Cobrado</div>
      </div>
      <div class="stat-box">
        <div class="stat-value warning">$${totalPendiente.toFixed(2)}</div>
        <div class="stat-label">Pendiente Cobro</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">$${totalFacturado.toFixed(2)}</div>
        <div class="stat-label">Total Facturado</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DETALLE POR MÉTODO DE PAGO</div>
    <table>
      <thead>
        <tr>
          <th>Método de Pago</th>
          <th class="right">Cantidad</th>
          <th class="right">Monto Total</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(porMetodo).map(([metodo, data]) => `
          <tr>
            <td>${metodo.replace('_', ' ').toUpperCase()}</td>
            <td class="right">${data.count}</td>
            <td class="right">$${data.total.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">LISTADO DE FACTURAS</div>
    <table>
      <thead>
        <tr>
          <th>N° Factura</th>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Método</th>
          <th class="right">Monto</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        ${facturasDelMes.map(f => `
          <tr>
            <td>${f.numero}</td>
            <td>${new Date(f.fecha).toLocaleDateString('es-VE')}</td>
            <td>${f.cliente_nombre}</td>
            <td>${(f.metodo_pago || 'efectivo').replace('_', ' ')}</td>
            <td class="right">$${(f.total || 0).toFixed(2)}</td>
            <td><span style="color: ${f.estado === 'pagada' ? '#059669' : f.estado === 'pendiente' ? '#d97706' : '#dc2626'}">${f.estado}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  ${config.aplicaIVA ? `
  <div class="fiscal-box">
    <div class="fiscal-title">RESUMEN FISCAL - IVA</div>
    <div class="fiscal-row">
      <span>Base Imponible (Ventas Gravadas)</span>
      <span>$${baseImponible.toFixed(2)}</span>
    </div>
    <div class="fiscal-row">
      <span>IVA Débito Fiscal (16%)</span>
      <span>$${ivaGenerado.toFixed(2)}</span>
    </div>
    <div class="fiscal-row total">
      <span>Total con IVA</span>
      <span>$${(baseImponible + ivaGenerado).toFixed(2)}</span>
    </div>
    <p style="font-size: 10px; color: #92400e; margin-top: 10px;">
      * Este reporte es un resumen contable. Para declaraciones oficiales, consulte con su contador.
    </p>
  </div>
  ` : ''}

  <div class="footer">
    Generado el ${new Date().toLocaleDateString('es-VE')} a las ${new Date().toLocaleTimeString('es-VE')}<br>
    Sistema NailCost Business | Reporte para fines contables
  </div>
</body>
</html>`;
};

export default function FacturacionPage() {
  const { user } = useAuth();
  const { clientes } = useApp();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("facturas");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [reporteDialog, setReporteDialog] = useState(false);
  const [selectedMes, setSelectedMes] = useState(new Date().toISOString().slice(0, 7));
  
  // Config fiscal Venezuela
  const [configFiscal, setConfigFiscal] = useState(() => {
    const saved = localStorage.getItem('nailcost_config_fiscal');
    return saved ? JSON.parse(saved) : {
      nombreEmpresa: user?.nombre_negocio || '',
      rif: '',
      direccion: '',
      aplicaIVA: false,
    };
  });

  const [formData, setFormData] = useState({
    cliente_id: "", cliente_rif: "", cliente_direccion: "",
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
    metodo_pago: "efectivo", descuento: 0, notas: "",
  });

  useEffect(() => { fetchFacturas(); }, []);

  useEffect(() => {
    localStorage.setItem('nailcost_config_fiscal', JSON.stringify(configFiscal));
  }, [configFiscal]);

  const fetchFacturas = async () => {
    try {
      const res = await authAxios.get(`${API}/facturas`);
      setFacturas(res.data);
    } catch (err) {
      toast.error("Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === formData.cliente_id);
    if (!cliente) { toast.error("Selecciona un cliente"); return; }

    const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    const baseImponible = subtotal - formData.descuento;
    const iva = configFiscal.aplicaIVA ? baseImponible * IVA_RATE : 0;
    const total = baseImponible + iva;

    try {
      await authAxios.post(`${API}/facturas`, {
        ...formData,
        cliente_nombre: cliente.nombre,
        cliente_telefono: cliente.telefono,
        cliente_email: cliente.email,
        cliente_rif: formData.cliente_rif,
        cliente_direccion: formData.cliente_direccion,
        subtotal, total, iva_monto: iva,
        estado: "pendiente",
      });
      toast.success("Factura creada");
      fetchFacturas();
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Error al crear factura");
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: "", cliente_rif: "", cliente_direccion: "",
      items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
      metodo_pago: "efectivo", descuento: 0, notas: "",
    });
  };

  const addItem = () => setFormData(prev => ({ ...prev, items: [...prev.items, { descripcion: "", cantidad: 1, precio_unitario: 0 }] }));
  const removeItem = (index) => setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const handleChangeStatus = async (factura, newStatus) => {
    try {
      await authAxios.put(`${API}/facturas/${factura.id}/estado`, { estado: newStatus });
      setFacturas(prev => prev.map(f => f.id === factura.id ? { ...f, estado: newStatus } : f));
      toast.success(`Factura marcada como ${newStatus}`);
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  const handlePrint = (factura) => {
    const content = generateFacturaFiscalVE(factura, user, configFiscal);
    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
    win.print();
  };

  const handleDownload = (factura) => {
    const content = generateFacturaFiscalVE(factura, user, configFiscal);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Factura_${factura.numero}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReporte = () => {
    const content = generateReporteMensual(facturas, selectedMes, configFiscal);
    const win = window.open('', '_blank');
    win.document.write(content);
    win.document.close();
  };

  const handleDownloadReporte = () => {
    const content = generateReporteMensual(facturas, selectedMes, configFiscal);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Fiscal_${selectedMes}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const baseImponible = subtotal - formData.descuento;
  const ivaCalculado = configFiscal.aplicaIVA ? baseImponible * IVA_RATE : 0;
  const totalCalculado = baseImponible + ivaCalculado;

  const filteredFacturas = facturas.filter(f => {
    const matchSearch = f.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || f.numero?.includes(searchTerm);
    const matchStatus = filterStatus === "all" || f.estado === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const currentMonth = new Date().toISOString().slice(0, 7);
  const facturasDelMes = facturas.filter(f => f.fecha?.startsWith(currentMonth));
  const totalMes = facturasDelMes.reduce((sum, f) => sum + (f.total || 0), 0);
  const cobradoMes = facturasDelMes.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + (f.total || 0), 0);
  const pendienteMes = facturasDelMes.filter(f => f.estado === 'pendiente').reduce((sum, f) => sum + (f.total || 0), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="facturacion-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Facturación</h1>
            <p className="text-sm text-slate-500">{configFiscal.aplicaIVA ? 'IVA 16% Activo' : 'Sin IVA'} • {facturas.length} facturas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConfigDialog(true)} className="gap-2">
            <Settings className="w-4 h-4" />Config. Fiscal
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="w-4 h-4" />Nueva Factura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <FileText className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{facturasDelMes.length}</p>
          <p className="text-sm text-slate-500">Facturas del Mes</p>
        </CardContent></Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white"><CardContent className="p-4">
          <DollarSign className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold text-emerald-600">${cobradoMes.toFixed(2)}</p>
          <p className="text-sm text-slate-500">Cobrado</p>
        </CardContent></Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white"><CardContent className="p-4">
          <Clock className="w-6 h-6 text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-amber-600">${pendienteMes.toFixed(2)}</p>
          <p className="text-sm text-slate-500">Pendiente</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <TrendingUp className="w-6 h-6 text-violet-500 mb-2" />
          <p className="text-2xl font-bold">${totalMes.toFixed(2)}</p>
          <p className="text-sm text-slate-500">Total Facturado</p>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="facturas" className="gap-2"><FileText className="w-4 h-4" />Facturas</TabsTrigger>
          <TabsTrigger value="reportes" className="gap-2"><BarChart3 className="w-4 h-4" />Reportes Fiscales</TabsTrigger>
        </TabsList>

        {/* Facturas Tab */}
        <TabsContent value="facturas" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="Buscar por cliente o número..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pagada">Pagadas</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="anulada">Anuladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredFacturas.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No hay facturas</p>
              </div>
            ) : filteredFacturas.map(factura => (
              <Card key={factura.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Hash className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">#{factura.numero}</span>
                          <StatusBadge status={factura.estado} />
                        </div>
                        <p className="text-sm text-slate-500">{factura.cliente_nombre}</p>
                        <p className="text-xs text-slate-400">{new Date(factura.fecha).toLocaleDateString('es-VE')} • {factura.metodo_pago?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-slate-800">${factura.total?.toFixed(2)}</p>
                        {factura.iva_monto > 0 && <p className="text-xs text-red-500">IVA: ${factura.iva_monto?.toFixed(2)}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handlePrint(factura)} title="Imprimir"><Printer className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(factura)} title="Descargar"><Download className="w-4 h-4" /></Button>
                        {factura.estado === 'pendiente' && (
                          <Button size="sm" variant="ghost" onClick={() => handleChangeStatus(factura, 'pagada')} className="text-emerald-600" title="Marcar pagada">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reportes Tab */}
        <TabsContent value="reportes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Generar Reporte Fiscal Mensual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                Genera un reporte contable con el resumen de facturación del mes, incluyendo desglose de IVA para declaraciones fiscales.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Seleccionar Mes</Label>
                  <Input type="month" value={selectedMes} onChange={(e) => setSelectedMes(e.target.value)} className="mt-1" />
                </div>
                <div className="flex gap-2 pt-6">
                  <Button onClick={handleGenerateReporte} className="gap-2"><Eye className="w-4 h-4" />Ver Reporte</Button>
                  <Button variant="outline" onClick={handleDownloadReporte} className="gap-2"><FileDown className="w-4 h-4" />Descargar</Button>
                </div>
              </div>
              
              {configFiscal.aplicaIVA && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Información Fiscal</p>
                      <p className="text-amber-700 mt-1">
                        El reporte incluye el desglose de IVA (16%) según la normativa SENIAT. Para declaraciones oficiales, consulte con su contador.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5" />Nueva Factura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label>Cliente *</Label>
                <Select value={formData.cliente_id} onValueChange={(v) => setFormData(prev => ({ ...prev, cliente_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                  <SelectContent>
                    {clientes.map(c => <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>RIF / CI del Cliente</Label>
                <Input value={formData.cliente_rif} onChange={(e) => setFormData(prev => ({ ...prev, cliente_rif: e.target.value }))} placeholder="V-12345678 o J-12345678-9" />
              </div>
            </div>

            <div>
              <Label>Dirección del Cliente</Label>
              <Input value={formData.cliente_direccion} onChange={(e) => setFormData(prev => ({ ...prev, cliente_direccion: e.target.value }))} placeholder="Dirección fiscal" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Servicios / Productos</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>+ Agregar</Button>
              </div>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input placeholder="Descripción" value={item.descripcion} onChange={(e) => updateItem(index, 'descripcion', e.target.value)} className="flex-1" />
                    <Input type="number" min="1" value={item.cantidad} onChange={(e) => updateItem(index, 'cantidad', parseInt(e.target.value) || 1)} className="w-20" />
                    <Input type="number" min="0" step="0.01" value={item.precio_unitario} onChange={(e) => updateItem(index, 'precio_unitario', parseFloat(e.target.value) || 0)} className="w-24" placeholder="$" />
                    {formData.items.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500"><XCircle className="w-4 h-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Método de Pago</Label>
                <Select value={formData.metodo_pago} onValueChange={(v) => setFormData(prev => ({ ...prev, metodo_pago: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descuento ($)</Label>
                <Input type="number" min="0" step="0.01" value={formData.descuento} onChange={(e) => setFormData(prev => ({ ...prev, descuento: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>

            <div>
              <Label>Notas</Label>
              <Input value={formData.notas} onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))} placeholder="Observaciones adicionales" />
            </div>

            {/* Totals */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {formData.descuento > 0 && <div className="flex justify-between text-red-600"><span>Descuento</span><span>-${formData.descuento.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span>Base Imponible</span><span>${baseImponible.toFixed(2)}</span></div>
              {configFiscal.aplicaIVA && <div className="flex justify-between text-red-600"><span>IVA (16%)</span><span>${ivaCalculado.toFixed(2)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>TOTAL</span><span>${totalCalculado.toFixed(2)}</span></div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">Crear Factura</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={configDialog} onOpenChange={setConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Configuración Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nombre de la Empresa</Label>
              <Input value={configFiscal.nombreEmpresa} onChange={(e) => setConfigFiscal(prev => ({ ...prev, nombreEmpresa: e.target.value }))} placeholder="Mi Salón de Uñas C.A." />
            </div>
            <div>
              <Label>RIF</Label>
              <Input value={configFiscal.rif} onChange={(e) => setConfigFiscal(prev => ({ ...prev, rif: e.target.value }))} placeholder="J-12345678-9" />
            </div>
            <div>
              <Label>Dirección Fiscal</Label>
              <Input value={configFiscal.direccion} onChange={(e) => setConfigFiscal(prev => ({ ...prev, direccion: e.target.value }))} placeholder="Av. Principal, Local 5, Caracas" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium">Aplicar IVA (16%)</p>
                <p className="text-sm text-slate-500">Incluir impuesto en facturas</p>
              </div>
              <input type="checkbox" checked={configFiscal.aplicaIVA} onChange={(e) => setConfigFiscal(prev => ({ ...prev, aplicaIVA: e.target.checked }))} className="w-5 h-5" />
            </div>
            {configFiscal.aplicaIVA && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <strong>Nota:</strong> Al activar IVA, las facturas incluirán el 16% según normativa SENIAT Venezuela 2025.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => { setConfigDialog(false); toast.success("Configuración guardada"); }}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { FacturacionPage };
