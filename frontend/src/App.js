import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/Layout";

// Dashboards
import { PersonaDashboard } from "@/pages/PersonaDashboard";
import { ComercioDashboard } from "@/pages/ComercioDashboard";

// Pages
import { ProductosPage } from "@/pages/ProductosPage";
import { EstilosPage } from "@/pages/EstilosPage";
import { DisenosPage } from "@/pages/DisenosPage";
import { GastosPage } from "@/pages/GastosPage";
import { GananciasPage } from "@/pages/GananciasPage";
import { CalculadoraPage } from "@/pages/CalculadoraPage";
import { ReportePage } from "@/pages/ReportePage";
import { ClientesPage } from "@/pages/ClientesPage";
import { AgendaPage } from "@/pages/AgendaPage";
import { ReportesMensualesPage } from "@/pages/ReportesMensualesPage";
import { SimulacionPage } from "@/pages/SimulacionPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AdminPage } from "@/pages/AdminPage";
import { HistorialPage } from "@/pages/HistorialPage";
import { EmpleadosPage } from "@/pages/EmpleadosPage";
import { InventarioPage } from "@/pages/InventarioPage";
import { FacturacionPage } from "@/pages/FacturacionPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { TerminosPage } from "@/pages/TerminosPage";
import { PrivacidadPage } from "@/pages/PrivacidadPage";
import { Loader2 } from "lucide-react";

// Dashboard Router - selects based on user type
function DashboardRouter() {
  const { isBusinessUser } = useAuth();
  
  if (isBusinessUser) {
    return <ComercioDashboard />;
  }
  
  return <PersonaDashboard />;
}

// Protected Route wrapper
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FDF2F7]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E84A8A] mx-auto mb-4" />
          <p className="text-[#64748B]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Public Route wrapper (redirect to home if authenticated)
function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#FDF2F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E84A8A]" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
      </Route>

      {/* Legal pages - accessible without auth */}
      <Route path="/terminos" element={<TerminosPage />} />
      <Route path="/privacidad" element={<PrivacidadPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          {/* Dashboard based on user type */}
          <Route index element={<DashboardRouter />} />
          
          {/* Common pages */}
          <Route path="productos" element={<ProductosPage />} />
          <Route path="estilos" element={<EstilosPage />} />
          <Route path="disenos" element={<DisenosPage />} />
          <Route path="gastos" element={<GastosPage />} />
          <Route path="ganancias" element={<GananciasPage />} />
          <Route path="calculadora" element={<CalculadoraPage />} />
          <Route path="reporte" element={<ReportePage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="agenda" element={<AgendaPage />} />
          <Route path="reportes-mensuales" element={<ReportesMensualesPage />} />
          <Route path="simulacion" element={<SimulacionPage />} />
          <Route path="admin" element={<AdminPage />} />
          
          {/* Persona-specific pages */}
          <Route path="historial" element={<HistorialPage />} />
          
          {/* Comercio-specific pages */}
          <Route path="empleados" element={<EmpleadosPage />} />
          <Route path="inventario" element={<InventarioPage />} />
          <Route path="facturacion" element={<FacturacionPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
