import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
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
import { Loader2 } from "lucide-react";

// Protected Route wrapper
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400 mx-auto mb-4" />
          <p className="text-stone-500">Cargando...</p>
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
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
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
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
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
