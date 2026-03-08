import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Users, Crown, Package, Palette, Sparkles, UserCheck, Loader2, Shield, TrendingUp, Calendar, DollarSign, 
  Key, UserX, UserPlus, Search, Building2, User, Copy, Check, AlertTriangle, BarChart3, RefreshCw,
  Clock, CreditCard, FileText, CheckCircle, XCircle, Play, Pause
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeTab, setActiveTab] = useState("users");
  
  // Data states
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [subscriptions, setSubscriptions] = useState({ subscriptions: [], summary: {} });
  const [invoices, setInvoices] = useState({ invoices: [], summary: {} });
  
  // Dialogs
  const [resetDialog, setResetDialog] = useState({ open: false, user: null, tempPassword: null });
  const [subscriptionDialog, setSubscriptionDialog] = useState({ open: false, user: null, months: 1, plan: "free" });
  const [invoiceDialog, setInvoiceDialog] = useState({ open: false, user: null, months: 1 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") {
      toast.error("Acceso denegado");
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes, revenueRes, subsRes, invRes] = await Promise.all([
        authAxios.get(`${API}/admin/users`),
        authAxios.get(`${API}/admin/stats`),
        authAxios.get(`${API}/admin/revenue`),
        authAxios.get(`${API}/admin/subscriptions`),
        authAxios.get(`${API}/admin/invoices`),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setRevenue(revenueRes.data);
      setSubscriptions(subsRes.data);
      setInvoices(invRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    setUpdating(userId);
    try {
      await authAxios.post(`${API}/admin/users/${userId}/activate`);
      toast.success("Usuario activado - Inicia 15 días de prueba");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al activar");
    } finally {
      setUpdating(null);
    }
  };

  const handleSetSubscription = async () => {
    const { user: u, months, plan } = subscriptionDialog;
    setUpdating(u.id);
    try {
      await authAxios.post(`${API}/admin/users/${u.id}/subscription?months=${months}&plan=${plan}`);
      toast.success(`Suscripción ${plan} activada por ${months} mes(es)`);
      setSubscriptionDialog({ open: false, user: null, months: 1, plan: "free" });
      fetchData();
    } catch (err) {
      toast.error("Error al configurar suscripción");
    } finally {
      setUpdating(null);
    }
  };

  const handleGenerateInvoice = async () => {
    const { user: u, months } = invoiceDialog;
    setUpdating(u.id);
    try {
      const res = await authAxios.post(`${API}/admin/users/${u.id}/generate-invoice?months=${months}`);
      toast.success(`Factura ${res.data.invoice_number} generada`);
      setInvoiceDialog({ open: false, user: null, months: 1 });
      fetchData();
    } catch (err) {
      toast.error("Error al generar factura");
    } finally {
      setUpdating(null);
    }
  };

  const handleInvoiceStatus = async (invoiceId, status) => {
    try {
      await authAxios.put(`${API}/admin/invoices/${invoiceId}/status?status=${status}`);
      toast.success(`Factura marcada como ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Error al actualizar factura");
    }
  };

  const handleChangePlan = async (userId, newPlan) => {
    setUpdating(userId);
    try {
      await authAxios.put(`${API}/admin/users/${userId}/plan?plan=${newPlan}`);
      toast.success(`Plan actualizado a ${newPlan === "premium" ? "Premium" : "Básico"}`);
      fetchData();
    } catch (err) {
      toast.error("Error al actualizar plan");
    } finally {
      setUpdating(null);
    }
  };

  const handleResetPassword = async (targetUser) => {
    setUpdating(targetUser.id);
    try {
      const res = await authAxios.post(`${API}/admin/users/${targetUser.id}/reset-password`);
      setResetDialog({ open: true, user: targetUser, tempPassword: res.data.temp_password });
    } catch (err) {
      toast.error("Error al blanquear contraseña");
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleStatus = async (userId) => {
    setUpdating(userId);
    try {
      const res = await authAxios.post(`${API}/admin/users/${userId}/toggle-status`);
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error");
    } finally {
      setUpdating(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      trial: "bg-blue-100 text-blue-700",
      trial_expired: "bg-orange-100 text-orange-700",
      active: "bg-emerald-100 text-emerald-700",
      expired: "bg-red-100 text-red-700",
      inactive: "bg-gray-100 text-gray-700"
    };
    const labels = {
      pending: "Pendiente",
      trial: "En Prueba",
      trial_expired: "Prueba Expirada",
      active: "Activo",
      expired: "Expirado",
      inactive: "Inactivo"
    };
    return <Badge className={styles[status] || styles.inactive}>{labels[status] || status}</Badge>;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
                       (filterType === "pending" && u.account_status === "pending") ||
                       (filterType === "personal" && u.user_type === "personal") ||
                       (filterType === "business" && u.user_type === "business") ||
                       (filterType === "premium" && u.plan === "premium");
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="admin-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Panel de Administración</h1>
            <p className="text-stone-500">Control total de NailCost Pro</p>
          </div>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Revenue Card */}
      {revenue && (
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Ingresos Mensuales</p>
                <p className="text-4xl font-bold">${subscriptions.summary.monthly_revenue || 0}</p>
                <p className="text-emerald-100 text-sm mt-1">${(subscriptions.summary.annual_revenue || 0)} / año</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur text-center">
                  <p className="text-2xl font-bold">{subscriptions.summary.pending_activation || 0}</p>
                  <p className="text-xs text-emerald-100">Pendientes</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur text-center">
                  <p className="text-2xl font-bold">{subscriptions.summary.in_trial || 0}</p>
                  <p className="text-xs text-emerald-100">En Prueba</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur text-center">
                  <p className="text-2xl font-bold">{subscriptions.summary.active_subscriptions || 0}</p>
                  <p className="text-xs text-emerald-100">Activos</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur text-center">
                  <p className="text-2xl font-bold">{subscriptions.summary.expired || 0}</p>
                  <p className="text-xs text-emerald-100">Expirados</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-stone-100">
          <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" />Usuarios</TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2"><CreditCard className="w-4 h-4" />Suscripciones</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2"><FileText className="w-4 h-4" />Facturas</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[{k:"all",l:"Todos"},{k:"pending",l:"Pendientes"},{k:"personal",l:"Personal"},{k:"business",l:"Comercio"},{k:"premium",l:"Premium"}].map((f) => (
                <Button key={f.k} variant={filterType === f.k ? "default" : "outline"} size="sm" onClick={() => setFilterType(f.k)}
                  className={filterType === f.k ? "bg-violet-600" : ""}>{f.l}</Button>
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              {filteredUsers.map((u) => (
                <div key={u.id} className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl gap-4 ${
                  u.account_status === "pending" ? "bg-yellow-50 border border-yellow-200" : 
                  u.is_disabled ? "bg-red-50 border border-red-200" : "bg-stone-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                      u.user_type === "business" ? "bg-gradient-to-br from-indigo-500 to-blue-600" : "bg-gradient-to-br from-pink-500 to-rose-600"}`}>
                      {u.user_type === "business" ? <Building2 className="w-5 h-5" /> : u.nombre?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-stone-800">{u.nombre}</p>
                        {u.role === "admin" && <Badge className="bg-violet-100 text-violet-700 text-xs">Admin</Badge>}
                        <Badge className={u.user_type === "business" ? "bg-indigo-100 text-indigo-700" : "bg-pink-100 text-pink-700"}>
                          {u.user_type === "business" ? "Comercio" : "Personal"}
                        </Badge>
                        <Badge className={u.plan === "premium" ? "bg-amber-100 text-amber-700" : "bg-stone-200 text-stone-600"}>
                          {u.plan === "premium" ? "Premium" : "Básico"}
                        </Badge>
                        {u.account_status === "pending" && <Badge className="bg-yellow-100 text-yellow-700">Pendiente Activación</Badge>}
                      </div>
                      <p className="text-sm text-stone-500">{u.email}</p>
                    </div>
                  </div>

                  {u.role !== "admin" && (
                    <div className="flex gap-2 flex-wrap">
                      {u.account_status === "pending" && (
                        <Button size="sm" onClick={() => handleActivateUser(u.id)} disabled={updating === u.id}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          {updating === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 mr-1" />Activar</>}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setSubscriptionDialog({ open: true, user: u, months: 1, plan: u.plan })}
                        className="gap-1"><CreditCard className="w-4 h-4" />Suscripción</Button>
                      <Button size="sm" variant="outline" onClick={() => setInvoiceDialog({ open: true, user: u, months: 1 })}
                        className="gap-1"><FileText className="w-4 h-4" />Facturar</Button>
                      <Button size="sm" variant="outline" onClick={() => handleResetPassword(u)} disabled={updating === u.id} title="Blanquear contraseña">
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant={u.is_disabled ? "default" : "outline"} onClick={() => handleToggleStatus(u.id)} disabled={updating === u.id}
                        className={u.is_disabled ? "bg-emerald-500 hover:bg-emerald-600" : "text-red-600 hover:bg-red-50"}>
                        {u.is_disabled ? <UserPlus className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Control de Suscripciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscriptions.subscriptions.map((s) => (
                <div key={s.user_id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl bg-stone-50 gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      s.user_type === "business" ? "bg-indigo-500" : "bg-pink-500"}`}>
                      {s.user_type === "business" ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{s.nombre}</p>
                      <p className="text-xs text-stone-500">{s.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {getStatusBadge(s.subscription_status)}
                    <Badge className={s.plan === "premium" ? "bg-amber-100 text-amber-700" : ""}>{s.plan}</Badge>
                  </div>

                  <div className="text-sm text-stone-600">
                    {s.days_remaining !== null && (
                      <span className={s.days_remaining <= 5 ? "text-red-600 font-medium" : ""}>
                        {s.days_remaining > 0 ? `${s.days_remaining} días restantes` : "Expirado"}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-stone-500">
                    {s.subscription_ends_at && <p>Vence: {new Date(s.subscription_ends_at).toLocaleDateString()}</p>}
                    {s.trial_ends_at && !s.subscription_ends_at && <p>Trial: {new Date(s.trial_ends_at).toLocaleDateString()}</p>}
                  </div>

                  <Button size="sm" variant="outline" onClick={() => setSubscriptionDialog({ open: true, user: s, months: 1, plan: s.plan })}>
                    <CreditCard className="w-4 h-4 mr-1" />Renovar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{invoices.summary.total_invoices || 0}</p>
              <p className="text-xs text-stone-500">Total Facturas</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{invoices.summary.pending || 0}</p>
              <p className="text-xs text-stone-500">Pendientes</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">${invoices.summary.total_paid_amount || 0}</p>
              <p className="text-xs text-stone-500">Cobrado</p>
            </CardContent></Card>
            <Card><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">${invoices.summary.total_pending_amount || 0}</p>
              <p className="text-xs text-stone-500">Por Cobrar</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Facturas Emitidas</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {invoices.invoices.length === 0 ? (
                <p className="text-center text-stone-500 py-8">No hay facturas emitidas</p>
              ) : invoices.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-stone-50">
                  <div>
                    <p className="font-mono text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-stone-500">{inv.user_nombre} - {inv.notes}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${inv.total}</p>
                    <p className="text-xs text-stone-500">{new Date(inv.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge className={inv.status === "paid" ? "bg-emerald-100 text-emerald-700" : inv.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                    {inv.status === "paid" ? "Pagada" : inv.status === "cancelled" ? "Cancelada" : "Pendiente"}
                  </Badge>
                  {inv.status === "pending" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => handleInvoiceStatus(inv.id, "paid")} className="text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleInvoiceStatus(inv.id, "cancelled")} className="text-red-600">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialog.open} onOpenChange={(o) => setSubscriptionDialog({...subscriptionDialog, open: o})}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configurar Suscripción</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-stone-600">Usuario: <strong>{subscriptionDialog.user?.nombre}</strong></p>
            <div>
              <label className="text-sm font-medium">Plan</label>
              <select className="w-full p-2 border rounded-lg mt-1" value={subscriptionDialog.plan}
                onChange={(e) => setSubscriptionDialog({...subscriptionDialog, plan: e.target.value})}>
                <option value="free">Básico</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Meses</label>
              <Input type="number" min="1" max="12" value={subscriptionDialog.months}
                onChange={(e) => setSubscriptionDialog({...subscriptionDialog, months: parseInt(e.target.value) || 1})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscriptionDialog({...subscriptionDialog, open: false})}>Cancelar</Button>
            <Button onClick={handleSetSubscription} disabled={updating}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={invoiceDialog.open} onOpenChange={(o) => setInvoiceDialog({...invoiceDialog, open: o})}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generar Factura</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-stone-600">Usuario: <strong>{invoiceDialog.user?.nombre}</strong></p>
            <div>
              <label className="text-sm font-medium">Meses a facturar</label>
              <Input type="number" min="1" max="12" value={invoiceDialog.months}
                onChange={(e) => setInvoiceDialog({...invoiceDialog, months: parseInt(e.target.value) || 1})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialog({...invoiceDialog, open: false})}>Cancelar</Button>
            <Button onClick={handleGenerateInvoice} disabled={updating}>Generar Factura</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialog.open} onOpenChange={(o) => setResetDialog({...resetDialog, open: o})}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Contraseña Temporal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">Comparte esta contraseña de forma segura. El usuario deberá cambiarla.</p>
            </div>
            <p className="text-sm">Usuario: <strong>{resetDialog.user?.email}</strong></p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-stone-100 px-4 py-2 rounded-lg font-mono text-lg">{resetDialog.tempPassword}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(resetDialog.tempPassword)}>
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setResetDialog({open: false, user: null, tempPassword: null})}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AdminPage };
