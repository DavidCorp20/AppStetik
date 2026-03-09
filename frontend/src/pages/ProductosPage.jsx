import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
  Plus, Pencil, Trash2, Package, Loader2, Wrench, Search, BookOpen, 
  Check, ChevronRight, Sparkles, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { FeatureHelpButton, AutoFeatureTutorial } from "@/components/FeatureTutorial";
import { CATALOGO_PRODUCTOS } from "@/data/catalogos";
import { formatCurrency } from "@/lib/utils";

const emptyProducto = {
  nombre: "",
  tipo: "insumo",
  precio_compra: "",
  cantidad_comprada: "",
  unidad: "unidades",
  uso_por_servicio: "",
};

export default function ProductosPage() {
  const { productos, addProducto, updateProducto, deleteProducto, loading } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyProducto);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("manicure_pedicure");
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return (productos || []).filter(p => {
      const matchesFilter = filter === "todos" || p.tipo === filter;
      const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [productos, filter, searchTerm]);

  // Get catalog products for selected category
  const catalogProducts = useMemo(() => {
    const category = CATALOGO_PRODUCTOS[selectedCategory];
    if (!category) return [];
    
    const existingNames = new Set((productos || []).map(p => p.nombre.toLowerCase()));
    
    return category.productos.filter(p => {
      const matchesSearch = p.nombre.toLowerCase().includes(catalogSearch.toLowerCase());
      const notExists = !existingNames.has(p.nombre.toLowerCase());
      return matchesSearch && notExists;
    });
  }, [selectedCategory, catalogSearch, productos]);

  const handleOpenDialog = (producto = null) => {
    if (producto) {
      setEditingId(producto.id);
      setFormData({
        nombre: producto.nombre,
        tipo: producto.tipo,
        precio_compra: producto.precio_compra.toString(),
        cantidad_comprada: producto.cantidad_comprada.toString(),
        unidad: producto.unidad,
        uso_por_servicio: producto.uso_por_servicio.toString(),
      });
    } else {
      setEditingId(null);
      setFormData(emptyProducto);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const data = {
        nombre: formData.nombre,
        tipo: formData.tipo,
        precio_compra: parseFloat(formData.precio_compra) || 0,
        cantidad_comprada: parseFloat(formData.cantidad_comprada) || 0,
        unidad: formData.unidad,
        uso_por_servicio: parseFloat(formData.uso_por_servicio) || 0,
      };

      if (editingId) {
        await updateProducto(editingId, data);
        toast.success("Producto actualizado");
      } else {
        await addProducto(data);
        toast.success("Producto agregado");
      }
      setDialogOpen(false);
      setFormData(emptyProducto);
    } catch (err) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Eliminar este producto?")) {
      try {
        await deleteProducto(id);
        toast.success("Producto eliminado");
      } catch (err) {
        toast.error("Error al eliminar");
      }
    }
  };

  // Quick add from catalog
  const handleQuickAdd = (product) => {
    setFormData({
      nombre: product.nombre,
      tipo: product.tipo,
      precio_compra: product.precio_sugerido.toString(),
      cantidad_comprada: "1",
      unidad: product.unidad,
      uso_por_servicio: product.uso_por_servicio.toString(),
    });
    setCatalogOpen(false);
    setDialogOpen(true);
  };

  // Toggle product selection for batch add
  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.nombre === product.nombre);
      if (exists) {
        return prev.filter(p => p.nombre !== product.nombre);
      }
      return [...prev, { ...product, precio_compra: product.precio_sugerido, cantidad_comprada: 1 }];
    });
  };

  // Batch add selected products
  const handleBatchAdd = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecciona al menos un producto");
      return;
    }

    setSaving(true);
    let added = 0;

    for (const product of selectedProducts) {
      try {
        await addProducto({
          nombre: product.nombre,
          tipo: product.tipo,
          precio_compra: product.precio_compra,
          cantidad_comprada: product.cantidad_comprada,
          unidad: product.unidad,
          uso_por_servicio: product.uso_por_servicio,
        });
        added++;
      } catch (err) {
        console.error(err);
      }
    }

    toast.success(`${added} productos agregados`);
    setSelectedProducts([]);
    setCatalogOpen(false);
    setSaving(false);
  };

  // Calculate cost per unit
  const getCostoUnitario = (p) => {
    if (!p.cantidad_comprada || p.cantidad_comprada === 0) return 0;
    return p.precio_compra / p.cantidad_comprada;
  };

  return (
    <div className="space-y-6 animate-fade-in" data-testid="productos-page">
      {/* Auto Tutorial */}
      <AutoFeatureTutorial feature="productos" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
              Productos e Insumos
            </h1>
            <FeatureHelpButton feature="productos" />
          </div>
          <p className="text-stone-500 mt-1">
            Gestiona tus productos y herramientas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setCatalogOpen(true)}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["todos", "insumo", "herramienta"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? "bg-stone-800" : ""}
            >
              {f === "todos" ? "Todos" : f === "insumo" ? "Insumos" : "Herramientas"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardContent className="p-4">
            <p className="text-xs text-blue-600 font-medium">Total Productos</p>
            <p className="text-2xl font-bold text-blue-700">{productos?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-4">
            <p className="text-xs text-emerald-600 font-medium">Insumos</p>
            <p className="text-2xl font-bold text-emerald-700">{productos?.filter(p => p.tipo === "insumo").length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100">
          <CardContent className="p-4">
            <p className="text-xs text-violet-600 font-medium">Herramientas</p>
            <p className="text-2xl font-bold text-violet-700">{productos?.filter(p => p.tipo === "herramienta").length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <CardContent className="p-4">
            <p className="text-xs text-amber-600 font-medium">Inversión Total</p>
            <p className="text-2xl font-bold text-amber-700">{formatCurrency(productos?.reduce((sum, p) => sum + (p.precio_compra || 0), 0) || 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card className="border-stone-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-rose-400" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500 mb-4">No hay productos registrados</p>
              <Button onClick={() => setCatalogOpen(true)} variant="outline" className="border-blue-200 text-blue-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Explorar Catálogo
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-stone-50">
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Precio Compra</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Uso/Servicio</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((producto) => (
                    <TableRow key={producto.id} className="hover:bg-stone-50">
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>
                        <Badge variant={producto.tipo === "insumo" ? "secondary" : "outline"} className="capitalize">
                          {producto.tipo === "insumo" ? (
                            <><Package className="w-3 h-3 mr-1" /> Insumo</>
                          ) : (
                            <><Wrench className="w-3 h-3 mr-1" /> Herramienta</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(producto.precio_compra)}</TableCell>
                      <TableCell className="text-right">{producto.cantidad_comprada} {producto.unidad}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-600">
                        {formatCurrency(getCostoUnitario(producto))}
                      </TableCell>
                      <TableCell className="text-right">{producto.uso_por_servicio}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(producto)} className="h-8 w-8">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(producto.id)} className="h-8 w-8 text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nombre del producto</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Esmalte Semipermanente Rojo"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insumo">Insumo</SelectItem>
                    <SelectItem value="herramienta">Herramienta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unidad</Label>
                <Select value={formData.unidad} onValueChange={(v) => setFormData({ ...formData, unidad: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidades">Unidades</SelectItem>
                    <SelectItem value="ml">Mililitros</SelectItem>
                    <SelectItem value="gramos">Gramos</SelectItem>
                    <SelectItem value="sets">Sets</SelectItem>
                    <SelectItem value="pares">Pares</SelectItem>
                    <SelectItem value="hojas">Hojas</SelectItem>
                    <SelectItem value="metros">Metros</SelectItem>
                    <SelectItem value="rollos">Rollos</SelectItem>
                    <SelectItem value="tiras">Tiras</SelectItem>
                    <SelectItem value="aplicaciones">Aplicaciones</SelectItem>
                    <SelectItem value="cajas">Cajas</SelectItem>
                    <SelectItem value="paquetes">Paquetes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio de compra ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio_compra}
                  onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label>Cantidad comprada</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cantidad_comprada}
                  onChange={(e) => setFormData({ ...formData, cantidad_comprada: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Uso por servicio ({formData.unidad})</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.uso_por_servicio}
                onChange={(e) => setFormData({ ...formData, uso_por_servicio: e.target.value })}
                placeholder="Cuánto usas en cada cliente"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Cuánto del producto usas en promedio por servicio
              </p>
            </div>

            {formData.precio_compra && formData.cantidad_comprada && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-700">
                  <strong>Costo unitario:</strong> {formatCurrency(parseFloat(formData.precio_compra) / parseFloat(formData.cantidad_comprada) || 0)} por {formData.unidad.slice(0, -1) || "unidad"}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-rose-400 hover:bg-rose-500">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId ? "Guardar" : "Agregar"}
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
              <BookOpen className="w-5 h-5 text-blue-500" />
              Catálogo de Productos
            </DialogTitle>
            <p className="text-sm text-gray-500">Selecciona productos para agregar rápidamente a tu inventario</p>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-4 h-[60vh]">
            {/* Categories */}
            <div className="md:w-48 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Categorías</p>
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                {Object.entries(CATALOGO_PRODUCTOS).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm whitespace-nowrap transition-all ${
                      selectedCategory === key 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products List */}
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
                  {catalogProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No hay productos disponibles</p>
                      <p className="text-xs">Ya agregaste todos de esta categoría</p>
                    </div>
                  ) : (
                    catalogProducts.map((product, i) => {
                      const isSelected = selectedProducts.some(p => p.nombre === product.nombre);
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => toggleProductSelection(product)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{product.nombre}</p>
                            <p className="text-xs text-gray-500">
                              {product.tipo === "herramienta" ? "🔧 Herramienta" : "📦 Insumo"} • {product.unidad}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-medium text-gray-900">${product.precio_sugerido}</p>
                            <p className="text-xs text-gray-500">sugerido</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleQuickAdd(product); }}
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

              {selectedProducts.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-700">
                      <strong>{selectedProducts.length}</strong> productos seleccionados
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedProducts([])}>
                        Limpiar
                      </Button>
                      <Button size="sm" onClick={handleBatchAdd} disabled={saving} className="bg-blue-500 hover:bg-blue-600">
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

export { ProductosPage };
