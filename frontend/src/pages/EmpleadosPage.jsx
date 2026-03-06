import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Users, 
  Edit2, 
  Trash2, 
  Search,
  Phone,
  Mail,
  Briefcase,
  Percent,
  Loader2,
  UserCheck,
  UserX,
  Building2
} from "lucide-react";
import { toast } from "sonner";

export default function EmpleadosPage() {
  const { user, isBusinessUser } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    especialidad: "",
    comision_porcentaje: 0,
  });

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/empleados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEmpleados(await res.json());
      }
    } catch (err) {
      toast.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('nailcost_token');

    try {
      const url = editingEmpleado 
        ? `${API}/empleados/${editingEmpleado.id}`
        : `${API}/empleados`;
      
      const res = await fetch(url, {
        method: editingEmpleado ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editingEmpleado ? "Empleado actualizado" : "Empleado agregado");
        fetchEmpleados();
        resetForm();
      } else {
        const error = await res.json();
        toast.error(error.detail || "Error al guardar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/empleados/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setEmpleados(prev => prev.filter(e => e.id !== id));
        toast.success("Empleado eliminado");
      }
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const handleToggleActive = async (empleado) => {
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/empleados/${empleado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...empleado, activo: !empleado.activo })
      });
      if (res.ok) {
        fetchEmpleados();
        toast.success(empleado.activo ? "Empleado desactivado" : "Empleado activado");
      }
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      telefono: "",
      especialidad: "",
      comision_porcentaje: 0,
    });
    setEditingEmpleado(null);
    setDialogOpen(false);
  };

  const openEditDialog = (empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre,
      email: empleado.email || "",
      telefono: empleado.telefono || "",
      especialidad: empleado.especialidad || "",
      comision_porcentaje: empleado.comision_porcentaje || 0,
    });
    setDialogOpen(true);
  };

  const filteredEmpleados = empleados.filter(e =>
    e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = empleados.filter(e => e.activo).length;

  if (!isBusinessUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <Building2 className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">Función de Negocio</h2>
        <p className="text-[#64748B] max-w-md">
          La gestión de empleados está disponible para cuentas de tipo Negocio.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="empleados-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Equipo de Trabajo
            </h1>
            <p className="text-sm text-[#64748B]">{activeCount} activos de {empleados.length} total</p>
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white rounded-xl"
              data-testid="add-empleado-btn"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                {editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre completo"
                  required
                  className="rounded-xl"
                  data-testid="empleado-nombre-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@ejemplo.com"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <Input
                      value={formData.telefono}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="+52 123 456 7890"
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Especialidad</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <Input
                    value={formData.especialidad}
                    onChange={(e) => setFormData(prev => ({ ...prev, especialidad: e.target.value }))}
                    placeholder="Ej: Acrílicas, Gel, Pedicure..."
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comisión (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.comision_porcentaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, comision_porcentaje: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl"
                  data-testid="save-empleado-btn"
                >
                  {editingEmpleado ? "Guardar" : "Agregar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
        <Input
          placeholder="Buscar por nombre o especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 rounded-xl border-purple-100 focus:border-purple-300"
          data-testid="empleados-search"
        />
      </div>

      {/* Employees Grid */}
      {filteredEmpleados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmpleados.map((empleado) => (
            <Card 
              key={empleado.id} 
              className={`border-purple-100 hover:shadow-lg transition-shadow ${!empleado.activo ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      empleado.activo 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                        : 'bg-gray-400'
                    }`}>
                      {empleado.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A2E]">{empleado.nombre}</h3>
                      <p className="text-sm text-[#64748B]">{empleado.especialidad || 'General'}</p>
                    </div>
                  </div>
                  <Badge 
                    className={empleado.activo 
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                    }
                  >
                    {empleado.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {empleado.email && (
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{empleado.email}</span>
                    </div>
                  )}
                  {empleado.telefono && (
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Phone className="w-4 h-4" />
                      <span>{empleado.telefono}</span>
                    </div>
                  )}
                  {empleado.comision_porcentaje > 0 && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Percent className="w-4 h-4" />
                      <span>{empleado.comision_porcentaje}% comisión</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(empleado)}
                    className="flex-1 rounded-lg border-purple-200 hover:bg-purple-50"
                  >
                    {empleado.activo ? (
                      <><UserX className="w-4 h-4 mr-1" /> Desactivar</>
                    ) : (
                      <><UserCheck className="w-4 h-4 mr-1" /> Activar</>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(empleado)}
                    className="rounded-lg hover:bg-purple-50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(empleado.id)}
                    className="rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">
            {searchTerm ? "Sin resultados" : "Sin empleados"}
          </h3>
          <p className="text-[#64748B] mb-4">
            {searchTerm 
              ? "Intenta con otro término de búsqueda" 
              : "Agrega empleados para gestionar tu equipo"}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Primer Empleado
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { EmpleadosPage };
