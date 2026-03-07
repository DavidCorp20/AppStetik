import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2, CheckCircle2, Sparkles, KeyRound } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const API = process.env.REACT_APP_BACKEND_URL + '/api';

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setSent(true);
        // In development, show the token
        if (data.debug_token) {
          setToken(data.debug_token);
        }
        toast.success("Instrucciones enviadas");
      } else {
        toast.error(data.detail || "Error al enviar");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResetSuccess(true);
        toast.success("Contraseña actualizada");
      } else {
        toast.error(data.detail || "Token inválido o expirado");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FDF2F7] p-4">
        <Card className="w-full max-w-md border-[#FCE7F0] shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">¡Listo!</h2>
            <p className="text-[#64748B] mb-6">Tu contraseña ha sido actualizada exitosamente</p>
            <Link to="/login">
              <Button className="w-full bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white rounded-xl">
                Iniciar Sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FDF2F7] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
            NailCost Pro
          </h1>
        </div>

        <Card className="border-[#FCE7F0] shadow-xl">
          <CardContent className="p-6">
            {!sent ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#FDF2F7] flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-7 h-7 text-[#E84A8A]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A2E]">¿Olvidaste tu contraseña?</h2>
                  <p className="text-sm text-[#64748B] mt-1">Ingresa tu email para recuperarla</p>
                </div>

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className="pl-10 h-12 rounded-xl border-[#FCE7F0] focus:border-[#E84A8A]"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white rounded-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Instrucciones"}
                  </Button>
                </form>
              </>
            ) : !resetMode ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A2E]">¡Email Enviado!</h2>
                  <p className="text-sm text-[#64748B] mt-1">Revisa tu bandeja de entrada</p>
                </div>

                {/* Development: Show token directly */}
                {token && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <p className="text-xs text-amber-700 font-medium mb-2">🔧 Modo Desarrollo - Token:</p>
                    <code className="text-xs text-amber-800 break-all block bg-amber-100 p-2 rounded">
                      {token}
                    </code>
                  </div>
                )}

                <Button 
                  onClick={() => setResetMode(true)}
                  className="w-full h-12 bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white rounded-xl"
                >
                  Tengo mi código
                </Button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#FDF2F7] flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-7 h-7 text-[#E84A8A]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A2E]">Nueva Contraseña</h2>
                  <p className="text-sm text-[#64748B] mt-1">Ingresa el código y tu nueva contraseña</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Código de recuperación</Label>
                    <Input
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Pega el código aquí"
                      required
                      className="h-12 rounded-xl border-[#FCE7F0] focus:border-[#E84A8A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nueva contraseña</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="h-12 rounded-xl border-[#FCE7F0] focus:border-[#E84A8A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirmar contraseña</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      className="h-12 rounded-xl border-[#FCE7F0] focus:border-[#E84A8A]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white rounded-xl"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Cambiar Contraseña"}
                  </Button>
                </form>
              </>
            )}

            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm text-[#64748B] hover:text-[#E84A8A] mt-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { ForgotPasswordPage };
