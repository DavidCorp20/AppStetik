import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Users, 
  Crown, 
  Package, 
  Palette, 
  Sparkles, 
  UserCheck,
  Loader2,
  Shield,
  TrendingUp,
  Calendar,
  DollarSign,
  Key,
  UserX,
  UserPlus,
  Search,
  Building2,
  User,
  Copy,
  Check,
  AlertTriangle,
  BarChart3,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Password reset dialog
  const [resetDialog, setResetDialog] = useState({ open: false, user: null, tempPassword: null });
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
      const [usersRes, statsRes, revenueRes] = await Promise.all([
        authAxios.get(`${API}/admin/users`),
        authAxios.get(`${API}/admin/stats`),
        authAxios.get(`${API}/admin/revenue`),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setRevenue(revenueRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos de administración");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (userId, newPlan) => {
    setUpdating(userId);
    try {
      await authAxios.put(`${API}/admin/users/${userId}/plan?plan=${newPlan}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
      toast.success(`Plan actualizado a ${newPlan === "premium" ? "Premium" : "Básico"}`);
      fetchData(); // Refresh revenue
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
      toast.success("Contraseña blanqueada exitosamente");
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
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_disabled: res.data.is_disabled } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al cambiar estado");
    } finally {
      setUpdating(null);
    }
  };

  const handleChangeType = async (userId, newType) => {
    setUpdating(userId);
    try {
      await authAxios.put(`${API}/admin/users/${userId}/type?user_type=${newType}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_type: newType } : u));
      toast.success(`Tipo actualizado a ${newType === "business" ? "Comercio" : "Personal"}`);
      fetchData();
    } catch (err) {
      toast.error("Error al cambiar tipo");
    } finally {
      setUpdating(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.nombre_negocio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
                       (filterType === "personal" && u.user_type === "personal") ||
                       (filterType === "business" && u.user_type === "business") ||
                       (filterType === "premium" && u.plan === "premium") ||
                       (filterType === "disabled" && u.is_disabled);
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
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">
              Panel de Administración
            </h1>
            <p className="text-stone-500">Control total de NailCost Pro</p>
          </div>
        </div>
        <Button onClick={fetchData} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </Button>
      </div>

      {/* Revenue Card - Destacada */}
      {revenue && (
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 border-0 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Ingresos Mensuales Proyectados</p>
                <p className="text-4xl font-bold">${revenue.revenue.monthly.toFixed(2)}</p>
                <p className="text-emerald-100 text-sm mt-1">
                  ${revenue.revenue.annual.toFixed(2)} / año
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-xs text-emerald-100">Personal Básico</p>
                  <p className="text-lg font-bold">{revenue.subscribers.personal_basic}</p>
                  <p className="text-xs text-emerald-200">${revenue.pricing.personal.basic}/mes c/u</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-xs text-emerald-100">Personal Premium</p>
                  <p className="text-lg font-bold">{revenue.subscribers.personal_premium}</p>
                  <p className="text-xs text-emerald-200">${revenue.pricing.personal.premium}/mes c/u</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-xs text-emerald-100">Comercio Básico</p>
                  <p className="text-lg font-bold">{revenue.subscribers.business_basic}</p>
                  <p className="text-xs text-emerald-200">${revenue.pricing.business.basic}/mes c/u</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
                  <p className="text-xs text-emerald-100">Comercio Premium</p>
                  <p className="text-lg font-bold">{revenue.subscribers.business_premium}</p>
                  <p className="text-xs text-emerald-200">${revenue.pricing.business.premium}/mes c/u</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.total_users}</p>
                  <p className="text-xs text-stone-500">Total usuarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.active_users || 0}</p>
                  <p className="text-xs text-stone-500">Activos (30d)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.premium_users}</p>
                  <p className="text-xs text-stone-500">Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.by_type?.personal_basic + stats.by_type?.personal_premium || 0}</p>
                  <p className="text-xs text-stone-500">Personales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.by_type?.business_basic + stats.by_type?.business_premium || 0}</p>
                  <p className="text-xs text-stone-500">Comercios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.disabled_users || 0}</p>
                  <p className="text-xs text-stone-500">Deshabilitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Buscar por nombre, email o negocio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "personal", "business", "premium", "disabled"].map((type) => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(type)}
              className={filterType === type ? "bg-violet-600 hover:bg-violet-700" : ""}
            >
              {type === "all" && "Todos"}
              {type === "personal" && "Personal"}
              {type === "business" && "Comercio"}
              {type === "premium" && "Premium"}
              {type === "disabled" && "Deshabilitados"}
            </Button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <Card className="bg-white border-stone-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuarios Registrados ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div 
                key={u.id} 
                className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 rounded-xl gap-4 transition-colors ${
                  u.is_disabled ? "bg-red-50 border border-red-200" : "bg-stone-50"
                }`}
                data-testid={`user-row-${u.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                    u.user_type === "business" 
                      ? "bg-gradient-to-br from-indigo-500 to-blue-600" 
                      : "bg-gradient-to-br from-pink-500 to-rose-600"
                  }`}>
                    {u.user_type === "business" 
                      ? <Building2 className="w-5 h-5" /> 
                      : u.nombre?.charAt(0)?.toUpperCase() || "?"
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-stone-800">{u.nombre}</p>
                      {u.role === "admin" && (
                        <Badge className="bg-violet-100 text-violet-700 text-xs">Admin</Badge>
                      )}
                      <Badge className={u.user_type === "business" ? "bg-indigo-100 text-indigo-700" : "bg-pink-100 text-pink-700"}>
                        {u.user_type === "business" ? "Comercio" : "Personal"}
                      </Badge>
                      <Badge className={u.plan === "premium" ? "bg-amber-100 text-amber-700" : "bg-stone-200 text-stone-600"}>
                        {u.plan === "premium" ? "Premium" : "Básico"}
                      </Badge>
                      {u.is_disabled && (
                        <Badge className="bg-red-100 text-red-700">Deshabilitado</Badge>
                      )}
                    </div>
                    <p className="text-sm text-stone-500">{u.email}</p>
                    {u.nombre_negocio && (
                      <p className="text-xs text-stone-400">{u.nombre_negocio}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <div className="flex items-center gap-1" title="Productos">
                    <Package className="w-3.5 h-3.5" />
                    <span>{u.stats?.productos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Estilos">
                    <Palette className="w-3.5 h-3.5" />
                    <span>{u.stats?.estilos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Diseños">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{u.stats?.disenos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Clientes">
                    <Users className="w-3.5 h-3.5" />
                    <span>{u.stats?.clientes || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                {u.role !== "admin" && (
                  <div className="flex gap-2 flex-wrap">
                    {/* Plan buttons */}
                    {u.plan === "free" ? (
                      <Button
                        size="sm"
                        onClick={() => handleChangePlan(u.id, "premium")}
                        disabled={updating === u.id}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                      >
                        {updating === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Crown className="w-4 h-4 mr-1" />Premium</>}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangePlan(u.id, "free")}
                        disabled={updating === u.id}
                        className="rounded-lg"
                      >
                        {updating === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Quitar Premium"}
                      </Button>
                    )}

                    {/* Type toggle */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChangeType(u.id, u.user_type === "business" ? "personal" : "business")}
                      disabled={updating === u.id}
                      className="rounded-lg"
                    >
                      {u.user_type === "business" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                    </Button>

                    {/* Reset password */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResetPassword(u)}
                      disabled={updating === u.id}
                      className="rounded-lg"
                      title="Blanquear contraseña"
                    >
                      <Key className="w-4 h-4" />
                    </Button>

                    {/* Enable/Disable */}
                    <Button
                      size="sm"
                      variant={u.is_disabled ? "default" : "outline"}
                      onClick={() => handleToggleStatus(u.id)}
                      disabled={updating === u.id}
                      className={`rounded-lg ${u.is_disabled ? "bg-emerald-500 hover:bg-emerald-600" : "text-red-600 hover:bg-red-50"}`}
                      title={u.is_disabled ? "Habilitar usuario" : "Deshabilitar usuario"}
                    >
                      {u.is_disabled ? <UserPlus className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialog.open} onOpenChange={(open) => setResetDialog({ ...resetDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-violet-600" />
              Contraseña Temporal
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Importante</p>
                  <p>Comparte esta contraseña con el usuario de forma segura. Deberá cambiarla al iniciar sesión.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-stone-500 mb-1">Usuario</p>
              <p className="font-medium">{resetDialog.user?.nombre}</p>
              <p className="text-sm text-stone-500">{resetDialog.user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-stone-500 mb-1">Nueva contraseña temporal</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-stone-100 px-4 py-2 rounded-lg font-mono text-lg">
                  {resetDialog.tempPassword}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(resetDialog.tempPassword)}
                  className="gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setResetDialog({ open: false, user: null, tempPassword: null })}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { AdminPage };
