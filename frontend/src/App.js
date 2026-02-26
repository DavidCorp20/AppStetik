import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<ProductosPage />} />
            <Route path="estilos" element={<EstilosPage />} />
            <Route path="disenos" element={<DisenosPage />} />
            <Route path="gastos" element={<GastosPage />} />
            <Route path="ganancias" element={<GananciasPage />} />
            <Route path="calculadora" element={<CalculadoraPage />} />
            <Route path="reporte" element={<ReportePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}

export default App;
