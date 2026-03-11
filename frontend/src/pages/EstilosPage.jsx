import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Pencil, Trash2, Palette, Clock, Loader2, Search, BookOpen, 
  Check, ChevronRight, Sparkles, Star, DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { TutorialHelpButton, AutoTutorial } from "@/components/FeatureTutorial";
import { CATALOGO_ESTILOS } from "@/data/catalogos";
import { formatCurrency } from "@/lib/utils";

const emptyEstilo = {
  nombre: "",
  descripcion: "",
  productos_usados: [],
  tiempo_trabajo_minutos: "",
  nivel_dificultad: "medio",
};

const dificultadColors = {
  bajo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medio: "bg-amber-50 text-amber-700 border-amber-200",
  alto: "bg-rose-50 text-rose-700 border-rose-200",
};

const dificultadLabels = {
  bajo: "Fácil",
  medio: "Medio",
  alto: "Difícil",
};

export default function EstilosPage() {
  const { estilos, productos, addEstilo, updateEstilo, deleteEstilo, loading } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyEstilo);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("manicure");
  const [selectedServices, setSelectedServices] = useState([]);

  // Filter estilos
  const filteredEstilos = useMemo(() => {
    return (estilos || []).filter(e => 
      e.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estilos, searchTerm]);

  // Get catalog services for selected category
  const catalogServices = useMemo(() => {
    const category = CATALOGO_ESTILOS[selectedCategory];
    if (!category) return [];
    
    const existingNames = new Set((estilos || []).map(e => e.nombre.toLowerCase()));
    
    return category.estilos.filter(s => {
      const matchesSearch = s.nombre.toLowerCase().includes(catalogSearch.toLowerCase());
      const notExists = !existingNames.has(s.nombre.toLowerCase());
      return matchesSearch && notExists;
    });
  }, [selectedCategory, catalogSearch, estilos]);

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
        toast.success("Servicio actualizado");
      } else {
        await addEstilo(data);
        toast.success("Servicio agregado");
      }

      setDialogOpen(false);
      setFormData(emptyEstilo);
      setEditingId(null);
    } catch (err) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este servicio?")) {
      try {
        await deleteEstilo(id);
        toast.success("Servicio eliminado");
      } catch (err) {
        toast.error("Error al eliminar");
      }
    }
  };

  // Quick add from catalog
  const handleQuickAdd = (service) => {
    setFormData({
      nombre: service.nombre,
      descripcion: service.descripcion,
      productos_usados: [],
      tiempo_trabajo_minutos: service.tiempo_trabajo_minutos.toString(),
      nivel_dificultad: service.nivel_dificultad,
    });
    setCatalogOpen(false);
    setDialogOpen(true);
  };

  // Toggle service selection for batch add
  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.nombre === service.nombre);
      if (exists) {
        return prev.filter(s => s.nombre !== service.nombre);
      }
      return [...prev, service];
    });
  };

  // Batch add selected services
  const handleBatchAdd = async () => {
    if (selectedServices.length === 0) {
      toast.error("Selecciona al menos un servicio");
      return;
    }

    setSaving(true);
    let added = 0;

    for (const service of selectedServices) {
      try {
        await addEstilo({
          nombre: service.nombre,
          descripcion: service.descripcion,
          productos_usados: [],
          tiempo_trabajo_minutos: service.tiempo_trabajo_minutos,
          nivel_dificultad: service.nivel_dificultad,
        });
        added++;
      } catch (err) {
        console.error(err);
      }
    }

    toast.success(`${added} servicios agregados`);
    setSelectedServices([]);
    setCatalogOpen(false);
    setSaving(false);
  };

  const calcCostoEstilo = (estilo) => {
    let total = 0;
    for (const pu of estilo.productos_usados || []) {
      const prod = (productos || []).find(p => p.id === pu.producto_id);
      if (prod) {
        total += (prod.costo_unitario || 0) * pu.cantidad;
      }
    }
    return total;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="estilos-page">
      {/* Auto Tutorial */}
      <AutoTutorial feature="estilos" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
              Servicios y Estilos
            </h1>
            <TutorialHelpButton feature="estilos" />
          </div>
          <p className="text-stone-500 mt-1">
            Define los servicios que ofreces y sus costos
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCatalogOpen(true)}
            className="border-violet-200 text-violet-600 hover:bg-violet-50"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Catálogo
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-rose-400 hover:bg-rose-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Buscar servicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100">
          <CardContent className="p-4">
            <p className="text-xs text-violet-600 font-medium">Total Servicios</p>
            <p className="text-2xl font-bold text-violet-700">{estilos?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 font-medium">Fáciles</p>
            <p className="text-2xl font-bold text-emerald-700">{estilos?.filter(e => e.nivel_dificultad === "bajo").length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 font-medium">Medios</p>
            <p className="text-2xl font-bold text-amber-700">{estilos?.filter(e => e.nivel_dificultad === "medio").length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
          <CardContent className="p-4">
            <p className="text-xs text-rose-600 font-medium">Difíciles</p>
            <p className="text-2xl font-bold text-rose-700">{estilos?.filter(e => e.nivel_dificultad === "alto").length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Estilos Grid */}
      {filteredEstilos.length === 0 ? (
        <Card className="bg-white border-stone-100">
          <CardContent className="text-center py-12">
            <Palette className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 mb-4">No hay servicios registrados</p>
            <Button onClick={() => setCatalogOpen(true)} variant="outline" className="border-violet-200 text-violet-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Explorar Catálogo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="estilos-grid">
          {filteredEstilos.map((estilo) => {
            const costoProductos = calcCostoEstilo(estilo);
            
            return (
              <Card 
                key={estilo.id} 
                className="bg-white border-stone-100 hover:shadow-lg transition-all duration-300 hover:border-violet-200"
                data-testid={`estilo-card-${estilo.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-stone-800 truncate" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {estilo.nombre}
                      </CardTitle>
                      {estilo.descripcion && (
                        <p className="text-sm text-stone-500 mt-1 line-clamp-2">{estilo.descripcion}</p>
                      )}
                    </div>
                    <Badge className={`ml-2 ${dificultadColors[estilo.nivel_dificultad]}`}>
                      {dificultadLabels[estilo.nivel_dificultad]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Clock className="w-4 h-4" />
                        <span>{estilo.tiempo_trabajo_minutos} min</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatCurrency(costoProductos)}</span>
                      </div>
                    </div>

                    {estilo.productos_usados && estilo.productos_usados.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {estilo.productos_usados.slice(0, 3).map((pu) => {
                          const prod = (productos || []).find(p => p.id === pu.producto_id);
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
                        className="flex-1"
                        data-testid={`edit-estilo-${estilo.id}`}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(estilo.id)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div>
                  <Label>Nombre del Servicio</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Manicure Semipermanente"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del servicio..."
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tiempo (minutos)</Label>
                    <Input
                      type="number"
                      value={formData.tiempo_trabajo_minutos}
                      onChange={(e) => setFormData({ ...formData, tiempo_trabajo_minutos: e.target.value })}
                      placeholder="60"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label>Dificultad</Label>
                    <Select
                      value={formData.nivel_dificultad}
                      onValueChange={(val) => setFormData({ ...formData, nivel_dificultad: val })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bajo">Fácil</SelectItem>
                        <SelectItem value="medio">Medio</SelectItem>
                        <SelectItem value="alto">Difícil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Productos Selection */}
                <div>
                  <Label className="mb-2 block">Productos Utilizados</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {(productos || []).length === 0 ? (
                      <p className="text-sm text-stone-500 text-center py-2">
                        No hay productos registrados
                      </p>
                    ) : (
                      (productos || []).map((producto) => {
                        const isSelected = formData.productos_usados.some(p => p.producto_id === producto.id);
                        const selectedProd = formData.productos_usados.find(p => p.producto_id === producto.id);
                        
                        return (
                          <div key={producto.id} className="flex items-center gap-3 p-2 hover:bg-stone-50 rounded-lg">
                            <Checkbox
                              id={`prod-${producto.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleProductoToggle(producto.id, checked)}
                            />
                            <label 
                              htmlFor={`prod-${producto.id}`}
                              className="flex-1 text-sm cursor-pointer"
                            >
                              {producto.nombre}
                              <span className="text-stone-400 ml-2">({formatCurrency(producto.costo_unitario || 0)}/uso)</span>
                            </label>
                            {isSelected && (
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={selectedProd?.cantidad || 1}
                                onChange={(e) => handleProductoCantidad(producto.id, e.target.value)}
                                className="w-20 h-8 text-sm"
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

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-rose-400 hover:bg-rose-500">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingId ? "Actualizar" : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Catalog Dialog */}
      <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-violet-500" />
              Catálogo de Servicios
            </DialogTitle>
            <p className="text-sm text-gray-500">Selecciona servicios para agregar rápidamente</p>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-4 h-[60vh]">
            {/* Categories */}
            <div className="md:w-48 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Categorías</p>
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {Object.entries(CATALOGO_ESTILOS).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm whitespace-nowrap transition-all ${
                      selectedCategory === key 
                        ? 'bg-violet-100 text-violet-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services List */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar en catálogo..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-2 space-y-1">
                  {catalogServices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay servicios disponibles</p>
                      <p className="text-xs">Ya agregaste todos de esta categoría</p>
                    </div>
                  ) : (
                    catalogServices.map((service, i) => {
                      const isSelected = selectedServices.some(s => s.nombre === service.nombre);
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-violet-50 border border-violet-200' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => toggleServiceSelection(service)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-violet-500 border-violet-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{service.nombre}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{service.descripcion}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm flex-shrink-0">
                            <span className="flex items-center gap-1 text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              {service.tiempo_trabajo_minutos}m
                            </span>
                            <Badge className={`text-xs ${dificultadColors[service.nivel_dificultad]}`}>
                              {dificultadLabels[service.nivel_dificultad]}
                            </Badge>
                            <span className="font-medium text-emerald-600">${service.precio_sugerido}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleQuickAdd(service); }}
                            className="flex-shrink-0"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {selectedServices.length > 0 && (
                <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-violet-700">
                      <strong>{selectedServices.length}</strong> servicios seleccionados
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedServices([])}>
                        Limpiar
                      </Button>
                      <Button size="sm" onClick={handleBatchAdd} disabled={saving} className="bg-violet-500 hover:bg-violet-600">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Agregar Todos
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { EstilosPage };
