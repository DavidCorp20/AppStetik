import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Save, Loader2, Target, DollarSign, Clock, Percent } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function GananciasPage() {
  const { configGanancias, updateConfigGanancias, loading } = useApp();
  const [formData, setFormData] = useState({
    porcentaje_ganancia: 30,
    meta_ingreso_mensual: 2000,
    meta_diaria: 100,
    sueldo_objetivo: 1500,
    costo_hora_trabajo: 15,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (configGanancias) {
      setFormData({
        porcentaje_ganancia: configGanancias.porcentaje_ganancia || 30,
        meta_ingreso_mensual: configGanancias.meta_ingreso_mensual || 2000,
        meta_diaria: configGanancias.meta_diaria || 100,
        sueldo_objetivo: configGanancias.sueldo_objetivo || 1500,
        costo_hora_trabajo: configGanancias.costo_hora_trabajo || 15,
      });
    }
  }, [configGanancias]);

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
      await updateConfigGanancias(formData);
      toast.success("Configuración actualizada");
    } catch (err) {
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  // Calcular proyecciones
  const calcServiciosPorDia = () => {
    // Asumiendo 8 horas de trabajo y 1.5 horas promedio por servicio
    return Math.floor(8 / 1.5);
  };

  const calcIngresoEstimado = () => {
    // Meta diaria * días de trabajo (22)
    return formData.meta_diaria * 22;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" data-testid="ganancias-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
          Configuración de Ganancias
        </h1>
        <p className="text-stone-500 mt-1">
          Define tus metas y márgenes de ganancia
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Porcentaje de Ganancia */}
            <Card className="bg-white border-stone-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Percent className="w-5 h-5 text-emerald-600" />
                  Margen de Ganancia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-stone-600">Porcentaje de Ganancia</Label>
                    <span className="text-2xl font-bold text-emerald-700" data-testid="porcentaje-display">
                      {formData.porcentaje_ganancia}%
                    </span>
                  </div>
                  <Slider
                    value={[formData.porcentaje_ganancia]}
                    onValueChange={(val) => handleChange("porcentaje_ganancia", val[0])}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                    data-testid="porcentaje-slider"
                  />
                  <div className="flex justify-between text-xs text-stone-400 mt-2">
                    <span>10%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl">
                  <p className="text-sm text-stone-600">
                    Este porcentaje se aplicará sobre el costo total de cada servicio para calcular el precio recomendado.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Metas */}
            <Card className="bg-white border-stone-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <Target className="w-5 h-5 text-violet-600" />
                  Metas de Ingreso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="meta_mensual" className="text-stone-600">
                      Meta de Ingreso Mensual
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                      <Input
                        id="meta_mensual"
                        type="number"
                        step="100"
                        value={formData.meta_ingreso_mensual || ""}
                        onChange={(e) => handleChange("meta_ingreso_mensual", e.target.value)}
                        className="pl-8 rounded-xl"
                        placeholder="2000"
                        data-testid="meta-mensual-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta_diaria" className="text-stone-600">
                      Meta Diaria
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                      <Input
                        id="meta_diaria"
                        type="number"
                        step="10"
                        value={formData.meta_diaria || ""}
                        onChange={(e) => handleChange("meta_diaria", e.target.value)}
                        className="pl-8 rounded-xl"
                        placeholder="100"
                        data-testid="meta-diaria-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sueldo_objetivo" className="text-stone-600">
                      Sueldo Objetivo
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                      <Input
                        id="sueldo_objetivo"
                        type="number"
                        step="100"
                        value={formData.sueldo_objetivo || ""}
                        onChange={(e) => handleChange("sueldo_objetivo", e.target.value)}
                        className="pl-8 rounded-xl"
                        placeholder="1500"
                        data-testid="sueldo-objetivo-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="costo_hora" className="text-stone-600">
                      Costo por Hora de Trabajo
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                      <Input
                        id="costo_hora"
                        type="number"
                        step="1"
                        value={formData.costo_hora_trabajo || ""}
                        onChange={(e) => handleChange("costo_hora_trabajo", e.target.value)}
                        className="pl-8 rounded-xl"
                        placeholder="15"
                        data-testid="costo-hora-input"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 sticky top-24">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <TrendingUp className="w-5 h-5" />
                  Proyecciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white/10 rounded-xl">
                  <p className="text-xs text-emerald-100 uppercase tracking-wider">Ingreso Mensual Estimado</p>
                  <p className="text-3xl font-bold text-white mt-1" data-testid="ingreso-estimado">
                    ${calcIngresoEstimado().toFixed(2)}
                  </p>
                  <p className="text-xs text-emerald-200 mt-1">
                    Basado en tu meta diaria × 22 días
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-2 text-emerald-100 text-sm">
                      <DollarSign className="w-4 h-4" />
                      Por Hora
                    </span>
                    <span className="font-semibold text-white">
                      ${formData.costo_hora_trabajo.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-2 text-emerald-100 text-sm">
                      <Clock className="w-4 h-4" />
                      Servicios/Día Est.
                    </span>
                    <span className="font-semibold text-white">
                      ~{calcServiciosPorDia()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                    <span className="flex items-center gap-2 text-emerald-100 text-sm">
                      <Percent className="w-4 h-4" />
                      Margen
                    </span>
                    <span className="font-semibold text-white">
                      {formData.porcentaje_ganancia}%
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-white text-emerald-700 hover:bg-emerald-50 rounded-full"
                  data-testid="save-ganancias-btn"
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

            {/* Tips */}
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="p-4">
                <p className="text-sm text-violet-800">
                  <strong>Recomendación:</strong> Un margen del 30-40% es común en el sector beauty. Ajusta según tu mercado y competencia.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export { GananciasPage };
