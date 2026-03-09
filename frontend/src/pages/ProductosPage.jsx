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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Package, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { FeatureHelpButton, AutoFeatureTutorial } from "@/components/FeatureTutorial";

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
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyProducto);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("todos");

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
      setEditingId(null);
    } catch (err) {
      toast.error("Error al guardar el producto");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este producto?")) {
      try {
        await deleteProducto(id);
        toast.success("Producto eliminado");
      } catch (err) {
        toast.error("Error al eliminar el producto");
      }
    }
  };

  const filteredProductos = productos.filter(p => {
    if (filter === "todos") return true;
    return p.tipo === filter;
  });

  const insumos = productos.filter(p => p.tipo === "insumo");
  const herramientas = productos.filter(p => p.tipo === "herramienta");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="add-product-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-testid="product-dialog">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingId ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Acrílico"
                  className="rounded-xl mt-1"
                  required
                  data-testid="product-name-input"
                />
              </div>
              
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                >
                  <SelectTrigger className="rounded-xl mt-1" data-testid="product-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insumo">Insumo</SelectItem>
                    <SelectItem value="herramienta">Herramienta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precio">Precio de Compra ($)</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio_compra}
                    onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                    placeholder="25.00"
                    className="rounded-xl mt-1"
                    required
                    data-testid="product-price-input"
                  />
                </div>
                <div>
                  <Label htmlFor="cantidad">Cantidad Comprada</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="0.01"
                    value={formData.cantidad_comprada}
                    onChange={(e) => setFormData({ ...formData, cantidad_comprada: e.target.value })}
                    placeholder="50"
                    className="rounded-xl mt-1"
                    required
                    data-testid="product-quantity-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="unidad">Unidad</Label>
                  <Select 
                    value={formData.unidad} 
                    onValueChange={(val) => setFormData({ ...formData, unidad: val })}
                  >
                    <SelectTrigger className="rounded-xl mt-1" data-testid="product-unit-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="gramos">Gramos</SelectItem>
                      <SelectItem value="ml">Mililitros</SelectItem>
                      <SelectItem value="usos">Usos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="uso">Uso por Servicio</Label>
                  <Input
                    id="uso"
                    type="number"
                    step="0.01"
                    value={formData.uso_por_servicio}
                    onChange={(e) => setFormData({ ...formData, uso_por_servicio: e.target.value })}
                    placeholder="3"
                    className="rounded-xl mt-1"
                    required
                    data-testid="product-usage-input"
                  />
                </div>
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
                  data-testid="save-product-btn"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">{insumos.length}</p>
                <p className="text-xs text-stone-500">Insumos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">{herramientas.length}</p>
                <p className="text-xs text-stone-500">Herramientas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-stone-100 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">$</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">
                  ${productos.reduce((sum, p) => sum + p.costo_unitario, 0).toFixed(2)}
                </p>
                <p className="text-xs text-stone-500">Costo Total/Serv.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === "todos" ? "default" : "outline"}
          onClick={() => setFilter("todos")}
          className={`rounded-full ${filter === "todos" ? "bg-stone-800 text-white" : ""}`}
          data-testid="filter-all"
        >
          Todos
        </Button>
        <Button
          variant={filter === "insumo" ? "default" : "outline"}
          onClick={() => setFilter("insumo")}
          className={`rounded-full ${filter === "insumo" ? "bg-stone-800 text-white" : ""}`}
          data-testid="filter-insumo"
        >
          Insumos
        </Button>
        <Button
          variant={filter === "herramienta" ? "default" : "outline"}
          onClick={() => setFilter("herramienta")}
          className={`rounded-full ${filter === "herramienta" ? "bg-stone-800 text-white" : ""}`}
          data-testid="filter-herramienta"
        >
          Herramientas
        </Button>
      </div>

      {/* Products Table */}
      <Card className="bg-white border-stone-100" data-testid="products-table-card">
        <CardContent className="p-0">
          {filteredProductos.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No hay productos registrados</p>
              <Button 
                variant="link" 
                onClick={() => handleOpenDialog()}
                className="text-stone-700 mt-2"
              >
                Agregar tu primer producto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-100">
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase">Nombre</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase">Tipo</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Precio</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Cantidad</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Uso/Serv.</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Costo Unit.</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProductos.map((producto) => (
                    <TableRow 
                      key={producto.id} 
                      className="border-stone-100 hover:bg-stone-50"
                      data-testid={`product-row-${producto.id}`}
                    >
                      <TableCell className="font-medium text-stone-800">{producto.nombre}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={producto.tipo === "insumo" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}
                        >
                          {producto.tipo === "insumo" ? "Insumo" : "Herramienta"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${producto.precio_compra.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{producto.cantidad_comprada} {producto.unidad}</TableCell>
                      <TableCell className="text-right">{producto.uso_por_servicio}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        ${producto.costo_unitario.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(producto)}
                            className="h-8 w-8 p-0"
                            data-testid={`edit-product-${producto.id}`}
                          >
                            <Pencil className="w-4 h-4 text-stone-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(producto.id)}
                            className="h-8 w-8 p-0"
                            data-testid={`delete-product-${producto.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
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
    </div>
  );
}

export { ProductosPage };
