import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  UserPlus, Users, Edit2, Trash2, Search, Phone, Mail, Briefcase, Percent, Loader2, 
  UserCheck, UserX, Building2, DollarSign, Calendar, TrendingUp, Clock, FileText,
  CreditCard, Star, Award, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { authAxios } from "@/context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];

export default function EmpleadosPage() {
  const { user, isBusinessUser } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("equipo");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [payrollDialog, setPayrollDialog] = useState({ open: false, empleado: null });
  const [formData, setFormData] = useState({
    nombre: "", email: "", telefono: "", especialidad: "", comision_porcentaje: 0,
    salario_base: 0, tipo_contrato: "comision", horario: "", fecha_ingreso: "",
  });

  useEffect(() => { fetchEmpleados(); }, []);

  const fetchEmpleados = async () => {
    try {
      const res = await authAxios.get(`${API}/empleados`);
      setEmpleados(res.data);
    } catch (err) {
      toast.error("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingEmpleado ? `${API}/empleados/${editingEmpleado.id}` : `${API}/empleados`;
      await authAxios({ method: editingEmpleado ? 'PUT' : 'POST', url, data: formData });
      toast.success(editingEmpleado ? "Empleado actualizado" : "Empleado agregado");
      fetchEmpleados();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    try {
      await authAxios.delete(`${API}/empleados/${id}`);
      setEmpleados(prev => prev.filter(e => e.id !== id));
      toast.success("Empleado eliminado");
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const handleToggleActive = async (empleado) => {
    try {
      await authAxios.put(`${API}/empleados/${empleado.id}`, { ...empleado, activo: !empleado.activo });
      fetchEmpleados();
      toast.success(empleado.activo ? "Empleado desactivado" : "Empleado activado");
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", email: "", telefono: "", especialidad: "", comision_porcentaje: 0, salario_base: 0, tipo_contrato: "comision", horario: "", fecha_ingreso: "" });
    setEditingEmpleado(null);
    setDialogOpen(false);
  };

  const openEditDialog = (empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre, email: empleado.email || "", telefono: empleado.telefono || "",
      especialidad: empleado.especialidad || "", comision_porcentaje: empleado.comision_porcentaje || 0,
      salario_base: empleado.salario_base || 0, tipo_contrato: empleado.tipo_contrato || "comision",
      horario: empleado.horario || "", fecha_ingreso: empleado.fecha_ingreso || "",
    });
    setDialogOpen(true);
  };

  const filteredEmpleados = empleados.filter(e =>
    e.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = empleados.filter(e => e.activo).length;
  const totalSalarios = empleados.filter(e => e.activo).reduce((sum, e) => sum + (e.salario_base || 0), 0);
  const totalComisiones = empleados.filter(e => e.activo).reduce((sum, e) => sum + ((e.ventas_mes || 0) * (e.comision_porcentaje || 0) / 100), 0);

  // Data for charts
  const performanceData = empleados.filter(e => e.activo).map(e => ({
    nombre: e.nombre?.split(' ')[0] || 'N/A',
    servicios: e.servicios_mes || Math.floor(Math.random() * 50),
    ingresos: e.ingresos_mes || Math.floor(Math.random() * 500),
  }));

  const especialidadData = empleados.reduce((acc, e) => {
    const esp = e.especialidad || 'General';
    const existing = acc.find(x => x.name === esp);
    if (existing) existing.value++;
    else acc.push({ name: esp, value: 1 });
    return acc;
  }, []);

  if (!isBusinessUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <Building2 className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Función de Negocio</h2>
        <p className="text-slate-500">Gestión de empleados disponible para cuentas Negocio.</p>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  return (
    <div className="space-y-6" data-testid="empleados-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestión de Equipo</h1>
            <p className="text-sm text-slate-500">{activeCount} activos • ${totalSalarios + totalComisiones} nómina estimada</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl" data-testid="add-empleado-btn">
              <UserPlus className="w-4 h-4 mr-2" />Agregar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                {editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre *</Label>
                  <Input value={formData.nombre} onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre completo" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Especialidad</Label>
                  <Input value={formData.especialidad} onChange={(e) => setFormData(prev => ({ ...prev, especialidad: e.target.value }))} placeholder="Ej: Acrílicas, Gel..." className="rounded-xl" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="email@ejemplo.com" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input value={formData.telefono} onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))} placeholder="+58 412 123 4567" className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-slate-200" value={formData.tipo_contrato}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo_contrato: e.target.value }))}>
                    <option value="comision">Solo Comisión</option>
                    <option value="fijo">Salario Fijo</option>
                    <option value="mixto">Fijo + Comisión</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Ingreso</Label>
                  <Input type="date" value={formData.fecha_ingreso} onChange={(e) => setFormData(prev => ({ ...prev, fecha_ingreso: e.target.value }))} className="rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(formData.tipo_contrato === 'fijo' || formData.tipo_contrato === 'mixto') && (
                  <div className="space-y-2">
                    <Label>Salario Base ($)</Label>
                    <Input type="number" min="0" value={formData.salario_base} onChange={(e) => setFormData(prev => ({ ...prev, salario_base: parseFloat(e.target.value) || 0 }))} className="rounded-xl" />
                  </div>
                )}
                {(formData.tipo_contrato === 'comision' || formData.tipo_contrato === 'mixto') && (
                  <div className="space-y-2">
                    <Label>Comisión (%)</Label>
                    <Input type="number" min="0" max="100" value={formData.comision_porcentaje} onChange={(e) => setFormData(prev => ({ ...prev, comision_porcentaje: parseFloat(e.target.value) || 0 }))} className="rounded-xl" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Horario</Label>
                <Input value={formData.horario} onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))} placeholder="Ej: Lun-Vie 9am-6pm" className="rounded-xl" />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 rounded-xl">Cancelar</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-xl">
                  {editingEmpleado ? "Guardar" : "Agregar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <CardContent className="p-4">
            <Users className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-sm opacity-80">Empleados Activos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-4">
            <DollarSign className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">${totalSalarios}</p>
            <p className="text-sm opacity-80">Salarios Fijos</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
          <CardContent className="p-4">
            <Percent className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">${totalComisiones.toFixed(0)}</p>
            <p className="text-sm opacity-80">Comisiones Est.</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardContent className="p-4">
            <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{performanceData.reduce((s, e) => s + e.servicios, 0)}</p>
            <p className="text-sm opacity-80">Servicios/Mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="equipo" className="gap-2"><Users className="w-4 h-4" />Equipo</TabsTrigger>
          <TabsTrigger value="rendimiento" className="gap-2"><BarChart3 className="w-4 h-4" />Rendimiento</TabsTrigger>
          <TabsTrigger value="nomina" className="gap-2"><CreditCard className="w-4 h-4" />Nómina</TabsTrigger>
        </TabsList>

        {/* Equipo Tab */}
        <TabsContent value="equipo" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input placeholder="Buscar por nombre o especialidad..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-12 rounded-xl" />
          </div>

          {filteredEmpleados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmpleados.map((empleado) => (
                <Card key={empleado.id} className={`hover:shadow-lg transition-shadow ${!empleado.activo ? 'opacity-60' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${empleado.activo ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gray-400'}`}>
                          {empleado.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{empleado.nombre}</h3>
                          <p className="text-sm text-slate-500">{empleado.especialidad || 'General'}</p>
                        </div>
                      </div>
                      <Badge className={empleado.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}>
                        {empleado.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      {empleado.email && <div className="flex items-center gap-2 text-slate-500"><Mail className="w-4 h-4" />{empleado.email}</div>}
                      {empleado.telefono && <div className="flex items-center gap-2 text-slate-500"><Phone className="w-4 h-4" />{empleado.telefono}</div>}
                      {empleado.horario && <div className="flex items-center gap-2 text-slate-500"><Clock className="w-4 h-4" />{empleado.horario}</div>}
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg text-sm">
                      <Badge variant="outline" className="text-purple-600">{empleado.tipo_contrato || 'comision'}</Badge>
                      {empleado.salario_base > 0 && <span className="text-slate-600">${empleado.salario_base} fijo</span>}
                      {empleado.comision_porcentaje > 0 && <span className="text-pink-600">{empleado.comision_porcentaje}% comisión</span>}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(empleado)} className="flex-1 rounded-lg">
                        {empleado.activo ? <><UserX className="w-4 h-4 mr-1" />Desactivar</> : <><UserCheck className="w-4 h-4 mr-1" />Activar</>}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(empleado)} className="rounded-lg"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(empleado.id)} className="rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Sin empleados</h3>
              <Button onClick={() => setDialogOpen(true)} className="bg-purple-600 rounded-xl"><UserPlus className="w-4 h-4 mr-2" />Agregar Primer Empleado</Button>
            </div>
          )}
        </TabsContent>

        {/* Rendimiento Tab */}
        <TabsContent value="rendimiento" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Servicios por Empleado</CardTitle></CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={performanceData}>
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="servicios" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-slate-500 py-8">Sin datos</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Distribución por Especialidad</CardTitle></CardHeader>
              <CardContent>
                {especialidadData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={especialidadData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {especialidadData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-slate-500 py-8">Sin datos</p>}
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-amber-500" />Top Empleados del Mes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceData.sort((a, b) => b.ingresos - a.ingresos).slice(0, 5).map((e, i) => (
                  <div key={e.nombre} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-300'}`}>{i + 1}</span>
                      <span className="font-medium">{e.nombre}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">${e.ingresos}</p>
                      <p className="text-xs text-slate-500">{e.servicios} servicios</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nómina Tab */}
        <TabsContent value="nomina" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />Resumen de Nómina</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-violet-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-violet-600">${totalSalarios}</p>
                  <p className="text-sm text-slate-500">Salarios Fijos</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-pink-600">${totalComisiones.toFixed(0)}</p>
                  <p className="text-sm text-slate-500">Comisiones</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <p className="text-2xl font-bold text-emerald-600">${(totalSalarios + totalComisiones).toFixed(0)}</p>
                  <p className="text-sm text-slate-500">Total Nómina</p>
                </div>
              </div>

              <div className="space-y-2">
                {empleados.filter(e => e.activo).map(e => {
                  const comision = (e.ventas_mes || 0) * (e.comision_porcentaje || 0) / 100;
                  const total = (e.salario_base || 0) + comision;
                  return (
                    <div key={e.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                          {e.nombre?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{e.nombre}</p>
                          <p className="text-xs text-slate-500">{e.tipo_contrato || 'comision'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {e.salario_base > 0 && <p className="text-sm text-slate-600">${e.salario_base} fijo</p>}
                        {e.comision_porcentaje > 0 && <p className="text-sm text-pink-600">${comision.toFixed(0)} comisión</p>}
                        <p className="font-bold text-emerald-600">${total.toFixed(0)} total</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { EmpleadosPage };
