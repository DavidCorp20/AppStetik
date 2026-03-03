import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

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
      const [usersRes, statsRes] = await Promise.all([
        authAxios.get(`${API}/admin/users`),
        authAxios.get(`${API}/admin/stats`),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
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
    } catch (err) {
      toast.error("Error al actualizar plan");
    } finally {
      setUpdating(null);
    }
  };

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Panel de Administración
          </h1>
          <p className="text-stone-500">Gestión de usuarios y planes</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.total_users}</p>
                  <p className="text-xs text-stone-500">Usuarios totales</p>
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
                  <p className="text-xs text-stone-500">Plan Premium</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-stone-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.free_users}</p>
                  <p className="text-xs text-stone-500">Plan Básico</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-stone-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-800">{stats.total_citas}</p>
                  <p className="text-xs text-stone-500">Citas totales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users List */}
      <Card className="bg-white border-stone-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            <Users className="w-5 h-5" />
            Usuarios Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((u) => (
              <div 
                key={u.id} 
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-stone-50 rounded-xl gap-4"
                data-testid={`user-row-${u.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-white font-medium">
                    {u.nombre?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-stone-800">{u.nombre}</p>
                      {u.role === "admin" && (
                        <Badge className="bg-violet-100 text-violet-700 text-xs">Admin</Badge>
                      )}
                      <Badge className={u.plan === "premium" ? "bg-amber-100 text-amber-700" : "bg-stone-200 text-stone-600"}>
                        {u.plan === "premium" ? "Premium" : "Básico"}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-500">{u.email}</p>
                    {u.nombre_negocio && (
                      <p className="text-xs text-stone-400">{u.nombre_negocio}</p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <div className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    <span>{u.stats?.productos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>{u.stats?.estilos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{u.stats?.disenos || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{u.stats?.clientes || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                {u.role !== "admin" && (
                  <div className="flex gap-2">
                    {u.plan === "free" ? (
                      <Button
                        size="sm"
                        onClick={() => handleChangePlan(u.id, "premium")}
                        disabled={updating === u.id}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                        data-testid={`upgrade-btn-${u.id}`}
                      >
                        {updating === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Crown className="w-4 h-4 mr-1" />
                            Dar Premium
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleChangePlan(u.id, "free")}
                        disabled={updating === u.id}
                        className="rounded-lg"
                        data-testid={`downgrade-btn-${u.id}`}
                      >
                        {updating === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Quitar Premium"
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { AdminPage };
