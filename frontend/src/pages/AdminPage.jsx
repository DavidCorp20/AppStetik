import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Users, DollarSign, AlertTriangle, Clock, CheckCircle, XCircle, 
  CreditCard, FileText, TrendingUp, Bell, RefreshCw, Loader2, Search,
  UserCheck, UserX, Key, Play, Calendar, Building2, User, Copy, Check,
  Eye, Ban, BarChart3, Download, PieChart, ArrowUpRight, ArrowDownRight, Activity,
  ChevronRight, Filter, MoreVertical, UserPlus, Settings, Database, Server,
  Globe, Zap, TrendingDown, Percent, CalendarDays, FileDown, Printer
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, 
  PieChart as RePieChart, Pie, Cell, Legend, AreaChart, Area, CartesianGrid,
  ComposedChart
} from "recharts";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

// Professional Color Palette
const COLORS = {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Violet
  success: '#10B981',    // Emerald
  warning: '#F59E0B',    // Amber
  danger: '#EF4444',     // Red
  info: '#06B6D4',       // Cyan
};

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  
  const [subscriptions, setSubscriptions] = useState({ subscriptions: [], summary: {} });
  const [invoices, setInvoices] = useState({ invoices: [], summary: {} });
  const [stats, setStats] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);
  const [userMetrics, setUserMetrics] = useState(null);
  
  const [paymentDialog, setPaymentDialog] = useState({ open: false, user: null, months: 1, plan: "free", amount: 0 });
  const [passwordDialog, setPasswordDialog] = useState({ open: false, user: null, tempPassword: null });
  const [planDialog, setPlanDialog] = useState({ open: false, user: null, newPlan: "free" });
  const [metricsDialog, setMetricsDialog] = useState({ open: false, user: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role !== "admin") { navigate("/"); return; }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [subsRes, invRes, statsRes] = await Promise.all([
        authAxios.get(`${API}/admin/subscriptions`),
        authAxios.get(`${API}/admin/invoices`),
        authAxios.get(`${API}/admin/stats`),
      ]);
      setSubscriptions(subsRes.data);
      setInvoices(invRes.data);
      setStats(statsRes.data);
      
      // Generate mock activity data for demo
      const mockActivity = subsRes.data.subscriptions.slice(0, 10).map((s, i) => ({
        id: i,
        user: s.nombre,
        action: ['login', 'create_invoice', 'add_client', 'calculate_price', 'update_settings'][Math.floor(Math.random() * 5)],
        time: `Hace ${Math.floor(Math.random() * 24) + 1}h`,
      }));
      setActivityLogs(mockActivity);
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

  const handleChangePlan = async () => {
    const { user: u, newPlan } = planDialog;
    setUpdating(u.user_id);
    try {
      await authAxios.post(`${API}/admin/users/${u.user_id}/subscription?months=1&plan=${newPlan}`);
      toast.success(`Plan cambiado a ${newPlan === 'premium' ? 'Premium' : 'Básico'}`);
      setPlanDialog({ open: false, user: null, newPlan: "free" });
      fetchData();
    } catch (err) {
      toast.error("Error al cambiar plan");
    } finally {
      setUpdating(null);
    }
  };

  const handleViewMetrics = async (targetUser) => {
    setMetricsDialog({ open: true, user: targetUser });
    try {
      const res = await authAxios.get(`${API}/admin/users/${targetUser.user_id}/metrics`);
      setUserMetrics(res.data);
    } catch (err) {
      toast.error("Error al cargar métricas");
      setUserMetrics(null);
    }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const getPricing = (userType, plan) => {
    const prices = { personal: { free: 5, premium: 10 }, business: { free: 15, premium: 20 } };
    return prices[userType]?.[plan] || 5;
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: "bg-amber-500/20 text-amber-300 border-amber-500/30", label: "Pendiente" },
      trial: { bg: "bg-blue-500/20 text-blue-300 border-blue-500/30", label: "Trial" },
      trial_expired: { bg: "bg-orange-500/20 text-orange-300 border-orange-500/30", label: "Trial Vencido" },
      active: { bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", label: "Activo" },
      expired: { bg: "bg-red-500/20 text-red-300 border-red-500/30", label: "Vencido" },
    };
    const c = config[status] || config.pending;
    return <Badge variant="outline" className={c.bg}>{c.label}</Badge>;
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Archivo exportado");
  };

  // Filter data
  const pendingUsers = subscriptions.subscriptions.filter(s => s.account_status === "pending");
  const expiredUsers = subscriptions.subscriptions.filter(s => s.subscription_status === "expired" || s.subscription_status === "trial_expired");
  const activeUsers = subscriptions.subscriptions.filter(s => s.subscription_status === "active" || s.subscription_status === "trial");
  const pendingInvoices = invoices.invoices.filter(i => i.status === "pending");

  // Filtered users for search
  const filteredUsers = subscriptions.subscriptions.filter(u => {
    const matchSearch = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || u.subscription_status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Chart data
  const revenueByType = [
    { name: 'Personal Básico', value: subscriptions.subscriptions.filter(s => s.user_type === 'personal' && s.plan === 'free').length * 5, fill: CHART_COLORS[0] },
    { name: 'Personal Premium', value: subscriptions.subscriptions.filter(s => s.user_type === 'personal' && s.plan === 'premium').length * 10, fill: CHART_COLORS[1] },
    { name: 'Comercio Básico', value: subscriptions.subscriptions.filter(s => s.user_type === 'business' && s.plan === 'free').length * 15, fill: CHART_COLORS[2] },
    { name: 'Comercio Premium', value: subscriptions.subscriptions.filter(s => s.user_type === 'business' && s.plan === 'premium').length * 20, fill: CHART_COLORS[3] },
  ].filter(x => x.value > 0);

  const userGrowthData = [
    { month: 'Oct', users: 2, revenue: 30 },
    { month: 'Nov', users: 4, revenue: 55 },
    { month: 'Dic', users: 5, revenue: 75 },
    { month: 'Ene', users: 7, revenue: 110 },
    { month: 'Feb', users: 8, revenue: 140 },
    { month: 'Mar', users: subscriptions.summary.total_users || 10, revenue: subscriptions.summary.monthly_revenue || 180 },
  ];

  const subscriptionStatusData = [
    { name: 'Activos', value: activeUsers.length, fill: COLORS.success },
    { name: 'Trial', value: subscriptions.summary.in_trial || 0, fill: COLORS.info },
    { name: 'Vencidos', value: expiredUsers.length, fill: COLORS.danger },
    { name: 'Pendientes', value: pendingUsers.length, fill: COLORS.warning },
  ].filter(x => x.value > 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-400">Cargando panel de administración...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" data-testid="admin-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-slate-400 text-sm">Gestiona usuarios, suscripciones y analiza el rendimiento</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <RefreshCw className="w-4 h-4 mr-2" />Actualizar
          </Button>
          <Button size="sm" onClick={() => exportToCSV(subscriptions.subscriptions, 'usuarios')} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />Exportar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">MRR</span>
            </div>
            <p className="text-2xl font-bold">${subscriptions.summary.monthly_revenue || 0}</p>
            <p className="text-xs opacity-80">Ingresos Mensuales</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-violet-600 to-violet-700 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 opacity-80" />
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
            </div>
            <p className="text-2xl font-bold">{subscriptions.summary.total_users || 0}</p>
            <p className="text-xs opacity-80">Total Usuarios</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold">{activeUsers.length}</p>
            <p className="text-xs opacity-80">Activos</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 opacity-80" />
              {pendingUsers.length > 0 && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
            </div>
            <p className="text-2xl font-bold">{pendingUsers.length}</p>
            <p className="text-xs opacity-80">Por Activar</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold">{expiredUsers.length}</p>
            <p className="text-xs opacity-80">Vencidos</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-2xl font-bold">${invoices.summary.total_pending_amount || 0}</p>
            <p className="text-xs opacity-80">Por Cobrar</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700 p-1 flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4 mr-2" />Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />Usuarios
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />Pendientes
            {pendingUsers.length > 0 && <Badge className="ml-2 bg-amber-500">{pendingUsers.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4 mr-2" />Facturación
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <DollarSign className="w-4 h-4 mr-2" />Precios
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
            <Server className="w-4 h-4 mr-2" />Costos
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />Reportes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Crecimiento de Usuarios e Ingresos</CardTitle>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="7">7 días</SelectItem>
                      <SelectItem value="30">30 días</SelectItem>
                      <SelectItem value="90">90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="users" name="Usuarios" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Ingresos ($)" stroke={COLORS.success} strokeWidth={2} dot={{ fill: COLORS.success }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Subscription Status Pie */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Estado de Suscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ResponsiveContainer width="50%" height={200}>
                    <RePieChart>
                      <Pie data={subscriptionStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                        {subscriptionStatusData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }} />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {subscriptionStatusData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="text-sm text-slate-300">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown & Activity */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue by Plan */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white">Ingresos por Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={revenueByType} layout="vertical">
                      <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} width={100} />
                      <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {revenueByType.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-slate-500 py-8">Sin datos</p>}
              </CardContent>
            </Card>

            {/* System Stats */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />Estadísticas del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Productos registrados</span>
                  <span className="font-bold text-white">{stats.total_productos || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Estilos creados</span>
                  <span className="font-bold text-white">{stats.total_estilos || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Clientes totales</span>
                  <span className="font-bold text-white">{stats.total_clientes || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Citas programadas</span>
                  <span className="font-bold text-white">{stats.total_citas || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-400 text-sm">Facturas generadas</span>
                  <span className="font-bold text-white">{stats.total_facturas || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[220px] overflow-y-auto">
                {activityLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{log.user}</p>
                      <p className="text-xs text-slate-400">{log.action.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-slate-500">{log.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          {(pendingUsers.length > 0 || pendingInvoices.length > 0) && (
            <Card className="bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-400" />Acciones Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingUsers.slice(0, 3).map(u => (
                  <div key={u.user_id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-violet-500"}`}>
                        {u.user_type === "business" ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.nombre}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleActivateUser(u.user_id)} disabled={updating === u.user_id} className="bg-emerald-600 hover:bg-emerald-700">
                      {updating === u.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 mr-1" />Activar</>}
                    </Button>
                  </div>
                ))}
                {pendingInvoices.slice(0, 2).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{inv.invoice_number}</p>
                        <p className="text-xs text-slate-400">${inv.total} pendiente</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleInvoiceStatus(inv.id, "paid")} className="bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-1" />Cobrar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Buscar por nombre o email..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="trial">En Trial</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Usuario</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Tipo</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Plan</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Estado</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Días Rest.</th>
                      <th className="text-left p-4 text-sm font-medium text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredUsers.map(u => (
                      <tr key={u.user_id} className="hover:bg-slate-700/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-violet-500"}`}>
                              {u.user_type === "business" ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium text-white">{u.nombre}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={u.user_type === "business" ? "border-blue-500 text-blue-400" : "border-violet-500 text-violet-400"}>
                            {u.user_type === "business" ? "Comercio" : "Personal"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={u.plan === "premium" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" : "bg-slate-600 text-slate-300"}>
                            {u.plan === "premium" ? "Premium" : "Básico"}
                          </Badge>
                        </td>
                        <td className="p-4">{getStatusBadge(u.subscription_status)}</td>
                        <td className="p-4">
                          {u.days_remaining !== null && (
                            <span className={`text-sm font-medium ${u.days_remaining <= 5 ? "text-red-400" : u.days_remaining <= 10 ? "text-amber-400" : "text-slate-300"}`}>
                              {u.days_remaining}d
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleViewMetrics(u)} className="text-slate-400 hover:text-cyan-400 hover:bg-slate-700" title="Ver Métricas">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setPlanDialog({ open: true, user: u, newPlan: u.plan === 'premium' ? 'free' : 'premium' })} className="text-slate-400 hover:text-amber-400 hover:bg-slate-700" title="Cambiar Plan">
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleResetPassword(u)} className="text-slate-400 hover:text-white hover:bg-slate-700" title="Reset Password">
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setPaymentDialog({ open: true, user: u, months: 1, plan: u.plan, amount: getPricing(u.user_type, u.plan) })} className="text-slate-400 hover:text-emerald-400 hover:bg-slate-700" title="Registrar Pago">
                              <CreditCard className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleSuspendUser(u.user_id)} className="text-slate-400 hover:text-red-400 hover:bg-slate-700" title="Suspender">
                              <Ban className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pending Activation */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-amber-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />Pendientes de Activación ({pendingUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingUsers.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No hay usuarios pendientes</p>
                ) : pendingUsers.map(u => (
                  <div key={u.user_id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-amber-500/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-violet-500"}`}>
                        {u.user_type === "business" ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.nombre}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                        <p className="text-xs text-slate-500">Registro: {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleActivateUser(u.user_id)} disabled={updating === u.user_id} className="bg-emerald-600 hover:bg-emerald-700">
                      {updating === u.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Play className="w-4 h-4 mr-1" />Activar</>}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Expired */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />Suscripciones Vencidas ({expiredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expiredUsers.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No hay suscripciones vencidas</p>
                ) : expiredUsers.map(u => (
                  <div key={u.user_id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-red-500/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.user_type === "business" ? "bg-blue-500" : "bg-violet-500"}`}>
                        {u.user_type === "business" ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.nombre}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                        <p className="text-lg font-bold text-emerald-400">${getPricing(u.user_type, u.plan)}/mes</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setPaymentDialog({ open: true, user: u, months: 1, plan: u.plan, amount: getPricing(u.user_type, u.plan) })} className="bg-emerald-600 hover:bg-emerald-700">
                      <CreditCard className="w-4 h-4 mr-1" />Registrar Pago
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{invoices.summary.total_invoices || 0}</p>
              <p className="text-sm text-slate-400">Total Facturas</p>
            </CardContent></Card>
            <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{invoices.summary.pending || 0}</p>
              <p className="text-sm text-slate-400">Pendientes</p>
            </CardContent></Card>
            <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">${invoices.summary.total_paid_amount || 0}</p>
              <p className="text-sm text-slate-400">Cobrado</p>
            </CardContent></Card>
            <Card className="bg-slate-800/50 border-slate-700"><CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">${invoices.summary.total_pending_amount || 0}</p>
              <p className="text-sm text-slate-400">Por Cobrar</p>
            </CardContent></Card>
          </div>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Historial de Facturas</CardTitle>
              <Button size="sm" variant="outline" onClick={() => exportToCSV(invoices.invoices, 'facturas')} className="border-slate-600 text-slate-300">
                <Download className="w-4 h-4 mr-2" />Exportar
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoices.invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-white">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-400">{inv.user_nombre} • {new Date(inv.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white">${inv.total}</span>
                    <Badge className={inv.status === "paid" ? "bg-emerald-500/20 text-emerald-300" : inv.status === "cancelled" ? "bg-red-500/20 text-red-300" : "bg-amber-500/20 text-amber-300"}>
                      {inv.status === "paid" ? "Pagada" : inv.status === "cancelled" ? "Cancelada" : "Pendiente"}
                    </Badge>
                    {inv.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleInvoiceStatus(inv.id, "paid")} className="text-emerald-400 hover:bg-emerald-500/20">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleInvoiceStatus(inv.id, "cancelled")} className="text-red-400 hover:bg-red-500/20">
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* MRR Report */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />Ingresos Recurrentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
                  <p className="text-4xl font-bold text-emerald-400">${subscriptions.summary.monthly_revenue || 0}</p>
                  <p className="text-sm text-slate-400 mt-1">MRR Actual</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ARR Proyectado</span>
                    <span className="text-white font-medium">${(subscriptions.summary.monthly_revenue || 0) * 12}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Promedio por Usuario</span>
                    <span className="text-white font-medium">${subscriptions.summary.total_users > 0 ? ((subscriptions.summary.monthly_revenue || 0) / subscriptions.summary.total_users).toFixed(2) : 0}</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={() => exportToCSV([{ mrr: subscriptions.summary.monthly_revenue, arr: (subscriptions.summary.monthly_revenue || 0) * 12, users: subscriptions.summary.total_users }], 'reporte_ingresos')}>
                  <FileDown className="w-4 h-4 mr-2" />Descargar Reporte
                </Button>
              </CardContent>
            </Card>

            {/* Retention Report */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-blue-400" />Retención de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-xl">
                  <p className="text-4xl font-bold text-blue-400">
                    {subscriptions.summary.total_users > 0 ? Math.round((activeUsers.length / subscriptions.summary.total_users) * 100) : 0}%
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Tasa de Retención</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Usuarios Activos</span>
                    <span className="text-emerald-400 font-medium">{activeUsers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Usuarios Inactivos</span>
                    <span className="text-red-400 font-medium">{expiredUsers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">En Trial</span>
                    <span className="text-amber-400 font-medium">{subscriptions.summary.in_trial || 0}</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <FileDown className="w-4 h-4 mr-2" />Descargar Reporte
                </Button>
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-400" />Distribución de Usuarios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">Personal Básico</span>
                      <span className="text-sm font-bold text-white">{stats.by_type?.personal_basic || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${((stats.by_type?.personal_basic || 0) / (subscriptions.summary.total_users || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">Personal Premium</span>
                      <span className="text-sm font-bold text-white">{stats.by_type?.personal_premium || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((stats.by_type?.personal_premium || 0) / (subscriptions.summary.total_users || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">Comercio Básico</span>
                      <span className="text-sm font-bold text-white">{stats.by_type?.business_basic || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((stats.by_type?.business_basic || 0) / (subscriptions.summary.total_users || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-300">Comercio Premium</span>
                      <span className="text-sm font-bold text-white">{stats.by_type?.business_premium || 0}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${((stats.by_type?.business_premium || 0) / (subscriptions.summary.total_users || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Trends */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />Tendencia de Crecimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="Usuarios" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="revenue" name="Ingresos ($)" stroke={COLORS.success} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab - Control de Precios de Servicios */}
        <TabsContent value="pricing" className="space-y-4">
          <PricingPanel />
        </TabsContent>

        {/* Costs Tab - Control de Costos Operativos */}
        <TabsContent value="costs" className="space-y-4">
          <CostsPanel />
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog.open} onOpenChange={(o) => setPaymentDialog({...paymentDialog, open: o})}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Registrar Pago</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-400">Usuario: <strong className="text-white">{paymentDialog.user?.nombre}</strong></p>
            <div>
              <label className="text-sm text-slate-400">Plan</label>
              <select className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg mt-1 text-white" value={paymentDialog.plan}
                onChange={(e) => { const plan = e.target.value; setPaymentDialog({...paymentDialog, plan, amount: getPricing(paymentDialog.user?.user_type, plan) * paymentDialog.months}); }}>
                <option value="free">Básico</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Meses</label>
              <Input type="number" min="1" max="12" value={paymentDialog.months} className="bg-slate-700 border-slate-600 text-white"
                onChange={(e) => { const months = parseInt(e.target.value) || 1; setPaymentDialog({...paymentDialog, months, amount: getPricing(paymentDialog.user?.user_type, paymentDialog.plan) * months}); }} />
            </div>
            <div className="p-4 bg-emerald-500/20 rounded-xl text-center">
              <p className="text-sm text-slate-400">Total a cobrar</p>
              <p className="text-3xl font-bold text-emerald-400">${paymentDialog.amount}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog({...paymentDialog, open: false})} className="border-slate-600 text-slate-300">Cancelar</Button>
            <Button onClick={handleSetPayment} className="bg-emerald-600 hover:bg-emerald-700">Confirmar Pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(o) => setPasswordDialog({...passwordDialog, open: o})}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Contraseña Temporal</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-300 text-sm">Comparte esta contraseña de forma segura con el usuario.</div>
            <p className="text-slate-400">Usuario: <strong className="text-white">{passwordDialog.user?.email}</strong></p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-700 px-4 py-3 rounded-lg font-mono text-lg text-white">{passwordDialog.tempPassword}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(passwordDialog.tempPassword)} className="border-slate-600">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setPasswordDialog({open: false, user: null, tempPassword: null})} className="bg-blue-600 hover:bg-blue-700">Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={planDialog.open} onOpenChange={(o) => setPlanDialog({...planDialog, open: o})}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Cambiar Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-slate-400">Usuario: <strong className="text-white">{planDialog.user?.nombre}</strong></p>
            <p className="text-slate-400">Email: <span className="text-white">{planDialog.user?.email}</span></p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${planDialog.newPlan === 'free' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 hover:border-slate-500'}`}
                onClick={() => setPlanDialog({...planDialog, newPlan: 'free'})}>
                <p className="font-bold text-lg">Básico</p>
                <p className="text-sm text-slate-400">${planDialog.user?.user_type === 'business' ? '15' : '5'}/mes</p>
              </div>
              <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${planDialog.newPlan === 'premium' ? 'border-amber-500 bg-amber-500/20' : 'border-slate-600 hover:border-slate-500'}`}
                onClick={() => setPlanDialog({...planDialog, newPlan: 'premium'})}>
                <p className="font-bold text-lg text-amber-400">Premium</p>
                <p className="text-sm text-slate-400">${planDialog.user?.user_type === 'business' ? '20' : '10'}/mes</p>
              </div>
            </div>
            <div className="p-3 bg-slate-700/50 rounded-lg text-center">
              <p className="text-sm text-slate-400">Plan actual: <span className={planDialog.user?.plan === 'premium' ? 'text-amber-400' : 'text-slate-300'}>{planDialog.user?.plan === 'premium' ? 'Premium' : 'Básico'}</span></p>
              <p className="text-sm text-slate-400 mt-1">Nuevo plan: <span className={planDialog.newPlan === 'premium' ? 'text-amber-400' : 'text-blue-400'}>{planDialog.newPlan === 'premium' ? 'Premium' : 'Básico'}</span></p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialog({open: false, user: null, newPlan: 'free'})} className="border-slate-600 text-slate-300">Cancelar</Button>
            <Button onClick={handleChangePlan} disabled={updating} className="bg-blue-600 hover:bg-blue-700">
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cambiar Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Metrics Dialog */}
      <Dialog open={metricsDialog.open} onOpenChange={(o) => { setMetricsDialog({...metricsDialog, open: o}); if (!o) setUserMetrics(null); }}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Métricas del Usuario</DialogTitle></DialogHeader>
          {userMetrics ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-xl">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${userMetrics.user?.user_type === 'business' ? 'bg-blue-500' : 'bg-violet-500'}`}>
                  {userMetrics.user?.user_type === 'business' ? <Building2 className="w-7 h-7 text-white" /> : <User className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <p className="font-bold text-lg">{userMetrics.user?.nombre}</p>
                  <p className="text-sm text-slate-400">{userMetrics.user?.email}</p>
                  {userMetrics.user?.nombre_negocio && <p className="text-sm text-blue-400">{userMetrics.user?.nombre_negocio}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-cyan-400">{userMetrics.metrics?.clientes || 0}</p>
                  <p className="text-xs text-slate-400">Clientes</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-violet-400">{userMetrics.metrics?.estilos || 0}</p>
                  <p className="text-xs text-slate-400">Estilos</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-400">{userMetrics.metrics?.productos || 0}</p>
                  <p className="text-xs text-slate-400">Productos</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-400">{userMetrics.metrics?.facturas || 0}</p>
                  <p className="text-xs text-slate-400">Facturas</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-400">${userMetrics.financials?.total_revenue?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-slate-400">Ingresos</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-400">${userMetrics.financials?.total_gastos?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-slate-400">Gastos</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl">
                <p className="text-sm text-slate-300">Rentabilidad Estimada</p>
                <p className="text-3xl font-bold text-emerald-400">${userMetrics.financials?.rentabilidad_estimada?.toFixed(2) || '0.00'}</p>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>Registro: {userMetrics.created_at ? new Date(userMetrics.created_at).toLocaleDateString() : 'N/A'}</p>
                <p>Último acceso: {userMetrics.last_login ? new Date(userMetrics.last_login).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          <DialogFooter><Button onClick={() => { setMetricsDialog({open: false, user: null}); setUserMetrics(null); }} className="bg-blue-600 hover:bg-blue-700">Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Pricing Panel Component
function PricingPanel() {
  const [pricing, setPricing] = useState({
    personal_basic: 5,
    personal_premium: 12,
    business_basic: 15,
    business_premium: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const token = localStorage.getItem('nailcost_token');
      const res = await fetch(`${API}/admin/platform-pricing`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('nailcost_token');
      const res = await fetch(`${API}/admin/platform-pricing`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pricing)
      });
      if (res.ok) {
        toast.success("Precios actualizados");
      } else {
        toast.error("Error al guardar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Control de Precios de Suscripción
          </CardTitle>
          <p className="text-slate-400 text-sm">Modifica los precios mensuales de cada plan</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-violet-400" />
                Plan Personal
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <label className="text-sm text-slate-400">Básico (USD/mes)</label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">$</span>
                    <Input 
                      type="number" 
                      value={pricing.personal_basic}
                      onChange={(e) => setPricing({...pricing, personal_basic: parseFloat(e.target.value) || 0})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-xl border border-violet-500/30">
                  <label className="text-sm text-violet-300">Premium (USD/mes)</label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">$</span>
                    <Input 
                      type="number" 
                      value={pricing.personal_premium}
                      onChange={(e) => setPricing({...pricing, personal_premium: parseFloat(e.target.value) || 0})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Plan Negocio
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <label className="text-sm text-slate-400">Básico (USD/mes)</label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">$</span>
                    <Input 
                      type="number" 
                      value={pricing.business_basic}
                      onChange={(e) => setPricing({...pricing, business_basic: parseFloat(e.target.value) || 0})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                  <label className="text-sm text-blue-300">Premium (USD/mes)</label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">$</span>
                    <Input 
                      type="number" 
                      value={pricing.business_premium}
                      onChange={(e) => setPricing({...pricing, business_premium: parseFloat(e.target.value) || 0})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700">
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Guardar Precios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Costs Panel Component
function CostsPanel() {
  const [costs, setCosts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCost, setNewCost] = useState({ nombre: '', categoria: 'hosting', costo_mensual: 0, proveedor: '', notas: '' });

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const token = localStorage.getItem('nailcost_token');
      const res = await fetch(`${API}/admin/operational-costs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCosts(data.costs || []);
        setSummary(data.summary || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCost = async () => {
    try {
      const token = localStorage.getItem('nailcost_token');
      const res = await fetch(`${API}/admin/operational-costs`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCost)
      });
      if (res.ok) {
        toast.success("Costo agregado");
        setShowAddDialog(false);
        setNewCost({ nombre: '', categoria: 'hosting', costo_mensual: 0, proveedor: '', notas: '' });
        fetchCosts();
      }
    } catch (err) {
      toast.error("Error al agregar");
    }
  };

  const handleDeleteCost = async (costId) => {
    if (!confirm("¿Eliminar este costo?")) return;
    try {
      const token = localStorage.getItem('nailcost_token');
      await fetch(`${API}/admin/operational-costs/${costId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("Costo eliminado");
      fetchCosts();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const categoryIcons = {
    hosting: Server,
    database: Database,
    domain: Globe,
    api: Zap,
    other: Settings
  };

  const categoryColors = {
    hosting: 'text-blue-400 bg-blue-500/20',
    database: 'text-emerald-400 bg-emerald-500/20',
    domain: 'text-violet-400 bg-violet-500/20',
    api: 'text-amber-400 bg-amber-500/20',
    other: 'text-slate-400 bg-slate-500/20'
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const isRentable = summary.rentabilidad >= 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Costos Mensuales</p>
            <p className="text-2xl font-bold text-white">${summary.total_mensual || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Ingresos Estimados</p>
            <p className="text-2xl font-bold text-emerald-400">${summary.ingresos_estimados || 0}</p>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${isRentable ? 'from-emerald-500/20 to-green-500/20 border-emerald-500/30' : 'from-red-500/20 to-pink-500/20 border-red-500/30'}`}>
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Rentabilidad</p>
            <p className={`text-2xl font-bold ${isRentable ? 'text-emerald-400' : 'text-red-400'}`}>
              {isRentable ? '+' : ''}${summary.rentabilidad || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-500/30">
          <CardContent className="p-4">
            <p className="text-sm text-slate-400">Precio Mín. Recomendado</p>
            <p className="text-2xl font-bold text-amber-400">${summary.precio_minimo_recomendado || 0}</p>
            <p className="text-xs text-slate-500">por usuario/mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Advisory Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Análisis de Rentabilidad</h3>
              <p className="text-slate-400 text-sm mt-1">
                Con <strong className="text-white">{summary.active_users || 0}</strong> usuarios activos de <strong className="text-white">{summary.total_users || 0}</strong> totales, 
                {isRentable 
                  ? <span className="text-emerald-400"> tu plataforma es rentable con un margen de ${summary.rentabilidad}.</span>
                  : <span className="text-red-400"> necesitas {summary.break_even_users || '?'} usuarios al precio mínimo para alcanzar el punto de equilibrio.</span>
                }
              </p>
              {!isRentable && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-300 text-sm">
                    💡 <strong>Recomendación:</strong> Considera subir el precio base a ${summary.precio_minimo_recomendado} USD o conseguir al menos {summary.break_even_users} usuarios activos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            Costos Operativos
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Play className="w-4 h-4 mr-2" />Agregar Costo
          </Button>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay costos registrados</p>
          ) : (
            <div className="space-y-3">
              {costs.map(cost => {
                const Icon = categoryIcons[cost.categoria] || Settings;
                const colorClass = categoryColors[cost.categoria] || categoryColors.other;
                return (
                  <div key={cost.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{cost.nombre}</p>
                        <p className="text-xs text-slate-400">{cost.proveedor} • {cost.categoria}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-lg font-bold text-white">${cost.costo_mensual}/mes</p>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCost(cost.id)} className="text-red-400 hover:bg-red-500/20">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Cost Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader><DialogTitle>Agregar Costo Operativo</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-slate-400">Nombre</label>
              <Input 
                value={newCost.nombre} 
                onChange={(e) => setNewCost({...newCost, nombre: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Ej: Servidor DigitalOcean"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Categoría</label>
              <select 
                value={newCost.categoria}
                onChange={(e) => setNewCost({...newCost, categoria: e.target.value})}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg mt-1 text-white"
              >
                <option value="hosting">Hosting</option>
                <option value="database">Base de Datos</option>
                <option value="domain">Dominio</option>
                <option value="api">API / Servicio</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Costo Mensual (USD)</label>
              <Input 
                type="number"
                value={newCost.costo_mensual} 
                onChange={(e) => setNewCost({...newCost, costo_mensual: parseFloat(e.target.value) || 0})}
                className="bg-slate-700 border-slate-600 text-white mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Proveedor</label>
              <Input 
                value={newCost.proveedor} 
                onChange={(e) => setNewCost({...newCost, proveedor: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Ej: DigitalOcean, AWS, etc."
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Notas</label>
              <Input 
                value={newCost.notas} 
                onChange={(e) => setNewCost({...newCost, notas: e.target.value})}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Opcional"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-slate-600 text-slate-300">Cancelar</Button>
            <Button onClick={handleAddCost} className="bg-emerald-600 hover:bg-emerald-700">Agregar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AdminPage };
