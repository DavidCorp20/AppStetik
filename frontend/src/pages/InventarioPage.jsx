import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  History,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  Loader2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Edit2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, exportToExcel } from "@/lib/utils";
import { FeatureHelpButton, AutoFeatureTutorial } from "@/components/FeatureTutorial";

// Movement Type Badge
const MovementBadge = ({ type }) => {
  const styles = {
    entrada: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: ArrowUpRight },
    salida: { bg: 'bg-red-100', text: 'text-red-700', icon: ArrowDownRight },
    ajuste: { bg: 'bg-blue-100', text: 'text-blue-700', icon: RefreshCw },
  };
  const s = styles[type] || styles.ajuste;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${s.bg} ${s.text}`}>
      <Icon className="w-3 h-3" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// Stock Level Indicator
const StockLevel = ({ current, minimum }) => {
  const percentage = minimum > 0 ? (current / minimum) * 100 : 100;
  let color = 'bg-emerald-500';
  let status = 'Normal';
  
  if (current === 0) {
    color = 'bg-red-500';
    status = 'Agotado';
  } else if (percentage <= 50) {
    color = 'bg-red-500';
    status = 'Crítico';
  } else if (percentage <= 100) {
    color = 'bg-amber-500';
    status = 'Bajo';
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, percentage)}%` }} />
        </div>
      </div>
      <span className={`text-xs font-medium ${current === 0 ? 'text-red-600' : percentage <= 100 ? 'text-amber-600' : 'text-emerald-600'}`}>
        {status}
      </span>
    </div>
  );
};

export default function InventarioPage() {
  const { user, isBusinessUser } = useAuth();
  const { productos, refreshProductos } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movementForm, setMovementForm] = useState({
    tipo: "entrada",
    cantidad: 1,
    notas: "",
  });

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/inventario/movimientos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMovimientos(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const token = localStorage.getItem('nailcost_token');
    try {
      const res = await fetch(`${API}/inventario/movimiento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          producto_id: selectedProduct.id,
          tipo: movementForm.tipo,
          cantidad: parseInt(movementForm.cantidad),
          notas: movementForm.notas
        })
      });

      if (res.ok) {
        toast.success(`${movementForm.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada`);
        fetchMovimientos();
        refreshProductos();
        setDialogOpen(false);
        setSelectedProduct(null);
        setMovementForm({ tipo: "entrada", cantidad: 1, notas: "" });
      } else {
        const error = await res.json();
        toast.error(error.detail || "Error al registrar movimiento");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const openMovementDialog = (product, type = "entrada") => {
    setSelectedProduct(product);
    setMovementForm(prev => ({ ...prev, tipo: type }));
    setDialogOpen(true);
  };

  // Helper to get stock value (fallback to cantidad_comprada for older products)
  const getStock = (p) => p.cantidad_disponible ?? p.cantidad_comprada ?? 0;

  // Filter products
  const filteredProducts = productos.filter(p => {
    const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    const stockMinimo = p.stock_minimo || 5;
    const stockActual = getStock(p);
    
    if (filterStatus === "agotado") return matchesSearch && stockActual === 0;
    if (filterStatus === "bajo") return matchesSearch && stockActual > 0 && stockActual <= stockMinimo;
    if (filterStatus === "normal") return matchesSearch && stockActual > stockMinimo;
    return matchesSearch;
  });

  // Stats
  const totalProducts = productos.length;
  const outOfStock = productos.filter(p => getStock(p) === 0).length;
  const lowStock = productos.filter(p => {
    const stock = getStock(p);
    const min = p.stock_minimo || 5;
    return stock > 0 && stock <= min;
  }).length;
  const normalStock = totalProducts - outOfStock - lowStock;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleExportInventory = () => {
    if (!productos.length) {
      toast.error("No hay productos para exportar");
      return;
    }
    const columns = [
      { header: 'Producto', key: 'nombre' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Stock Actual', accessor: (r) => r.cantidad_disponible || 0 },
      { header: 'Stock Mínimo', accessor: (r) => r.stock_minimo || 5 },
      { header: 'Precio Compra ($)', accessor: (r) => r.precio_compra || 0 },
      { header: 'Unidad', key: 'unidad' },
    ];
    exportToExcel(productos, 'inventario', columns);
    toast.success("Inventario exportado");
  };

  return (
    <div className="space-y-6" data-testid="inventario-page">
      {/* Auto Tutorial */}
      <AutoFeatureTutorial feature="inventario" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Control de Inventario</h1>
            <FeatureHelpButton feature="inventario" />
          </div>
          <p className="text-sm text-gray-500">Gestiona el stock de tus productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-200" onClick={handleExportInventory}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" className="border-gray-200">
            <History className="w-4 h-4 mr-2" />
            Historial
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
                <p className="text-xs text-gray-500">Total productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{normalStock}</p>
                <p className="text-xs text-gray-500">Stock normal</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{lowStock}</p>
                <p className="text-xs text-gray-500">Stock bajo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{outOfStock}</p>
                <p className="text-xs text-gray-500">Agotados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
            <Filter className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="normal">Stock normal</SelectItem>
            <SelectItem value="bajo">Stock bajo</SelectItem>
            <SelectItem value="agotado">Agotados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card className="border-gray-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Producto</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Stock Actual</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Mínimo</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Estado</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase py-3 px-4">Costo Unit.</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockActual = getStock(product);
                  const stockMinimo = product.stock_minimo || 5;
                  return (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.nombre}</p>
                          <p className="text-xs text-gray-500">{product.unidad_medida}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-semibold ${stockActual === 0 ? 'text-red-600' : stockActual <= stockMinimo ? 'text-amber-600' : 'text-gray-900'}`}>
                          {stockActual}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{stockMinimo}</td>
                      <td className="py-3 px-4">
                        <StockLevel current={stockActual} minimum={stockMinimo} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatCurrency(product.costo_unitario)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMovementDialog(product, "entrada")}
                            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMovementDialog(product, "salida")}
                            className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={stockActual === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Movements */}
      {movimientos.length > 0 && (
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-gray-900">Movimientos Recientes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {movimientos.slice(0, 5).map((mov, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <MovementBadge type={mov.tipo} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mov.producto_nombre}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(mov.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${mov.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Movement Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {movementForm.tipo === 'entrada' ? 'Registrar Entrada' : 'Registrar Salida'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMovement} className="space-y-4">
            {selectedProduct && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedProduct.nombre}</p>
                <p className="text-sm text-gray-500">Stock actual: {getStock(selectedProduct)}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <Select value={movementForm.tipo} onValueChange={(v) => setMovementForm(prev => ({ ...prev, tipo: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada (compra/reposición)</SelectItem>
                  <SelectItem value="salida">Salida (uso/venta)</SelectItem>
                  <SelectItem value="ajuste">Ajuste de inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={movementForm.cantidad}
                onChange={(e) => setMovementForm(prev => ({ ...prev, cantidad: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                value={movementForm.notas}
                onChange={(e) => setMovementForm(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Ej: Compra en proveedor X"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className={`flex-1 ${movementForm.tipo === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
              >
                Registrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { InventarioPage };
