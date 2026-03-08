import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  X, 
  Share2, 
  Copy, 
  Check,
  Sparkles
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export function FloatingCalculator() {
  const { estilos, calcularPrecio } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEstilo, setSelectedEstilo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCalculate = async () => {
    if (!selectedEstilo) {
      toast.error("Selecciona un estilo");
      return;
    }

    setCalculating(true);
    try {
      const result = await calcularPrecio(selectedEstilo, []);
      setResultado(result);
    } catch (err) {
      toast.error("Error al calcular");
    } finally {
      setCalculating(false);
    }
  };

  const handleCopy = () => {
    if (!resultado) return;
    
    const text = `💅 *Cotización NailCost*\n\n` +
      `Servicio: ${resultado.estilo_nombre}\n` +
      `Precio: $${resultado.precio_recomendado.toFixed(2)}\n\n` +
      `¡Gracias por tu preferencia! ✨`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copiado al portapapeles");
  };

  const handleShare = () => {
    if (!resultado) return;
    
    const text = encodeURIComponent(
      `💅 *Cotización NailCost*\n\n` +
      `Servicio: ${resultado.estilo_nombre}\n` +
      `Precio: $${resultado.precio_recomendado.toFixed(2)}\n\n` +
      `¡Gracias por tu preferencia! ✨`
    );
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleClose = () => {
    setIsOpen(false);
    setResultado(null);
    setSelectedEstilo("");
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg shadow-[#E84A8A]/40 hover:shadow-xl hover:shadow-[#E84A8A]/50 hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 animate-bounce-soft"
        data-testid="floating-calc-btn"
      >
        <Calculator className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div 
            className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#FCE7F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A2E]">Calculadora Rápida</h3>
                  <p className="text-xs text-[#64748B]">Calcula precios al instante</p>
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-[#FDF2F7] transition-colors"
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {!resultado ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#1A1A2E]">Selecciona un servicio</label>
                    <Select value={selectedEstilo} onValueChange={setSelectedEstilo}>
                      <SelectTrigger className="w-full h-12 rounded-xl border-[#FCE7F0]">
                        <SelectValue placeholder="Elige un estilo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {estilos.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.nombre} ({e.tiempo_minutos} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={calculating || !selectedEstilo}
                    className="w-full h-12 bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] hover:from-[#D63A7A] hover:to-[#E84A8A] text-white rounded-full shadow-lg"
                  >
                    {calculating ? (
                      <span className="animate-pulse">Calculando...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Calcular Precio
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Result */}
                  <div className="bg-gradient-to-br from-[#FDF2F7] to-[#FFE4EE] rounded-2xl p-5 text-center">
                    <p className="text-sm text-[#64748B] mb-1">Precio Recomendado</p>
                    <p className="text-4xl font-bold text-[#E84A8A]">
                      {formatCurrency(resultado.precio_recomendado)}
                    </p>
                    <p className="text-sm text-[#1A1A2E] mt-2">{resultado.estilo_nombre}</p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                      <p className="text-xs text-[#64748B]">Costo</p>
                      <p className="text-lg font-semibold text-[#1A1A2E]">{formatCurrency(resultado.costo_total)}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                      <p className="text-xs text-[#64748B]">Ganancia</p>
                      <p className="text-lg font-semibold text-[#10B981]">{formatCurrency(resultado.ganancia)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="h-12 rounded-xl border-[#FCE7F0] hover:bg-[#FDF2F7]"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      Copiar
                    </Button>
                    <Button
                      onClick={handleShare}
                      className="h-12 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      setResultado(null);
                      setSelectedEstilo("");
                    }}
                    variant="ghost"
                    className="w-full text-[#64748B]"
                  >
                    Calcular otro
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
