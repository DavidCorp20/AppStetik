import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Palette, 
  Sparkles, 
  Receipt, 
  TrendingUp, 
  Calculator, 
  FileText,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/productos", icon: Package, label: "Productos" },
  { to: "/estilos", icon: Palette, label: "Estilos" },
  { to: "/disenos", icon: Sparkles, label: "Diseños" },
  { to: "/gastos", icon: Receipt, label: "Gastos" },
  { to: "/ganancias", icon: TrendingUp, label: "Ganancias" },
  { to: "/calculadora", icon: Calculator, label: "Calculadora" },
  { to: "/reporte", icon: FileText, label: "Reporte" },
];

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50" data-testid="app-layout">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3" data-testid="logo-link">
              <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>N</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-medium text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  NailCost Pro
                </h1>
                <p className="text-xs text-stone-500 -mt-0.5">Calculadora de Costos</p>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-stone-800 text-white"
                        : "text-stone-600 hover:text-stone-800 hover:bg-stone-100"
                    )
                  }
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <nav 
            className="absolute top-16 left-0 right-0 bg-white border-b border-stone-200 shadow-lg p-4 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            data-testid="mobile-nav"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-stone-800 text-white"
                        : "text-stone-600 hover:bg-stone-100"
                    )
                  }
                  data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-stone-500">
              NailCost Pro — Tu herramienta profesional de costos
            </p>
            <p className="text-xs text-stone-400">
              Precios en USD
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
