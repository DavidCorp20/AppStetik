import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Eye,
  Printer,
  Calendar,
  User,
  DollarSign,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Hash,
  Building2,
  Phone,
  Mail
} from "lucide-react";
import { toast } from "sonner";

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    pagada: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Pagada' },
    pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
    anulada: { bg: 'bg-red-100', text: 'text-red-700', label: 'Anulada' },
  };
  const s = styles[status] || styles.pendiente;
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
};

// Generate PDF content
const generateInvoicePDF = (factura, negocio) => {
  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Factura ${factura.numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
    .logo { font-size: 24px; font-weight: bold; color: #1f2937; }
    .logo span { color: #3b82f6; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 20px; font-weight: bold; color: #3b82f6; }
    .invoice-date { color: #6b7280; margin-top: 5px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 45%; }
    .party-title { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 10px; font-weight: 600; }
    .party-name { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
    .party-detail { font-size: 14px; color: #6b7280; line-height: 1.6; }
    .items { margin-bottom: 40px; }
    .items table { width: 100%; border-collapse: collapse; }
    .items th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
    .items td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .items .amount { text-align: right; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-box { width: 300px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.final { border-top: 2px solid #1f2937; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: bold; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: 600; margin-top: 10px; }
    .status.pagada { background: #d1fae5; color: #065f46; }
    .status.pendiente { background: #fef3c7; color: #92400e; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">NailCost <span>Business</span></div>
      <p style="color: #6b7280; margin-top: 5px;">${negocio.nombre_negocio || negocio.nombre}</p>
      ${negocio.telefono ? `<p style="color: #6b7280; font-size: 14px;">${negocio.telefono}</p>` : ''}
      ${negocio.email ? `<p style="color: #6b7280; font-size: 14px;">${negocio.email}</p>` : ''}
    </div>
    <div class="invoice-info">
      <div class="invoice-number">FACTURA #${factura.numero}</div>
      <div class="invoice-date">Fecha: ${new Date(factura.fecha).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
      <div class="status ${factura.estado}">${factura.estado.toUpperCase()}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-title">Facturado a</div>
      <div class="party-name">${factura.cliente_nombre}</div>
      <div class="party-detail">
        ${factura.cliente_telefono ? `Tel: ${factura.cliente_telefono}<br>` : ''}
        ${factura.cliente_email ? `Email: ${factura.cliente_email}` : ''}
      </div>
    </div>
    <div class="party" style="text-align: right;">
      <div class="party-title">Detalles</div>
      <div class="party-detail">
        Método de pago: ${factura.metodo_pago || 'Efectivo'}<br>
        ${factura.notas ? `Notas: ${factura.notas}` : ''}
      </div>
    </div>
  </div>

  <div class="items">
    <table>
      <thead>
        <tr>
          <th>Descripción</th>
          <th>Cant.</th>
          <th class="amount">Precio Unit.</th>
          <th class="amount">Total</th>
        </tr>
      </thead>
      <tbody>
        ${factura.items.map(item => `
          <tr>
            <td>${item.descripcion}</td>
            <td>${item.cantidad}</td>
            <td class="amount">$${item.precio_unitario.toFixed(2)}</td>
            <td class="amount">$${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="totals">
    <div class="totals-box">
      <div class="total-row">
        <span>Subtotal</span>
        <span>$${factura.subtotal.toFixed(2)}</span>
      </div>
      ${factura.descuento > 0 ? `
      <div class="total-row">
        <span>Descuento</span>
        <span>-$${factura.descuento.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row final">
        <span>TOTAL</span>
        <span>$${factura.total.toFixed(2)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Gracias por su preferencia</p>
    <p style="margin-top: 5px;">Documento generado por NailCost Business</p>
  </div>
</body>
</html>`;

  return content;
};

export default function FacturacionPage() {
  const { user } = useAuth();
  const { clientes, estilos } = useApp();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewFactura, setPreviewFactura] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: "",
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
    metodo_pago: "efectivo",
    descuento: 0,
    notas: "",
  });

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/facturas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setFacturas(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('nailcost_token');

    const cliente = clientes.find(c => c.id === formData.cliente_id);
    const subtotal = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    const total = subtotal - (formData.descuento || 0);

    const facturaData = {
      cliente_id: formData.cliente_id,
      cliente_nombre: cliente?.nombre || 'Cliente',
      cliente_telefono: cliente?.telefono || '',
      cliente_email: cliente?.email || '',
      items: formData.items.filter(i => i.descripcion && i.precio_unitario > 0),
      subtotal,
      descuento: formData.descuento || 0,
      total,
      metodo_pago: formData.metodo_pago,
      notas: formData.notas,
      estado: 'pendiente'
    };

    try {
      const res = await fetch(`${API}/facturas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(facturaData)
      });

      if (res.ok) {
        toast.success("Factura creada");
        fetchFacturas();
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error("Error al crear factura");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_id: "",
      items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
      metodo_pago: "efectivo",
      descuento: 0,
      notas: "",
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { descripcion: "", cantidad: 1, precio_unitario: 0 }]
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateStatus = async (facturaId, newStatus) => {
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/facturas/${facturaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado: newStatus })
      });
      if (res.ok) {
        toast.success(`Factura marcada como ${newStatus}`);
        fetchFacturas();
      }
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  const printInvoice = (factura) => {
    const content = generateInvoicePDF(factura, user);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadInvoice = (factura) => {
    const content = generateInvoicePDF(factura, user);
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factura_${factura.numero}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Factura descargada");
  };

  const filteredFacturas = facturas.filter(f => {
    const matchesSearch = f.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.numero?.toString().includes(searchTerm);
    const matchesStatus = filterStatus === "all" || f.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const subtotalForm = formData.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  const totalForm = subtotalForm - (formData.descuento || 0);

  // Stats
  const totalFacturado = facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0);
  const pendientes = facturas.filter(f => f.estado === 'pendiente').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="facturacion-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Facturación</h1>
          <p className="text-sm text-gray-500">Gestiona tus facturas y recibos</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{facturas.length}</p>
                <p className="text-xs text-gray-500">Total facturas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">${totalFacturado.toFixed(0)}</p>
                <p className="text-xs text-gray-500">Facturado (pagado)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{pendientes}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{new Date().toLocaleDateString('es-VE', { month: 'short' })}</p>
                <p className="text-xs text-gray-500">Mes actual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente o número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px] border-gray-200">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pagada">Pagadas</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="anulada">Anuladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card className="border-gray-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Nº</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Cliente</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Fecha</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Total</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.map((factura) => (
                  <tr key={factura.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-900">#{factura.numero}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{factura.cliente_nombre}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(factura.fecha).toLocaleDateString('es-VE')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">${factura.total.toFixed(2)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={factura.estado} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => printInvoice(factura)} className="h-8 px-2">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => downloadInvoice(factura)} className="h-8 px-2">
                          <Download className="w-4 h-4" />
                        </Button>
                        {factura.estado === 'pendiente' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => updateStatus(factura.id, 'pagada')}
                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredFacturas.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay facturas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Factura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={formData.cliente_id} onValueChange={(v) => setFormData(prev => ({ ...prev, cliente_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Servicios / Productos</Label>
              {formData.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Descripción"
                    value={item.descripcion}
                    onChange={(e) => updateItem(i, 'descripcion', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Cant"
                    value={item.cantidad}
                    onChange={(e) => updateItem(i, 'cantidad', parseInt(e.target.value) || 1)}
                    className="w-16"
                  />
                  <Input
                    type="number"
                    placeholder="Precio"
                    value={item.precio_unitario}
                    onChange={(e) => updateItem(i, 'precio_unitario', parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  {formData.items.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                      <XCircle className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> Agregar item
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Método de pago</Label>
                <Select value={formData.metodo_pago} onValueChange={(v) => setFormData(prev => ({ ...prev, metodo_pago: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="pago_movil">Pago Móvil</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Descuento ($)</Label>
                <Input
                  type="number"
                  value={formData.descuento}
                  onChange={(e) => setFormData(prev => ({ ...prev, descuento: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas</Label>
              <Input
                value={formData.notas}
                onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${subtotalForm.toFixed(2)}</span>
              </div>
              {formData.descuento > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="font-medium text-red-500">-${formData.descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>${totalForm.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                Crear Factura
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { FacturacionPage };
