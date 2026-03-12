/**
 * FASE 2: Página de Gestión de Usuarios del Negocio
 * Permite al owner crear, editar y gestionar sub-usuarios con roles y permisos
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Key,
  Mail,
  Phone,
  Clock,
  UserCheck,
  UserX,
  Crown,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Search,
  MoreVertical,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const roleIcons = {
  owner: Crown,
  administrador: ShieldCheck,
  empleado: Shield,
};

const roleColors = {
  owner: "bg-amber-100 text-amber-800 border-amber-200",
  administrador: "bg-blue-100 text-blue-800 border-blue-200",
  empleado: "bg-stone-100 text-stone-700 border-stone-200",
};

const roleLabels = {
  owner: "Propietario",
  administrador: "Administrador",
  empleado: "Empleado",
};

const emptyForm = {
  nombre: "",
  email: "",
  password: "",
  telefono: "",
  role: "empleado",
  especialidad: "",
  comision_porcentaje: 0,
  permissions: [],
};

export default function GestionUsuariosPage() {
  const { user } = useAuth();
  const { canManageUsers, loading: permLoading } = usePermissions();
  
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState({});
  const [permissionsByCategory, setPermissionsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToReset, setUserToReset] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customPermissions, setCustomPermissions] = useState(false);

  const token = localStorage.getItem('nailcost_token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        fetch(`${API}/business/users`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${API}/business/roles`, { headers: { Authorization: `Bearer ${token}` }}),
        fetch(`${API}/business/permissions`, { headers: { Authorization: `Bearer ${token}` }}),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (permsRes.ok) {
        const permData = await permsRes.json();
        setAllPermissions(permData.permissions || {});
        setPermissionsByCategory(permData.by_category || {});
      }
    } catch (err) {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        nombre: userToEdit.nombre,
        email: userToEdit.email,
        password: "",
        telefono: userToEdit.telefono || "",
        role: userToEdit.role,
        especialidad: userToEdit.especialidad || "",
        comision_porcentaje: userToEdit.comision_porcentaje || 0,
        permissions: userToEdit.permissions || [],
      });
      // Check if user has custom permissions
      const defaultPerms = roles.find(r => r.id === userToEdit.role)?.permissions || [];
      const hasCustom = JSON.stringify([...userToEdit.permissions].sort()) !== JSON.stringify([...defaultPerms].sort());
      setCustomPermissions(hasCustom);
    } else {
      setEditingUser(null);
      setFormData(emptyForm);
      setCustomPermissions(false);
    }
    setDialogOpen(true);
  };

  const handleRoleChange = (newRole) => {
    const roleData = roles.find(r => r.id === newRole);
    setFormData(prev => ({
      ...prev,
      role: newRole,
      permissions: customPermissions ? prev.permissions : (roleData?.permissions || []),
    }));
  };

  const handlePermissionToggle = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingUser 
        ? `${API}/business/users/${editingUser.id}`
        : `${API}/business/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const body = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        role: formData.role,
        especialidad: formData.especialidad,
        comision_porcentaje: parseFloat(formData.comision_porcentaje) || 0,
        permissions: customPermissions ? formData.permissions : undefined,
      };

      // Only include email and password for new users
      if (!editingUser) {
        body.email = formData.email;
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingUser ? "Usuario actualizado" : "Usuario creado exitosamente");
        setDialogOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Error al guardar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      const res = await fetch(`${API}/business/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Usuario eliminado");
        fetchData();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Error al eliminar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleResetPassword = async () => {
    if (!userToReset) return;

    try {
      const res = await fetch(`${API}/business/users/${userToReset.id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTempPassword(data.temp_password);
        toast.success("Contraseña restablecida");
      } else {
        toast.error("Error al restablecer contraseña");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      const res = await fetch(`${API}/business/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !currentStatus }),
      });

      if (res.ok) {
        toast.success(currentStatus ? "Usuario desactivado" : "Usuario activado");
        fetchData();
      }
    } catch (err) {
      toast.error("Error al cambiar estado");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const filteredUsers = users.filter(u =>
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check permissions
  if (permLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A5F]" />
      </div>
    );
  }

  if (!canManageUsers()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="gestion-usuarios-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1E3A5F]">
            Gestión de Usuarios
          </h1>
          <p className="text-[#64748B] mt-1">
            Administra el equipo de tu negocio
          </p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white rounded-xl"
          data-testid="add-user-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-[#1E3A5F] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#1E3A5F]">{users.length}</p>
            <p className="text-xs text-[#64748B]">Total Usuarios</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-emerald-600">
              {users.filter(u => u.activo).length}
            </p>
            <p className="text-xs text-[#64748B]">Activos</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4 text-center">
            <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'administrador').length}
            </p>
            <p className="text-xs text-[#64748B]">Admins</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 text-stone-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-stone-600">
              {users.filter(u => u.role === 'empleado').length}
            </p>
            <p className="text-xs text-[#64748B]">Empleados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-xl border-stone-200"
          data-testid="search-users"
        />
      </div>

      {/* Users List */}
      <Card className="bg-white border-stone-100">
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">
                {searchTerm ? "No se encontraron usuarios" : "No hay usuarios registrados"}
              </p>
              {!searchTerm && (
                <Button 
                  variant="link" 
                  onClick={() => handleOpenDialog()}
                  className="text-[#1E3A5F] mt-2"
                >
                  Agregar primer usuario
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {filteredUsers.map((userItem) => {
                const RoleIcon = roleIcons[userItem.role] || Shield;
                
                return (
                  <div 
                    key={userItem.id}
                    className="p-4 hover:bg-stone-50 transition-colors"
                    data-testid={`user-card-${userItem.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          userItem.activo 
                            ? 'bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6]' 
                            : 'bg-stone-300'
                        }`}>
                          <span className="text-white font-bold text-lg">
                            {userItem.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[#1E3A5F] truncate">
                              {userItem.nombre}
                            </p>
                            <Badge className={`${roleColors[userItem.role]} text-xs`}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {roleLabels[userItem.role]}
                            </Badge>
                            {!userItem.activo && (
                              <Badge variant="outline" className="text-rose-600 border-rose-200 text-xs">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-[#64748B]">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {userItem.email}
                            </span>
                            {userItem.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {userItem.telefono}
                              </span>
                            )}
                            {userItem.last_login && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Último acceso: {new Date(userItem.last_login).toLocaleDateString('es-ES')}
                              </span>
                            )}
                          </div>

                          {userItem.especialidad && (
                            <p className="text-xs text-[#94A3B8] mt-1">
                              Especialidad: {userItem.especialidad}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={userItem.activo}
                          onCheckedChange={() => handleToggleActive(userItem.id, userItem.activo)}
                          data-testid={`toggle-user-${userItem.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserToReset(userItem);
                            setTempPassword(null);
                            setResetPasswordDialog(true);
                          }}
                          className="h-9 w-9 p-0 rounded-lg"
                          title="Restablecer contraseña"
                        >
                          <Key className="w-4 h-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(userItem)}
                          className="h-9 w-9 p-0 rounded-lg"
                          data-testid={`edit-user-${userItem.id}`}
                        >
                          <Pencil className="w-4 h-4 text-[#64748B]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(userItem);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-9 w-9 p-0 rounded-lg"
                          data-testid={`delete-user-${userItem.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-[#1E3A5F]">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Modifica los datos del usuario"
                : "Crea un nuevo usuario para tu equipo"
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="María García"
                      className="rounded-xl mt-1"
                      required
                      data-testid="user-nombre-input"
                    />
                  </div>

                  {!editingUser && (
                    <>
                      <div className="col-span-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="maria@ejemplo.com"
                          className="rounded-xl mt-1"
                          required
                          data-testid="user-email-input"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="password">Contraseña *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="Mínimo 8 caracteres"
                            className="rounded-xl mt-1 pr-10"
                            required
                            minLength={8}
                            data-testid="user-password-input"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="04141234567"
                      className="rounded-xl mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="especialidad">Especialidad</Label>
                    <Input
                      id="especialidad"
                      value={formData.especialidad}
                      onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                      placeholder="Manicurista"
                      className="rounded-xl mt-1"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <Label>Rol del usuario *</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="rounded-xl mt-1" data-testid="user-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.filter(r => r.id !== 'owner').map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            {role.id === 'administrador' ? (
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Shield className="w-4 h-4 text-stone-500" />
                            )}
                            <span>{role.nombre}</span>
                            <span className="text-xs text-stone-400">
                              ({role.total_permissions} permisos)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-stone-500 mt-1">
                    {roles.find(r => r.id === formData.role)?.descripcion}
                  </p>
                </div>

                {/* Custom Permissions Toggle */}
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div>
                    <Label className="font-medium">Permisos personalizados</Label>
                    <p className="text-xs text-stone-500">
                      Ajusta los permisos manualmente
                    </p>
                  </div>
                  <Switch
                    checked={customPermissions}
                    onCheckedChange={(checked) => {
                      setCustomPermissions(checked);
                      if (!checked) {
                        const roleData = roles.find(r => r.id === formData.role);
                        setFormData(prev => ({
                          ...prev,
                          permissions: roleData?.permissions || []
                        }));
                      }
                    }}
                  />
                </div>

                {/* Permissions Grid */}
                {customPermissions && (
                  <div className="border border-stone-200 rounded-xl p-4 space-y-4">
                    <p className="text-sm font-medium text-[#1E3A5F]">
                      Permisos ({formData.permissions.length} seleccionados)
                    </p>
                    
                    {Object.entries(permissionsByCategory).map(([category, perms]) => (
                      <div key={category}>
                        <p className="text-xs font-semibold text-stone-500 uppercase mb-2">
                          {category}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-stone-50 cursor-pointer"
                            >
                              <Checkbox
                                checked={formData.permissions.includes(perm.id)}
                                onCheckedChange={() => handlePermissionToggle(perm.id)}
                              />
                              <span className="text-sm">{perm.nombre}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Commission */}
                <div>
                  <Label htmlFor="comision">Comisión por servicio (%)</Label>
                  <Input
                    id="comision"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.comision_porcentaje}
                    onChange={(e) => setFormData({...formData, comision_porcentaje: e.target.value})}
                    placeholder="0"
                    className="rounded-xl mt-1"
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-3 pt-4 mt-4 border-t border-stone-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#1E3A5F] hover:bg-[#2D4A6F] text-white rounded-xl"
                data-testid="save-user-btn"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingUser ? "Actualizar" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a <strong>{userToDelete?.nombre}</strong> y no podrá recuperarse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onOpenChange={setResetPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1E3A5F]">
              Restablecer Contraseña
            </DialogTitle>
            <DialogDescription>
              {userToReset?.nombre}
            </DialogDescription>
          </DialogHeader>

          {tempPassword ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-800 mb-2">
                  Nueva contraseña temporal:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded-lg font-mono text-lg">
                    {tempPassword}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(tempPassword)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-stone-500">
                El usuario deberá cambiar esta contraseña al iniciar sesión.
              </p>
              <Button
                onClick={() => {
                  setResetPasswordDialog(false);
                  setTempPassword(null);
                  setUserToReset(null);
                }}
                className="w-full rounded-xl"
              >
                Entendido
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-stone-600">
                Se generará una nueva contraseña temporal que el usuario deberá cambiar al iniciar sesión.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordDialog(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleResetPassword}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restablecer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { GestionUsuariosPage };
