import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Shield, Users, DollarSign, AlertTriangle, Clock, CheckCircle, XCircle, 
  CreditCard, FileText, TrendingUp, Bell, RefreshCw, Loader2, Search,
  UserCheck, UserX, Key, Play, Calendar, Building2, User, Copy, Check,
  Eye, Ban, BarChart3, Download, PieChart, ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RePieChart, Pie, Cell, Legend } from "recharts";

const API = process.env.REACT_APP_BACKEND_URL + "/api";
const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [subscriptions, setSubscriptions] = useState({ subscriptions: [], summary: {} });
  const [invoices, setInvoices] = useState({ invoices: [], summary: {} });
  const [userAnalytics, setUserAnalytics] = useState([]);
  
  const [paymentDialog, setPaymentDialog] = useState({ open: false, user: null, months: 1, plan: "free", amount: 0 });
  const [passwordDialog, setPasswordDialog] = useState({ open: false, user: null, tempPassword: null });
  const [analyticsDialog, setAnalyticsDialog] = useState({ open: false, user: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/"); return; }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [subsRes, invRes] = await Promise.all([
        authAxios.get(`${API}/admin/subscriptions`),
        authAxios.get(`${API}/admin/invoices`),
      ]);
      setSubscriptions(subsRes.data);
      setInvoices(invRes.data);
      
      // Generate user analytics (simulated for demo)
      const analytics = subsRes.data.subscriptions.map(s => ({
        ...s,
        gastos_mes: Math.floor(Math.random() * 200) + 50,
        ingresos_mes: Math.floor(Math.random() * 1000) + 200,
        servicios_mes: Math.floor(Math.random() * 80) + 10,
        clientes_activos: Math.floor(Math.random() * 30) + 5,
      }));
      setUserAnalytics(analytics);
    } catch (err) {
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
      toast.error("Error al activar");
    } finally {
      setUpdating(null);
    }
  };

  const handleSetPayment = async () => {
    const { user: u, months, plan, amount } = paymentDialog;
    setUpdating(u.user_id);
    try {
      await authAxios.post(`${API}/admin/users/${u.user_id}/subscription?months=${months}&plan=${plan}`);
      if (amount > 0) await authAxios.post(`${API}/admin/users/${u.user_id}/generate-invoice?months=${months}`);
      toast.success(`Pago registrado - ${plan} por ${months} mes(es)`);
      setPaymentDialog({ open: false, user: null, months: 1, plan: "free", amount: 0 });
      fetchData();
    } catch (err) {
      toast.error("Error");
    } finally {
      setUpdating(null);
    }
  };

  const handleResetPassword = async (targetUser) => {
    setUpdating(targetUser.user_id);
    try {
      const res = await authAxios.post(`${API}/admin/users/${targetUser.user_id}/reset-password`);
      setPasswordDialog({ open: true, user: targetUser, tempPassword: res.data.temp_password });
    } catch (err) {
      toast.error("Error");
    } finally {
      setUpdating(null);
    }
  };

  const handleInvoiceStatus = async (invoiceId, status) => {
    try {
      await authAxios.put(`${API}/admin/invoices/${invoiceId}/status?status=${status}`);
      toast.success(`Factura ${status === "paid" ? "cobrada" : "actualizada"}`);
      fetchData();
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSuspendUser = async (userId) => {
    setUpdating(userId);
    try {
      await authAxios.post(`${API}/admin/users/${userId}/toggle-status`);
      toast.success("Estado actualizado");
      fetchData();
    } catch (err) {
      toast.error("Error");
    } finally {
      setUpdating(null);
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const getPricing = (userType, plan) => {
    const prices = { personal: { free: 5, premium: 10 }, business: { free: 15, premium: 20 } };
    return prices[userType]?.[plan] || 5;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: "bg-amber-500/20 text-amber-400", label: "Pendiente" },
      trial: { bg: "bg-blue-500/20 text-blue-400", label: "Trial" },
      trial_expired: { bg: "bg-orange-500/20 text-orange-400", label: "Trial Vencido" },
      active: { bg: "bg-emerald-500/20 text-emerald-400", label: "Activo" },
      expired: { bg: "bg-red-500/20 text-red-400", label: "Vencido" },
    };
    const c = config[status] || config.pending;
    return <Badge className={c.bg}>{c.label}</Badge>;
  };

  // Filter data
  const pendingUsers = subscriptions.subscriptions.filter(s => s.account_status === "pending");
  const expiredUsers = subscriptions.subscriptions.filter(s => s.subscription_status === "expired" || s.subscription_status === "trial_expired");
  const activeUsers = subscriptions.subscriptions.filter(s => s.subscription_status === "active" || s.subscription_status === "trial");
  const pendingInvoices = invoices.invoices.filter(i => i.status === "pending");

  // Chart data
  const revenueByType = [
    { name: 'Personal Básico', value: subscriptions.subscriptions.filter(s => s.user_type === 'personal' && s.plan === 'free').length * 5 },
    { name: 'Personal Premium', value: subscriptions.subscriptions.filter(s => s.user_type === 'personal' && s.plan === 'premium').length * 10 },
    { name: 'Comercio Básico', value: subscriptions.subscriptions.filter(s => s.user_type === 'business' && s.plan === 'free').length * 15 },
    { name: 'Comercio Premium', value: subscriptions.subscriptions.filter(s => s.user_type === 'business' && s.plan === 'premium').length * 20 },
  ].filter(x => x.value > 0);

  const filteredAnalytics = userAnalytics.filter(u =>
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-900"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white" data-testid="admin-page">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin NailCost</h1>
              <p className="text-xs text-slate-400">Panel de Control</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="w-4 h-4 mr-2" />Actualizar
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "pendientes", label: `Pendientes (${pendingUsers.length})`, icon: Clock },
            { id: "vencidos", label: `Vencidos (${expiredUsers.length})`, icon: AlertTriangle },
            { id: "usuarios", label: `Usuarios (${activeUsers.length})`, icon: Users },
            { id: "facturacion", label: `Facturas (${pendingInvoices.length})`, icon: FileText },
            { id: "analytics", label: "Analytics", icon: Activity },
          ].map(tab => (
            <Button key={tab.id} variant={activeSection === tab.id ? "default" : "outline"} onClick={() => setActiveSection(tab.id)}
              className={activeSection === tab.id ? "bg-violet-600" : "border-slate-700 text-slate-300 hover:bg-slate-800"}>
              <tab.icon className="w-4 h-4 mr-2" />{tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0">
                <CardContent className="p-4">
                  <DollarSign className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">${subscriptions.summary.monthly_revenue || 0}</p>
                  <p className="text-sm opacity-80">Ingresos/Mes</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0">
                <CardContent className="p-4">
                  <Clock className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{pendingUsers.length}</p>
                  <p className="text-sm opacity-80">Por Activar</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500 to-rose-600 border-0">
                <CardContent className="p-4">
                  <AlertTriangle className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">${invoices.summary.total_pending_amount || 0}</p>
                  <p className="text-sm opacity-80">Por Cobrar</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0">
                <CardContent className="p-4">
                  <Users className="w-6 h-6 mb-2 opacity-80" />
                  <p className="text-3xl font-bold">{subscriptions.summary.total_users || 0}</p>
                  <p className="text-sm opacity-80">Total Usuarios</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle className="text-lg">Ingresos por Plan</CardTitle></CardHeader>
                <CardContent>
                  {revenueByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <RePieChart>
                        <Pie data={revenueByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                          {revenueByType.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                      </RePieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-center text-slate-500 py-8">Sin datos</p>}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle className="text-lg">Estado de Suscripciones</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">Activos</span>
                      <span className="text-2xl font-bold text-emerald-400">{activeUsers.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">En Trial</span>
                      <span className="text-2xl font-bold text-blue-400">{subscriptions.summary.in_trial || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">Vencidos</span>
                      <span className="text-2xl font-bold text-red-400">{expiredUsers.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-400">Pendientes</span>
                      <span className="text-2xl font-bold text-amber-400">{pendingUsers.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            {(pendingUsers.length > 0 || pendingInvoices.length > 0) && (
              <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" />Acciones Pendientes</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {pendingUsers.slice(0, 3).map(u => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">{u.nombre} espera activación</span>
                      <Button size="sm" onClick={() => handleActivateUser(u.user_id)} className="bg-emerald-500 hover:bg-emerald-600">
                        <Play className="w-4 h-4 mr-1" />Activar
                      </Button>
                    </div>
                  ))}
                  {pendingInvoices.slice(0, 2).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-slate-300">{inv.invoice_number} - ${inv.total} pendiente</span>
                      <Button size="sm" onClick={() => handleInvoiceStatus(inv.id, "paid")} className="bg-blue-500 hover:bg-blue-600">
                        <CheckCircle className="w-4 h-4 mr-1" />Cobrar
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pendientes */}
        {activeSection === "pendientes" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-amber-400 flex items-center gap-2"><Clock className="w-5 h-5" />Usuarios Pendientes de Activación</CardTitle></CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? <p className="text-center text-slate-500 py-8">No hay usuarios pendientes</p> : (
                <div className="space-y-3">
                  {pendingUsers.map(u => (
                    <div key={u.user_id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-amber-500/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-pink-500"}`}>
                          {u.user_type === "business" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{u.nombre}</p>
                          <p className="text-sm text-slate-400">{u.email}</p>
                          <p className="text-xs text-slate-500">Registrado: {new Date(u.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={u.user_type === "business" ? "bg-blue-500/20 text-blue-400" : "bg-pink-500/20 text-pink-400"}>
                          {u.user_type === "business" ? "Comercio" : "Personal"}
                        </Badge>
                        <Button size="sm" onClick={() => handleActivateUser(u.user_id)} disabled={updating === u.user_id} className="bg-emerald-500 hover:bg-emerald-600">
                          {updating === u.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 mr-1" />Activar</>}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vencidos */}
        {activeSection === "vencidos" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Suscripciones Vencidas - Esperando Pago</CardTitle></CardHeader>
            <CardContent>
              {expiredUsers.length === 0 ? <p className="text-center text-slate-500 py-8">No hay suscripciones vencidas</p> : (
                <div className="space-y-3">
                  {expiredUsers.map(u => (
                    <div key={u.user_id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl border border-red-500/30">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-pink-500"}`}>
                          {u.user_type === "business" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{u.nombre}</p>
                          <p className="text-sm text-slate-400">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1">{getStatusBadge(u.subscription_status)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-400">${getPricing(u.user_type, u.plan)}/mes</span>
                        <Button size="sm" onClick={() => setPaymentDialog({ open: true, user: u, months: 1, plan: u.plan, amount: getPricing(u.user_type, u.plan) })} className="bg-emerald-500 hover:bg-emerald-600">
                          <CreditCard className="w-4 h-4 mr-1" />Registrar Pago
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Usuarios Activos */}
        {activeSection === "usuarios" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader><CardTitle className="text-emerald-400 flex items-center gap-2"><UserCheck className="w-5 h-5" />Usuarios Activos</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeUsers.map(u => (
                  <div key={u.user_id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-pink-500"}`}>
                        {u.user_type === "business" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{u.nombre}</p>
                        <p className="text-sm text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(u.subscription_status)}
                      <Badge className={u.plan === "premium" ? "bg-amber-500/20 text-amber-400" : ""}>{u.plan}</Badge>
                      {u.days_remaining !== null && <span className={`text-sm ${u.days_remaining <= 5 ? "text-red-400" : "text-slate-400"}`}>{u.days_remaining}d</span>}
                      <Button size="sm" variant="outline" onClick={() => handleResetPassword(u)} className="border-slate-600"><Key className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setPaymentDialog({ open: true, user: u, months: 1, plan: u.plan, amount: getPricing(u.user_type, u.plan) })} className="border-slate-600"><CreditCard className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facturación */}
        {activeSection === "facturacion" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{invoices.summary.total_invoices || 0}</p><p className="text-sm text-slate-400">Total</p>
              </CardContent></Card>
              <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{invoices.summary.pending || 0}</p><p className="text-sm text-slate-400">Pendientes</p>
              </CardContent></Card>
              <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">${invoices.summary.total_paid_amount || 0}</p><p className="text-sm text-slate-400">Cobrado</p>
              </CardContent></Card>
              <Card className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-400">${invoices.summary.total_pending_amount || 0}</p><p className="text-sm text-slate-400">Por Cobrar</p>
              </CardContent></Card>
            </div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle>Facturas</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {invoices.invoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="font-mono text-sm">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-400">{inv.user_nombre}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">${inv.total}</span>
                      <Badge className={inv.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : inv.status === "cancelled" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}>
                        {inv.status === "paid" ? "Pagada" : inv.status === "cancelled" ? "Cancelada" : "Pendiente"}
                      </Badge>
                      {inv.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleInvoiceStatus(inv.id, "paid")} className="text-emerald-400 border-emerald-500/50"><CheckCircle className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleInvoiceStatus(inv.id, "cancelled")} className="text-red-400 border-red-500/50"><XCircle className="w-4 h-4" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics */}
        {activeSection === "analytics" && (
          <div className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input placeholder="Buscar usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 bg-slate-800 border-slate-700 text-white" />
            </div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" />Actividad por Usuario</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredAnalytics.map(u => (
                    <div key={u.user_id} className="p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-pink-500"}`}>
                            {u.user_type === "business" ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium">{u.nombre}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(u.subscription_status)}
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                          <p className="text-lg font-bold text-emerald-400">${u.ingresos_mes}</p>
                          <p className="text-xs text-slate-500">Ingresos</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                          <p className="text-lg font-bold text-red-400">${u.gastos_mes}</p>
                          <p className="text-xs text-slate-500">Gastos</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                          <p className="text-lg font-bold text-blue-400">{u.servicios_mes}</p>
                          <p className="text-xs text-slate-500">Servicios</p>
                        </div>
                        <div className="text-center p-2 bg-slate-800 rounded-lg">
                          <p className="text-lg font-bold text-violet-400">{u.clientes_activos}</p>
                          <p className="text-xs text-slate-500">Clientes</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(o) => setPaymentDialog({...paymentDialog, open: o})}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-400">Usuario: <strong className="text-white">{paymentDialog.user?.nombre}</strong></p>
            <div>
              <label className="text-sm text-slate-400">Plan</label>
              <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg mt-1" value={paymentDialog.plan}
                onChange={(e) => { const plan = e.target.value; setPaymentDialog({...paymentDialog, plan, amount: getPricing(paymentDialog.user?.user_type, plan) * paymentDialog.months}); }}>
                <option value="free">Básico</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Meses</label>
              <Input type="number" min="1" max="12" value={paymentDialog.months} className="bg-slate-700 border-slate-600"
                onChange={(e) => { const months = parseInt(e.target.value) || 1; setPaymentDialog({...paymentDialog, months, amount: getPricing(paymentDialog.user?.user_type, paymentDialog.plan) * months}); }} />
            </div>
            <div className="p-4 bg-emerald-500/20 rounded-xl text-center">
              <p className="text-sm text-slate-400">Total a cobrar</p>
              <p className="text-3xl font-bold text-emerald-400">${paymentDialog.amount}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog({...paymentDialog, open: false})} className="border-slate-600">Cancelar</Button>
            <Button onClick={handleSetPayment} className="bg-emerald-500 hover:bg-emerald-600">Confirmar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(o) => setPasswordDialog({...passwordDialog, open: o})}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Contraseña Temporal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300 text-sm">Comparte esta contraseña de forma segura.</div>
            <p className="text-slate-400">Usuario: <strong className="text-white">{passwordDialog.user?.email}</strong></p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-700 px-4 py-3 rounded-lg font-mono text-lg">{passwordDialog.tempPassword}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(passwordDialog.tempPassword)} className="border-slate-600">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setPasswordDialog({open: false, user: null, tempPassword: null})}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AdminPage };
