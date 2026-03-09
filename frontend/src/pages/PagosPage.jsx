import { useState, useEffect, useCallback } from 'react';
import { useAuth, authAxios } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  CreditCard, Smartphone, Building, Bitcoin, Banknote, Mail, Upload, 
  CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp, Copy,
  AlertCircle, FileImage
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = {
  smartphone: Smartphone,
  building: Building,
  bitcoin: Bitcoin,
  banknote: Banknote,
  mail: Mail,
};

const STATUS_STYLES = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  aprobado: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  rechazado: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
};

export function PagosPage() {
  const { user, isBusinessUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState({});
  const [platformInfo, setPlatformInfo] = useState({});
  const [misPagos, setMisPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [expandedPago, setExpandedPago] = useState(null);

  // Form state
  const [metodoPago, setMetodoPago] = useState('');
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('USD');
  const [montoBs, setMontoBs] = useState('');
  const [tasaCambio, setTasaCambio] = useState('');
  const [referencia, setReferencia] = useState('');
  const [planSolicitado, setPlanSolicitado] = useState('premium');
  const [meses, setMeses] = useState('1');
  const [notas, setNotas] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [comprobantePreview, setComprobantePreview] = useState(null);

  // Pricing
  const pricing = isBusinessUser 
    ? { basic: 15, premium: 20 }
    : { basic: 5, premium: 10 };

  const totalAPagar = pricing[planSolicitado] * parseInt(meses || 1);

  const fetchData = useCallback(async () => {
    try {
      const [methodsRes, pagosRes] = await Promise.all([
        authAxios.get(`${API}/api/payment-methods`),
        authAxios.get(`${API}/api/pagos/mis-pagos`)
      ]);
      setPaymentMethods(methodsRes.data.methods || {});
      setPlatformInfo(methodsRes.data.platform_info || {});
      setMisPagos(pagosRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Error al cargar datos de pago');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es muy grande. Máximo 5MB');
        return;
      }
      setComprobante(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprobantePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!metodoPago) {
      toast.error('Selecciona un método de pago');
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('metodo_pago', metodoPago);
      formData.append('monto', monto);
      formData.append('moneda', moneda);
      formData.append('monto_bs', montoBs || '0');
      formData.append('tasa_cambio', tasaCambio || '0');
      formData.append('referencia', referencia);
      formData.append('plan_solicitado', planSolicitado);
      formData.append('meses', meses);
      formData.append('notas', notas);
      formData.append('datos_pago', JSON.stringify({}));
      
      if (comprobante) {
        formData.append('comprobante', comprobante);
      }

      await authAxios.post(`${API}/api/pagos/registrar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Pago registrado exitosamente. El administrador revisará tu comprobante.');
      
      // Reset form
      setMetodoPago('');
      setMonto('');
      setMontoBs('');
      setTasaCambio('');
      setReferencia('');
      setNotas('');
      setComprobante(null);
      setComprobantePreview(null);
      
      // Refresh payments
      fetchData();
    } catch (err) {
      console.error('Error registering payment:', err);
      toast.error(err.response?.data?.detail || 'Error al registrar pago');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E84A8A]"></div>
      </div>
    );
  }

  const selectedMethodInfo = metodoPago ? platformInfo[metodoPago] : null;

  return (
    <div className="space-y-6 p-4 md:p-6" data-testid="pagos-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pagos y Suscripción</h1>
          <p className="text-gray-500">Registra tu pago para activar o renovar tu suscripción</p>
        </div>
        <CreditCard className="w-8 h-8 text-[#E84A8A]" />
      </div>

      {/* Pricing Info */}
      <Card className="bg-gradient-to-r from-[#E84A8A]/10 to-purple-100 border-[#E84A8A]/20">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/80 rounded-lg p-4 border border-[#E84A8A]/20">
              <h3 className="font-semibold text-gray-900">Plan Básico</h3>
              <p className="text-3xl font-bold text-[#E84A8A]">${pricing.basic}<span className="text-sm font-normal text-gray-500">/mes</span></p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Hasta 10 productos</li>
                <li>• Hasta 5 servicios</li>
                <li>• 20 clientes</li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border-2 border-[#E84A8A]">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">Plan Premium</h3>
                <span className="bg-[#E84A8A] text-white text-xs px-2 py-0.5 rounded-full">Recomendado</span>
              </div>
              <p className="text-3xl font-bold text-[#E84A8A]">${pricing.premium}<span className="text-sm font-normal text-gray-500">/mes</span></p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>• Productos ilimitados</li>
                <li>• Servicios ilimitados</li>
                <li>• Reportes y simulaciones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setShowForm(!showForm)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Registrar Nuevo Pago</CardTitle>
              {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showForm && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Plan Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Plan</Label>
                    <Select value={planSolicitado} onValueChange={setPlanSolicitado}>
                      <SelectTrigger data-testid="plan-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Básico (${pricing.basic}/mes)</SelectItem>
                        <SelectItem value="premium">Premium (${pricing.premium}/mes)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Meses</Label>
                    <Select value={meses} onValueChange={setMeses}>
                      <SelectTrigger data-testid="meses-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 mes</SelectItem>
                        <SelectItem value="3">3 meses</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-[#E84A8A]/10 rounded-lg p-3 text-center">
                  <span className="text-gray-600">Total a pagar:</span>
                  <span className="text-2xl font-bold text-[#E84A8A] ml-2">${totalAPagar}</span>
                </div>

                {/* Payment Method */}
                <div>
                  <Label>Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={setMetodoPago}>
                    <SelectTrigger data-testid="metodo-pago-select">
                      <SelectValue placeholder="Selecciona un método" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentMethods).map(([key, method]) => {
                        const Icon = ICON_MAP[method.icono] || CreditCard;
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {method.nombre}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform Payment Info */}
                {selectedMethodInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Datos para realizar el pago
                    </h4>
                    {Object.entries(selectedMethodInfo).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">{value}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(value)}
                            className="p-1 hover:bg-blue-100 rounded"
                          >
                            <Copy className="w-3 h-3 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monto Pagado</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      data-testid="monto-input"
                    />
                  </div>
                  <div>
                    <Label>Moneda</Label>
                    <Select value={moneda} onValueChange={setMoneda}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="BS">Bolívares (Bs)</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bs conversion */}
                {moneda === 'USD' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Monto en Bs (opcional)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={montoBs}
                        onChange={(e) => setMontoBs(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Tasa de Cambio</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={tasaCambio}
                        onChange={(e) => setTasaCambio(e.target.value)}
                        placeholder="Ej: 36.50"
                      />
                    </div>
                  </div>
                )}

                {/* Reference */}
                <div>
                  <Label>Referencia / # Transacción</Label>
                  <Input
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Número de referencia del pago"
                    data-testid="referencia-input"
                  />
                </div>

                {/* Comprobante */}
                <div>
                  <Label>Comprobante de Pago (Imagen)</Label>
                  <div className="mt-1">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      {comprobantePreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={comprobantePreview} 
                            alt="Preview" 
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setComprobante(null);
                              setComprobantePreview(null);
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Subir comprobante</span>
                          <span className="text-xs text-gray-400">PNG, JPG hasta 5MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        data-testid="comprobante-input"
                      />
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label>Notas Adicionales</Label>
                  <Textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Información adicional sobre el pago..."
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#E84A8A] hover:bg-[#d63d7a]"
                  disabled={submitting}
                  data-testid="submit-payment-btn"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Registrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Registrar Pago
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mis Pagos</CardTitle>
            <CardDescription>Historial de pagos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {misPagos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tienes pagos registrados</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {misPagos.map((pago) => {
                  const statusStyle = STATUS_STYLES[pago.estado] || STATUS_STYLES.pendiente;
                  const StatusIcon = statusStyle.icon;
                  const isExpanded = expandedPago === pago.id;

                  return (
                    <div 
                      key={pago.id}
                      className="border rounded-lg p-3 hover:border-[#E84A8A]/30 transition-colors"
                    >
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedPago(isExpanded ? null : pago.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${statusStyle.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${statusStyle.text}`} />
                          </div>
                          <div>
                            <p className="font-medium">
                              ${pago.monto} {pago.moneda}
                            </p>
                            <p className="text-xs text-gray-500">
                              {paymentMethods[pago.metodo_pago]?.nombre || pago.metodo_pago}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                            {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(pago.created_at)}
                          </p>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plan:</span>
                            <span className="font-medium">{pago.plan_solicitado} x {pago.meses} mes(es)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Referencia:</span>
                            <span className="font-mono">{pago.referencia || '-'}</span>
                          </div>
                          {pago.admin_notas && (
                            <div className="bg-gray-50 p-2 rounded text-gray-600">
                              <strong>Nota del Admin:</strong> {pago.admin_notas}
                            </div>
                          )}
                          {pago.comprobante_filename && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <FileImage className="w-4 h-4" />
                              <span>Comprobante adjunto</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
