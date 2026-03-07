import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, Eye, Database, Shield, Trash2 } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FDF2F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#FCE7F0] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/login" className="p-2 rounded-xl hover:bg-[#FDF2F7] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#64748B]" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1A1A2E]">NailCost Pro</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#FCE7F0] shadow-sm p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#FDF2F7] flex items-center justify-center">
              <Lock className="w-6 h-6 text-[#E84A8A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">Política de Privacidad</h1>
              <p className="text-sm text-[#64748B]">Última actualización: Diciembre 2024</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[#475569]">
            <p className="text-base">
              En NailCost Pro, nos tomamos muy en serio la privacidad de nuestros usuarios. 
              Esta política describe cómo recopilamos, usamos y protegemos su información.
            </p>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="bg-[#FDF2F7] rounded-xl p-4">
                <Eye className="w-6 h-6 text-[#E84A8A] mb-2" />
                <h3 className="font-semibold text-[#1A1A2E] text-sm">Transparencia</h3>
                <p className="text-xs text-[#64748B]">Le explicamos claramente qué datos recopilamos</p>
              </div>
              <div className="bg-[#FDF2F7] rounded-xl p-4">
                <Shield className="w-6 h-6 text-[#E84A8A] mb-2" />
                <h3 className="font-semibold text-[#1A1A2E] text-sm">Seguridad</h3>
                <p className="text-xs text-[#64748B]">Sus datos están protegidos con encriptación</p>
              </div>
              <div className="bg-[#FDF2F7] rounded-xl p-4">
                <Trash2 className="w-6 h-6 text-[#E84A8A] mb-2" />
                <h3 className="font-semibold text-[#1A1A2E] text-sm">Control</h3>
                <p className="text-xs text-[#64748B]">Puede eliminar sus datos cuando lo desee</p>
              </div>
            </div>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">1. Información que Recopilamos</h2>
            
            <h3 className="font-medium text-[#1A1A2E] mt-4 mb-2">Información de Cuenta</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre y nombre del negocio</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono (opcional)</li>
              <li>Contraseña (almacenada de forma encriptada)</li>
            </ul>

            <h3 className="font-medium text-[#1A1A2E] mt-4 mb-2">Información de Uso</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Productos y servicios que registra</li>
              <li>Información de clientes</li>
              <li>Citas y agenda</li>
              <li>Cálculos y cotizaciones</li>
              <li>Información de empleados (para cuentas de negocio)</li>
            </ul>

            <h3 className="font-medium text-[#1A1A2E] mt-4 mb-2">Información Técnica</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dirección IP</li>
              <li>Tipo de navegador</li>
              <li>Dispositivo utilizado</li>
              <li>Páginas visitadas y acciones realizadas</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">2. Cómo Usamos su Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Proporcionar y mantener el Servicio</li>
              <li>Personalizar su experiencia</li>
              <li>Procesar transacciones</li>
              <li>Enviar notificaciones importantes</li>
              <li>Mejorar nuestros servicios</li>
              <li>Detectar y prevenir fraudes</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">3. Compartir Información</h2>
            <p>
              <strong>No vendemos sus datos personales.</strong> Solo compartimos información en los siguientes casos:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Con su consentimiento explícito</li>
              <li>Para cumplir con obligaciones legales</li>
              <li>Con proveedores de servicios que nos ayudan a operar (bajo acuerdos de confidencialidad)</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">4. Seguridad de Datos</h2>
            <p>Implementamos medidas de seguridad incluyendo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Encriptación de datos en tránsito (HTTPS)</li>
              <li>Contraseñas almacenadas con hash seguro (bcrypt)</li>
              <li>Tokens de autenticación seguros (JWT)</li>
              <li>Acceso restringido a la base de datos</li>
              <li>Monitoreo de actividad sospechosa</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">5. Sus Derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> Solicitar una copia de sus datos</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de su cuenta y datos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato legible</li>
              <li><strong>Oposición:</strong> Oponerse al procesamiento de sus datos</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">6. Retención de Datos</h2>
            <p>
              Conservamos sus datos mientras mantenga una cuenta activa. 
              Si elimina su cuenta, sus datos serán eliminados dentro de 30 días, 
              excepto cuando la ley requiera su conservación.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">7. Cookies</h2>
            <p>
              Utilizamos cookies esenciales para el funcionamiento del Servicio, 
              como mantener su sesión iniciada. No utilizamos cookies de seguimiento publicitario.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">8. Menores de Edad</h2>
            <p>
              El Servicio está dirigido a profesionales y no está diseñado para menores de 18 años. 
              No recopilamos intencionalmente información de menores.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">9. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta política ocasionalmente. Le notificaremos sobre cambios significativos 
              a través del Servicio o por correo electrónico.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">10. Contacto</h2>
            <p>
              Para ejercer sus derechos o si tiene preguntas sobre esta política, 
              puede contactarnos a través de nuestra plataforma.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#FCE7F0]">
            <Link to="/login">
              <button className="text-[#E84A8A] hover:text-[#D63A7A] font-medium text-sm flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export { PrivacidadPage };
