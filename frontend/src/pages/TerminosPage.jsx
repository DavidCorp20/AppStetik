import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";

export default function TerminosPage() {
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
              <Shield className="w-6 h-6 text-[#E84A8A]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A2E]">Términos y Condiciones</h1>
              <p className="text-sm text-[#64748B]">Última actualización: Diciembre 2024</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[#475569]">
            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar NailCost Pro ("el Servicio"), usted acepta estar sujeto a estos Términos y Condiciones. 
              Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al Servicio.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">2. Descripción del Servicio</h2>
            <p>
              NailCost Pro es una herramienta de gestión y calculadora de costos diseñada para profesionales del sector de uñas y belleza. 
              El Servicio permite:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Calcular costos y precios de servicios de uñas</li>
              <li>Gestionar productos e inventario</li>
              <li>Administrar clientes y citas</li>
              <li>Generar reportes de rentabilidad</li>
              <li>Gestionar empleados (para cuentas de negocio)</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">3. Registro de Cuenta</h2>
            <p>
              Para utilizar el Servicio, debe crear una cuenta proporcionando información precisa y completa. 
              Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">4. Planes y Pagos</h2>
            <p>
              El Servicio ofrece diferentes planes de suscripción:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Plan Básico (Gratuito):</strong> Funcionalidades limitadas</li>
              <li><strong>Plan Premium:</strong> Acceso completo a todas las funcionalidades</li>
            </ul>
            <p className="mt-2">
              Los precios están sujetos a cambios con previo aviso. Las suscripciones se renuevan automáticamente a menos que se cancelen.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">5. Uso Aceptable</h2>
            <p>
              Usted se compromete a no:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar el Servicio para fines ilegales</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Interferir con el funcionamiento del Servicio</li>
              <li>Copiar o distribuir el software sin autorización</li>
              <li>Utilizar bots o sistemas automatizados de manera abusiva</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">6. Propiedad Intelectual</h2>
            <p>
              El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de NailCost Pro. 
              El Servicio está protegido por derechos de autor, marcas registradas y otras leyes.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">7. Limitación de Responsabilidad</h2>
            <p>
              En ningún caso NailCost Pro será responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, 
              incluyendo pérdida de beneficios, datos, uso u otras pérdidas intangibles.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">8. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. 
              Es su responsabilidad revisar estos Términos periódicamente.
            </p>

            <h2 className="text-lg font-semibold text-[#1A1A2E] mt-6 mb-3">9. Contacto</h2>
            <p>
              Si tiene preguntas sobre estos Términos, puede contactarnos a través de nuestra plataforma.
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

export { TerminosPage };
