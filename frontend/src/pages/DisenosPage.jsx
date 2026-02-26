import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Sparkles, Clock, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

const emptyDiseno = {
  nombre: "",
  costo_adicional: "",
  tiempo_adicional_minutos: "",
  nivel_complejidad: "medio",
};

const complejidadColors = {
  bajo: "bg-emerald-50 text-emerald-700",
  medio: "bg-amber-50 text-amber-700",
  alto: "bg-rose-50 text-rose-700",
};

const complejidadLabels = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

export default function DisenosPage() {
  const { disenos, addDiseno, updateDiseno, deleteDiseno, loading } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyDiseno);
  const [saving, setSaving] = useState(false);

  const handleOpenDialog = (diseno = null) => {
    if (diseno) {
      setEditingId(diseno.id);
      setFormData({
        nombre: diseno.nombre,
        costo_adicional: diseno.costo_adicional.toString(),
        tiempo_adicional_minutos: diseno.tiempo_adicional_minutos.toString(),
        nivel_complejidad: diseno.nivel_complejidad,
      });
    } else {
      setEditingId(null);
      setFormData(emptyDiseno);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        nombre: formData.nombre,
        costo_adicional: parseFloat(formData.costo_adicional) || 0,
        tiempo_adicional_minutos: parseInt(formData.tiempo_adicional_minutos) || 0,
        nivel_complejidad: formData.nivel_complejidad,
      };

      if (editingId) {
        await updateDiseno(editingId, data);
        toast.success("Diseño actualizado");
      } else {
        await addDiseno(data);
        toast.success("Diseño agregado");
      }

      setDialogOpen(false);
      setFormData(emptyDiseno);
      setEditingId(null);
    } catch (err) {
      toast.error("Error al guardar el diseño");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este diseño?")) {
      try {
        await deleteDiseno(id);
        toast.success("Diseño eliminado");
      } catch (err) {
        toast.error("Error al eliminar el diseño");
      }
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
    <div className="space-y-6 animate-fade-in" data-testid="disenos-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Diseños y Decoraciones
          </h1>
          <p className="text-stone-500 mt-1">
            Opciones adicionales para tus servicios
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="add-diseno-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Diseño
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-testid="diseno-dialog">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingId ? "Editar Diseño" : "Nuevo Diseño"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre del Diseño</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: French, Baby Boomer, 3D..."
                  className="rounded-xl mt-1"
                  required
                  data-testid="diseno-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costo">Costo Adicional ($)</Label>
                  <Input
                    id="costo"
                    type="number"
                    step="0.01"
                    value={formData.costo_adicional}
                    onChange={(e) => setFormData({ ...formData, costo_adicional: e.target.value })}
                    placeholder="5.00"
                    className="rounded-xl mt-1"
                    required
                    data-testid="diseno-cost-input"
                  />
                </div>
                <div>
                  <Label htmlFor="tiempo">Tiempo Adicional (min)</Label>
                  <Input
                    id="tiempo"
                    type="number"
                    value={formData.tiempo_adicional_minutos}
                    onChange={(e) => setFormData({ ...formData, tiempo_adicional_minutos: e.target.value })}
                    placeholder="15"
                    className="rounded-xl mt-1"
                    required
                    data-testid="diseno-time-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="complejidad">Nivel de Complejidad</Label>
                <Select
                  value={formData.nivel_complejidad}
                  onValueChange={(val) => setFormData({ ...formData, nivel_complejidad: val })}
                >
                  <SelectTrigger className="rounded-xl mt-1" data-testid="diseno-complexity-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bajo">Bajo</SelectItem>
                    <SelectItem value="medio">Medio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 rounded-full"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-stone-800 hover:bg-stone-900 text-white rounded-full"
                  data-testid="save-diseno-btn"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Diseños Grid */}
      {disenos.length === 0 ? (
        <Card className="bg-white border-stone-100">
          <CardContent className="text-center py-12">
            <Sparkles className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No hay diseños registrados</p>
            <Button
              variant="link"
              onClick={() => handleOpenDialog()}
              className="text-stone-700 mt-2"
            >
              Agregar tu primer diseño
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="disenos-grid">
          {disenos.map((diseno) => (
            <Card
              key={diseno.id}
              className="bg-white border-stone-100 hover:shadow-md transition-shadow duration-300 group"
              data-testid={`diseno-card-${diseno.id}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <Badge className={complejidadColors[diseno.nivel_complejidad]}>
                    {complejidadLabels[diseno.nivel_complejidad]}
                  </Badge>
                </div>

                <h3 className="font-semibold text-stone-800 text-lg mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {diseno.nombre}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-stone-500">
                      <DollarSign className="w-4 h-4" />
                      Costo
                    </span>
                    <span className="font-semibold text-emerald-700">${diseno.costo_adicional.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-stone-500">
                      <Clock className="w-4 h-4" />
                      Tiempo
                    </span>
                    <span className="font-medium text-stone-700">{diseno.tiempo_adicional_minutos} min</span>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(diseno)}
                    className="flex-1 rounded-full text-xs"
                    data-testid={`edit-diseno-${diseno.id}`}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(diseno.id)}
                    className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    data-testid={`delete-diseno-${diseno.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {disenos.length > 0 && (
        <Card className="bg-stone-50 border-stone-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Total Diseños</p>
                <p className="text-2xl font-semibold text-stone-800">{disenos.length}</p>
              </div>
              <div className="w-px h-12 bg-stone-300" />
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Costo Promedio</p>
                <p className="text-2xl font-semibold text-emerald-700">
                  ${(disenos.reduce((sum, d) => sum + d.costo_adicional, 0) / disenos.length).toFixed(2)}
                </p>
              </div>
              <div className="w-px h-12 bg-stone-300" />
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Tiempo Promedio</p>
                <p className="text-2xl font-semibold text-stone-800">
                  {Math.round(disenos.reduce((sum, d) => sum + d.tiempo_adicional_minutos, 0) / disenos.length)} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { DisenosPage };
