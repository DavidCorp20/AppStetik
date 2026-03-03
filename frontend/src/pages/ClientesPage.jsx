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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Users, Phone, Mail, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

const emptyCliente = {
  nombre: "",
  telefono: "",
  email: "",
  notas: "",
};

export default function ClientesPage() {
  const { clientes, addCliente, updateCliente, deleteCliente, loading } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyCliente);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenDialog = (cliente = null) => {
    if (cliente) {
      setEditingId(cliente.id);
      setFormData({
        nombre: cliente.nombre,
        telefono: cliente.telefono || "",
        email: cliente.email || "",
        notas: cliente.notas || "",
      });
    } else {
      setEditingId(null);
      setFormData(emptyCliente);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (editingId) {
        await updateCliente(editingId, formData);
        toast.success("Cliente actualizado");
      } else {
        await addCliente(formData);
        toast.success("Cliente agregado");
      }
      
      setDialogOpen(false);
      setFormData(emptyCliente);
      setEditingId(null);
    } catch (err) {
      toast.error("Error al guardar el cliente");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás segura de eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        toast.success("Cliente eliminado");
      } catch (err) {
        toast.error("Error al eliminar el cliente");
      }
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="clientes-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
            Clientes
          </h1>
          <p className="text-stone-500 mt-1">
            Gestiona tu base de clientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-stone-800 hover:bg-stone-900 text-white rounded-full"
              data-testid="add-cliente-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" data-testid="cliente-dialog">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Playfair Display, serif' }}>
                {editingId ? "Editar Cliente" : "Nuevo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre completo"
                  className="rounded-xl mt-1"
                  required
                  data-testid="cliente-nombre-input"
                />
              </div>
              
              <div>
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="rounded-xl mt-1"
                  data-testid="cliente-telefono-input"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="cliente@email.com"
                  className="rounded-xl mt-1"
                  data-testid="cliente-email-input"
                />
              </div>

              <div>
                <Label htmlFor="notas">Notas</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Preferencias, alergias, etc."
                  className="rounded-xl mt-1 resize-none"
                  rows={3}
                  data-testid="cliente-notas-input"
                />
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
                  data-testid="save-cliente-btn"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md rounded-xl"
          data-testid="search-clientes"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white border-stone-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-stone-800">{clientes.length}</p>
                <p className="text-xs text-stone-500">Total Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="bg-white border-stone-100" data-testid="clientes-table-card">
        <CardContent className="p-0">
          {filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">
                {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
              </p>
              {!searchTerm && (
                <Button 
                  variant="link" 
                  onClick={() => handleOpenDialog()}
                  className="text-stone-700 mt-2"
                >
                  Agregar tu primer cliente
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-stone-100">
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase">Cliente</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase">Contacto</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-center">Visitas</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase">Última Visita</TableHead>
                    <TableHead className="text-xs font-semibold text-stone-500 uppercase text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente) => (
                    <TableRow 
                      key={cliente.id} 
                      className="border-stone-100 hover:bg-stone-50"
                      data-testid={`cliente-row-${cliente.id}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-stone-800">{cliente.nombre}</p>
                          {cliente.notas && (
                            <p className="text-xs text-stone-400 truncate max-w-[200px]">{cliente.notas}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cliente.telefono && (
                            <div className="flex items-center gap-1 text-sm text-stone-600">
                              <Phone className="w-3 h-3" />
                              {cliente.telefono}
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-1 text-sm text-stone-600">
                              <Mail className="w-3 h-3" />
                              {cliente.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-stone-100">
                          {cliente.total_visitas || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cliente.ultima_visita ? (
                          <div className="flex items-center gap-1 text-sm text-stone-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(cliente.ultima_visita).toLocaleDateString('es-ES')}
                          </div>
                        ) : (
                          <span className="text-stone-400 text-sm">Sin visitas</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(cliente)}
                            className="h-8 w-8 p-0"
                            data-testid={`edit-cliente-${cliente.id}`}
                          >
                            <Pencil className="w-4 h-4 text-stone-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cliente.id)}
                            className="h-8 w-8 p-0"
                            data-testid={`delete-cliente-${cliente.id}`}
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

export { ClientesPage };
