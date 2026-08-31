import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { TutorialProvider } from "@/components/FeatureTutorial";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/Layout";
import { NotificationManager } from "@/components/NotificationManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Dashboard } from "@/pages/Dashboard";
import { ComercioDashboard } from "@/pages/ComercioDashboard";
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
import { ReportesFinancierosPage } from "@/pages/ReportesFinancierosPage";
import { PagosPage } from "@/pages/PagosPage";
import { GestionUsuariosPage } from "@/pages/GestionUsuariosPage";
import { Loader2 } from "lucide-react";

try { const key="nailcost_tutorials_seen_v2"; const raw=localStorage.getItem(key); if(raw!==null && !Array.isArray(JSON.parse(raw))) localStorage.removeItem(key); } catch { localStorage.removeItem("nailcost_tutorials_seen_v2"); }

// StetikApp owns its theme instead of inheriting the browser preference.
// Default is dark, and the choice persists locally across sessions.
const storedTheme = localStorage.getItem("stetik_theme");
document.documentElement.dataset.stetikTheme = storedTheme === "light" ? "light" : "dark";

function DashboardRouter() {
  const { isBusinessUser, isAdmin } = useAuth();
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isBusinessUser) return <ComercioDashboard />;
  return <Dashboard />;
}
function ProtectedRoute() { const { isAuthenticated, loading }=useAuth(); if(loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>; if(!isAuthenticated) return <Navigate to="/login" replace />; return <Outlet/>; }
function PublicRoute() { const { isAuthenticated, loading }=useAuth(); if(loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>; if(isAuthenticated) return <Navigate to="/" replace />; return <Outlet/>; }
function AppRoutes() { return <Routes><Route element={<PublicRoute />}><Route path="/login" element={<LoginPage/>}/><Route path="/registro" element={<RegisterPage/>}/><Route path="/recuperar-contrasena" element={<ForgotPasswordPage/>}/></Route><Route path="/terminos" element={<TerminosPage/>}/><Route path="/privacidad" element={<PrivacidadPage/>}/><Route element={<ProtectedRoute/>}><Route path="/" element={<Layout/>}><Route index element={<DashboardRouter/>}/><Route path="productos" element={<ProductosPage/>}/><Route path="estilos" element={<EstilosPage/>}/><Route path="disenos" element={<DisenosPage/>}/><Route path="gastos" element={<GastosPage/>}/><Route path="ganancias" element={<GananciasPage/>}/><Route path="calculadora" element={<CalculadoraPage/>}/><Route path="reporte" element={<ReportePage/>}/><Route path="clientes" element={<ClientesPage/>}/><Route path="agenda" element={<AgendaPage/>}/><Route path="reportes-mensuales" element={<ReportesMensualesPage/>}/><Route path="simulacion" element={<SimulacionPage/>}/><Route path="admin" element={<AdminPage/>}/><Route path="historial" element={<HistorialPage/>}/><Route path="empleados" element={<EmpleadosPage/>}/><Route path="inventario" element={<InventarioPage/>}/><Route path="facturacion" element={<FacturacionPage/>}/><Route path="reportes-financieros" element={<ReportesFinancierosPage/>}/><Route path="pagos" element={<PagosPage/>}/><Route path="gestion-usuarios" element={<GestionUsuariosPage/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes>; }
function App(){ return <ErrorBoundary><AuthProvider><AppProvider><TutorialProvider><BrowserRouter><AppRoutes/><NotificationManager/></BrowserRouter><Toaster position="top-right" richColors/></TutorialProvider></AppProvider></AuthProvider></ErrorBoundary>; }
export default App;
