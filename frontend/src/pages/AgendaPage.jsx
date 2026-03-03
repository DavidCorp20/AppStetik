import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

const estadoColors = {
  pendiente: "bg-amber-50 text-amber-700 border-amber-200",
  confirmada: "bg-blue-50 text-blue-700 border-blue-200",
  completada: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelada: "bg-rose-50 text-rose-700 border-rose-200",
};

const estadoLabels = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
};

const emptyCita = {
  cliente_id: "",
  fecha: "",
  hora: "",
  estilo_id: "",
  disenos_ids: [],
  notas: "",
  precio_estimado: 0,
};

export default function AgendaPage() {
  const { 
    clientes, 
    estilos, 
    disenos, 
    citas, 
    addCita, 
    updateCita, 
    deleteCita,
    calcularPrecio,
    addServicio,
    loading 
  } = useApp();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyCita);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("semana"); // semana, dia, mes

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getCitasForDate = (date) => {
    const dateStr = formatDate(date);
    return citas.filter(c => c.fecha === dateStr);
  };

  const handleOpenDialog = (cita = null, selectedDate = null) => {
    if (cita) {
      setEditingId(cita.id);
      setFormData({
        cliente_id: cita.cliente_id,
        fecha: cita.fecha,
        hora: cita.hora,
        estilo_id: cita.estilo_id,
        disenos_ids: cita.disenos_ids || [],
        notas: cita.notas || "",
        precio_estimado: cita.precio_estimado || 0,
      });
    } else {
      setEditingId(null);
      setFormData({
        ...emptyCita,
        fecha: selectedDate ? formatDate(selectedDate) : formatDate(new Date()),
      });
    }
    setDialogOpen(true);
  };

  const handleDisenoToggle = (disenoId) => {
    setFormData(prev => ({
      ...prev,
      disenos_ids: prev.disenos_ids.includes(disenoId)
        ? prev.disenos_ids.filter(id => id !== disenoId)
        : [...prev.disenos_ids, disenoId]
    }));
  };

  const handleEstiloChange = async (estiloId) => {
    setFormData(prev => ({ ...prev, estilo_id: estiloId }));
    
    // Auto-calculate price
    if (estiloId) {
      try {
        const result = await calcularPrecio(estiloId, formData.disenos_ids);
        setFormData(prev => ({ ...prev, precio_estimado: result.precio_recomendado }));
      } catch (err) {
        console.error('Error calculating price:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Recalculate price
      let precio = formData.precio_estimado;
      if (formData.estilo_id) {
        try {
          const result = await calcularPrecio(formData.estilo_id, formData.disenos_ids);
          precio = result.precio_recomendado;
        } catch {}
      }

      const data = { ...formData, precio_estimado: precio };

      if (editingId) {
        await updateCita(editingId, data);
        toast.success("Cita actualizada");
      } else {
        await addCita(data);
        toast.success("Cita creada");
      }
      
      setDialogOpen(false);
      setFormData(emptyCita);
      setEditingId(null);
    } catch (err) {
      toast.error("Error al guardar la cita");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (citaId, newStatus) => {
    try {
      const cita = citas.find(c => c.id === citaId);
      await updateCita(citaId, { estado: newStatus });
      
      // If completed, create a service record
      if (newStatus === "completada" && cita) {
        try {
          // Calculate actual cost
          let costoReal = 0;
          if (cita.estilo_id) {
            const result = await calcularPrecio(cita.estilo_id, cita.disenos_ids || []);
            costoReal = result.costo_total;
          }
          
          await addServicio({
            cliente_id: cita.cliente_id,
            cita_id: cita.id,
            fecha: cita.fecha,
            estilo_id: cita.estilo_id,
            disenos_ids: cita.disenos_ids || [],
            precio_cobrado: cita.precio_estimado,
            costo_real: costoReal,
            notas: cita.notas || ""
          });
          toast.success("Cita completada y servicio registrado");
        } catch (err) {
          toast.success("Cita completada");
        }
      } else {
        toast.success("Estado actualizado");
      }
    } catch (err) {
      toast.error("Error al actualizar el estado");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar esta cita?")) {
      try {
        await deleteCita(id);
        toast.success("Cita eliminada");
      } catch (err) {
        toast.error("Error al eliminar la cita");
      }
    }
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const weekDays = getWeekDays();
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="space-y-6 animate-fade-in" data-testid="agenda-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Agenda
          </h1>
          <p className="text-stone-500 mt-1">
            Gestiona tus citas y servicios
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="add-cita-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh]" data-testid="cita-dialog">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingId ? "Editar Cita" : "Nueva Cita"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  {/* Cliente */}
                  <div>
                    <Label>Cliente *</Label>
                    <Select value={formData.cliente_id} onValueChange={(val) => setFormData({...formData, cliente_id: val})}>
                      <SelectTrigger className="rounded-xl mt-1" data-testid="cita-cliente-select">
                        <SelectValue placeholder="Selecciona un cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                        className="rounded-xl mt-1"
                        required
                        data-testid="cita-fecha-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora">Hora *</Label>
                      <Input
                        id="hora"
                        type="time"
                        value={formData.hora}
                        onChange={(e) => setFormData({...formData, hora: e.target.value})}
                        className="rounded-xl mt-1"
                        required
                        data-testid="cita-hora-input"
                      />
                    </div>
                  </div>

                  {/* Estilo */}
                  <div>
                    <Label>Servicio *</Label>
                    <Select value={formData.estilo_id} onValueChange={handleEstiloChange}>
                      <SelectTrigger className="rounded-xl mt-1" data-testid="cita-estilo-select">
                        <SelectValue placeholder="Selecciona un servicio..." />
                      </SelectTrigger>
                      <SelectContent>
                        {estilos.map((estilo) => (
                          <SelectItem key={estilo.id} value={estilo.id}>
                            {estilo.nombre} ({estilo.tiempo_trabajo_minutos} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Diseños */}
                  <div>
                    <Label className="mb-2 block">Diseños Adicionales</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto border border-stone-200 rounded-xl p-3">
                      {disenos.map((diseno) => (
                        <div key={diseno.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`diseno-${diseno.id}`}
                            checked={formData.disenos_ids.includes(diseno.id)}
                            onCheckedChange={() => handleDisenoToggle(diseno.id)}
                          />
                          <label htmlFor={`diseno-${diseno.id}`} className="text-sm flex-1">
                            {diseno.nombre}
                          </label>
                          <span className="text-xs text-emerald-600">+${diseno.costo_adicional}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precio Estimado */}
                  <div className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-600">Precio Estimado</span>
                      <span className="text-xl font-semibold text-stone-800">
                        ${formData.precio_estimado.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <Label htmlFor="notas">Notas</Label>
                    <Textarea
                      id="notas"
                      value={formData.notas}
                      onChange={(e) => setFormData({...formData, notas: e.target.value})}
                      placeholder="Notas adicionales..."
                      className="rounded-xl mt-1 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </ScrollArea>

              <div className="flex gap-3 pt-4 mt-4 border-t border-stone-200">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-full">
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 bg-stone-800 hover:bg-stone-900 text-white rounded-full" data-testid="save-cita-btn">
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Actualizar" : "Crear Cita"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Week Navigation */}
      <Card className="bg-white border-stone-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)} className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <p className="font-medium text-stone-800">
                {weekDays[0].toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm text-stone-500">
                {weekDays[0].toLocaleDateString('es-ES', { day: 'numeric' })} - {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric' })}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)} className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-2" data-testid="week-view">
        {weekDays.map((day, idx) => {
          const dayCitas = getCitasForDate(day);
          const isCurrentDay = isToday(day);
          
          return (
            <Card 
              key={idx} 
              className={`bg-white border-stone-100 min-h-[200px] ${isCurrentDay ? 'ring-2 ring-stone-800' : ''}`}
            >
              <CardHeader className="p-2 pb-1">
                <div className="text-center">
                  <p className="text-xs text-stone-500">{dayNames[idx]}</p>
                  <p className={`text-lg font-semibold ${isCurrentDay ? 'text-stone-800' : 'text-stone-600'}`}>
                    {day.getDate()}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="space-y-1">
                  {dayCitas.length === 0 ? (
                    <button 
                      onClick={() => handleOpenDialog(null, day)}
                      className="w-full py-4 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      + Agregar
                    </button>
                  ) : (
                    dayCitas.map((cita) => {
                      const cliente = clientes.find(c => c.id === cita.cliente_id);
                      const estilo = estilos.find(e => e.id === cita.estilo_id);
                      
                      return (
                        <div 
                          key={cita.id}
                          onClick={() => handleOpenDialog(cita)}
                          className={`p-2 rounded-lg cursor-pointer border transition-colors ${estadoColors[cita.estado]}`}
                        >
                          <p className="text-xs font-medium truncate">{cita.hora}</p>
                          <p className="text-xs truncate">{cliente?.nombre || 'Cliente'}</p>
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(cita.id, 'completada'); }}
                              className="p-0.5 hover:bg-white/50 rounded"
                              title="Completar"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(cita.id, 'cancelada'); }}
                              className="p-0.5 hover:bg-white/50 rounded"
                              title="Cancelar"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {dayCitas.length > 0 && (
                  <button 
                    onClick={() => handleOpenDialog(null, day)}
                    className="w-full mt-1 py-1 text-xs text-stone-400 hover:text-stone-600 rounded transition-colors"
                  >
                    +
                  </button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Today's Summary */}
      <Card className="bg-stone-800 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-300 uppercase tracking-wider">Citas de Hoy</p>
              <p className="text-2xl font-bold">{getCitasForDate(new Date()).length}</p>
            </div>
            <div>
              <p className="text-xs text-stone-300 uppercase tracking-wider">Esta Semana</p>
              <p className="text-2xl font-bold">
                {weekDays.reduce((sum, day) => sum + getCitasForDate(day).length, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-300 uppercase tracking-wider">Ingresos Est.</p>
              <p className="text-2xl font-bold">
                ${weekDays.reduce((sum, day) => {
                  const dayCitas = getCitasForDate(day);
                  return sum + dayCitas.reduce((s, c) => s + (c.precio_estimado || 0), 0);
                }, 0).toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { AgendaPage };
