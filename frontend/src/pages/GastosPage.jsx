import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, Save, Loader2, Building, Zap, Droplets, Wifi, Phone, Megaphone, Wrench, SprayCan, CreditCard, Calculator as CalcIcon } from "lucide-react";
import { toast } from "sonner";

const gastoFields = [
  { key: "renta", label: "Renta del Local", icon: Building },
  { key: "luz", label: "Luz", icon: Zap },
  { key: "agua", label: "Agua", icon: Droplets },
  { key: "internet", label: "Internet", icon: Wifi },
  { key: "telefono", label: "Teléfono", icon: Phone },
  { key: "publicidad", label: "Publicidad", icon: Megaphone },
  { key: "mantenimiento", label: "Mantenimiento", icon: Wrench },
  { key: "material_limpieza", label: "Material de Limpieza", icon: SprayCan },
  { key: "plataformas_pago", label: "Plataformas de Pago", icon: CreditCard },
  { key: "impuestos", label: "Impuestos", icon: Receipt },
  { key: "otros", label: "Otros Gastos", icon: CalcIcon },
];

export default function GastosPage() {
  const { gastos, updateGastos, loading } = useApp();
  const [formData, setFormData] = useState({
    renta: 0,
    luz: 0,
    agua: 0,
    internet: 0,
    telefono: 0,
    publicidad: 0,
    mantenimiento: 0,
    material_limpieza: 0,
    plataformas_pago: 0,
    impuestos: 0,
    otros: 0,
    clientes_mes: 30,
    servicios_mes: 60,
    dias_trabajo: 22,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (gastos) {
      setFormData({
        renta: gastos.renta || 0,
        luz: gastos.luz || 0,
        agua: gastos.agua || 0,
        internet: gastos.internet || 0,
        telefono: gastos.telefono || 0,
        publicidad: gastos.publicidad || 0,
        mantenimiento: gastos.mantenimiento || 0,
        material_limpieza: gastos.material_limpieza || 0,
        plataformas_pago: gastos.plataformas_pago || 0,
        impuestos: gastos.impuestos || 0,
        otros: gastos.otros || 0,
        clientes_mes: gastos.clientes_mes || 30,
        servicios_mes: gastos.servicios_mes || 60,
        dias_trabajo: gastos.dias_trabajo || 22,
      });
    }
  }, [gastos]);

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateGastos(formData);
      toast.success("Gastos actualizados correctamente");
    } catch (err) {
      toast.error("Error al guardar los gastos");
    } finally {
      setSaving(false);
    }
  };

  const calcTotal = () => {
    return gastoFields.reduce((sum, field) => sum + (formData[field.key] || 0), 0);
  };

  const calcPorServicio = () => {
    const total = calcTotal();
    const servicios = formData.servicios_mes || 60;
    return servicios > 0 ? total / servicios : 0;
  };

  const calcPorCliente = () => {
    const total = calcTotal();
    const clientes = formData.clientes_mes || 30;
    return clientes > 0 ? total / clientes : 0;
  };

  const calcPorDia = () => {
    const total = calcTotal();
    const dias = formData.dias_trabajo || 22;
    return dias > 0 ? total / dias : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="gastos-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Gastos Operativos
        </h1>
        <p className="text-stone-500 mt-1">
          Configura tus gastos mensuales fijos
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gastos Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-stone-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Receipt className="w-5 h-5 text-stone-600" />
                  Gastos Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gastoFields.map((field) => (
                    <div key={field.key} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-stone-200">
                        <field.icon className="w-4 h-4 text-stone-500" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={field.key} className="text-xs text-stone-500">
                          {field.label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                          <Input
                            id={field.key}
                            type="number"
                            step="0.01"
                            value={formData[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            className="pl-7 rounded-lg border-stone-200 h-9"
                            placeholder="0.00"
                            data-testid={`gasto-${field.key}-input`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Division Config */}
            <Card className="bg-white border-stone-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                  División de Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="clientes_mes" className="text-sm text-stone-600">
                      Clientes por Mes
                    </Label>
                    <Input
                      id="clientes_mes"
                      type="number"
                      value={formData.clientes_mes || ""}
                      onChange={(e) => handleChange("clientes_mes", e.target.value)}
                      className="rounded-xl mt-1"
                      placeholder="30"
                      data-testid="clientes-mes-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="servicios_mes" className="text-sm text-stone-600">
                      Servicios por Mes
                    </Label>
                    <Input
                      id="servicios_mes"
                      type="number"
                      value={formData.servicios_mes || ""}
                      onChange={(e) => handleChange("servicios_mes", e.target.value)}
                      className="rounded-xl mt-1"
                      placeholder="60"
                      data-testid="servicios-mes-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dias_trabajo" className="text-sm text-stone-600">
                      Días de Trabajo
                    </Label>
                    <Input
                      id="dias_trabajo"
                      type="number"
                      value={formData.dias_trabajo || ""}
                      onChange={(e) => handleChange("dias_trabajo", e.target.value)}
                      className="rounded-xl mt-1"
                      placeholder="22"
                      data-testid="dias-trabajo-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <Card className="bg-stone-800 text-white border-0 sticky top-24">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white/10 rounded-xl">
                  <p className="text-xs text-stone-300 uppercase tracking-wider">Gasto Total Mensual</p>
                  <p className="text-3xl font-bold text-white mt-1" data-testid="total-gastos">
                    ${calcTotal().toFixed(2)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-stone-300 text-sm">Por Servicio</span>
                    <span className="font-semibold text-white" data-testid="gasto-por-servicio">
                      ${calcPorServicio().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-stone-300 text-sm">Por Cliente</span>
                    <span className="font-semibold text-white" data-testid="gasto-por-cliente">
                      ${calcPorCliente().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="text-stone-300 text-sm">Por Día</span>
                    <span className="font-semibold text-white" data-testid="gasto-por-dia">
                      ${calcPorDia().toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-white text-stone-800 hover:bg-stone-100 rounded-full"
                  data-testid="save-gastos-btn"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> El gasto por servicio se suma automáticamente al calcular tus precios en la calculadora.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export { GastosPage };
