import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Palette, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FeatureHelpButton, AutoFeatureTutorial } from "@/components/FeatureTutorial";

const emptyEstilo = {
  nombre: "",
  descripcion: "",
  productos_usados: [],
  tiempo_trabajo_minutos: "",
  nivel_dificultad: "medio",
};

const dificultadColors = {
  bajo: "bg-emerald-50 text-emerald-700",
  medio: "bg-amber-50 text-amber-700",
  alto: "bg-rose-50 text-rose-700",
};

const dificultadLabels = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

export default function EstilosPage() {
  const { estilos, productos, addEstilo, updateEstilo, deleteEstilo, loading } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyEstilo);
  const [saving, setSaving] = useState(false);

  const handleOpenDialog = (estilo = null) => {
    if (estilo) {
      setEditingId(estilo.id);
      setFormData({
        nombre: estilo.nombre,
        descripcion: estilo.descripcion || "",
        productos_usados: estilo.productos_usados || [],
        tiempo_trabajo_minutos: estilo.tiempo_trabajo_minutos.toString(),
        nivel_dificultad: estilo.nivel_dificultad,
      });
    } else {
      setEditingId(null);
      setFormData(emptyEstilo);
    }
    setDialogOpen(true);
  };

  const handleProductoToggle = (productoId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        productos_usados: [...formData.productos_usados, { producto_id: productoId, cantidad: 1 }],
      });
    } else {
      setFormData({
        ...formData,
        productos_usados: formData.productos_usados.filter(p => p.producto_id !== productoId),
      });
    }
  };

  const handleProductoCantidad = (productoId, cantidad) => {
    setFormData({
      ...formData,
      productos_usados: formData.productos_usados.map(p =>
        p.producto_id === productoId ? { ...p, cantidad: parseFloat(cantidad) || 1 } : p
      ),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        productos_usados: formData.productos_usados,
        tiempo_trabajo_minutos: parseInt(formData.tiempo_trabajo_minutos) || 60,
        nivel_dificultad: formData.nivel_dificultad,
      };

      if (editingId) {
        await updateEstilo(editingId, data);
        toast.success("Estilo actualizado");
      } else {
        await addEstilo(data);
        toast.success("Estilo agregado");
      }

      setDialogOpen(false);
      setFormData(emptyEstilo);
      setEditingId(null);
    } catch (err) {
      toast.error("Error al guardar el estilo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este estilo?")) {
      try {
        await deleteEstilo(id);
        toast.success("Estilo eliminado");
      } catch (err) {
        toast.error("Error al eliminar el estilo");
      }
    }
  };

  const calcCostoEstilo = (estilo) => {
    let total = 0;
    for (const pu of estilo.productos_usados || []) {
      const prod = productos.find(p => p.id === pu.producto_id);
      if (prod) {
        total += prod.costo_unitario * pu.cantidad;
      }
    }
    return total;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="estilos-page">
      {/* Auto Tutorial */}
      <AutoFeatureTutorial feature="estilos" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
              Estilos de Uñas
            </h1>
            <FeatureHelpButton feature="estilos" />
          </div>
          <p className="text-stone-500 mt-1">
            Define los estilos y servicios que ofreces
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="add-estilo-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Estilo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh]" data-testid="estilo-dialog">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingId ? "Editar Estilo" : "Nuevo Estilo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Estilo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Acrílicas Largas"
                      className="rounded-xl mt-1"
                      required
                      data-testid="estilo-name-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Descripción del servicio..."
                      className="rounded-xl mt-1 resize-none"
                      rows={2}
                      data-testid="estilo-desc-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tiempo">Tiempo (minutos)</Label>
                      <Input
                        id="tiempo"
                        type="number"
                        value={formData.tiempo_trabajo_minutos}
                        onChange={(e) => setFormData({ ...formData, tiempo_trabajo_minutos: e.target.value })}
                        placeholder="90"
                        className="rounded-xl mt-1"
                        required
                        data-testid="estilo-time-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dificultad">Nivel de Dificultad</Label>
                      <Select
                        value={formData.nivel_dificultad}
                        onValueChange={(val) => setFormData({ ...formData, nivel_dificultad: val })}
                      >
                        <SelectTrigger className="rounded-xl mt-1" data-testid="estilo-difficulty-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bajo">Bajo</SelectItem>
                          <SelectItem value="medio">Medio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Productos Selection */}
                  <div>
                    <Label className="mb-2 block">Productos Utilizados</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-stone-200 rounded-xl p-3">
                      {productos.length === 0 ? (
                        <p className="text-sm text-stone-500 text-center py-2">
                          No hay productos registrados
                        </p>
                      ) : (
                        productos.map((producto) => {
                          const isSelected = formData.productos_usados.some(p => p.producto_id === producto.id);
                          const selectedProd = formData.productos_usados.find(p => p.producto_id === producto.id);
                          
                          return (
                            <div key={producto.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg">
                              <Checkbox
                                id={`prod-${producto.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleProductoToggle(producto.id, checked)}
                                data-testid={`estilo-product-${producto.id}`}
                              />
                              <label 
                                htmlFor={`prod-${producto.id}`}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                {producto.nombre}
                                <span className="text-stone-400 ml-2">(${producto.costo_unitario.toFixed(2)}/uso)</span>
                              </label>
                              {isSelected && (
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  value={selectedProd?.cantidad || 1}
                                  onChange={(e) => handleProductoCantidad(producto.id, e.target.value)}
                                  className="w-20 h-8 rounded-lg text-sm"
                                  placeholder="Cant."
                                />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="flex gap-3 pt-4 mt-4 border-t border-stone-200">
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
                  data-testid="save-estilo-btn"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estilos Grid */}
      {estilos.length === 0 ? (
        <Card className="bg-white border-stone-100">
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No hay estilos registrados</p>
            <Button
              variant="link"
              onClick={() => handleOpenDialog()}
              className="text-stone-700 mt-2"
            >
              Agregar tu primer estilo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="estilos-grid">
          {estilos.map((estilo) => {
            const costoProductos = calcCostoEstilo(estilo);
            
            return (
              <Card 
                key={estilo.id} 
                className="bg-white border-stone-100 hover:shadow-md transition-shadow duration-300"
                data-testid={`estilo-card-${estilo.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {estilo.nombre}
                      </CardTitle>
                      {estilo.descripcion && (
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">{estilo.descripcion}</p>
                      )}
                    </div>
                    <Badge className={dificultadColors[estilo.nivel_dificultad]}>
                      {dificultadLabels[estilo.nivel_dificultad]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Clock className="w-4 h-4" />
                      <span>{estilo.tiempo_trabajo_minutos} minutos</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                      <span className="text-sm text-stone-600">Costo de Productos</span>
                      <span className="font-semibold text-stone-800">${costoProductos.toFixed(2)}</span>
                    </div>

                    {estilo.productos_usados && estilo.productos_usados.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {estilo.productos_usados.slice(0, 3).map((pu) => {
                          const prod = productos.find(p => p.id === pu.producto_id);
                          return prod ? (
                            <Badge key={pu.producto_id} variant="secondary" className="bg-stone-100 text-stone-600 text-xs">
                              {prod.nombre}
                            </Badge>
                          ) : null;
                        })}
                        {estilo.productos_usados.length > 3 && (
                          <Badge variant="secondary" className="bg-stone-100 text-stone-600 text-xs">
                            +{estilo.productos_usados.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(estilo)}
                        className="flex-1 rounded-full"
                        data-testid={`edit-estilo-${estilo.id}`}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(estilo.id)}
                        className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        data-testid={`delete-estilo-${estilo.id}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { EstilosPage };
