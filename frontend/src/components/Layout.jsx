import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Palette, 
  Sparkles, 
  Receipt, 
  TrendingUp, 
  Calculator, 
  Menu,
  X,
  Users,
  Calendar,
  BarChart3,
  Target,
  ChevronDown,
  Layers,
  Wallet,
  LogOut,
  User,
  Crown,
  Shield
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

// Grouped navigation
const mainNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Inicio" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
];

const serviciosGroup = {
  label: "Servicios",
  icon: Layers,
  items: [
    { to: "/productos", icon: Package, label: "Productos" },
    { to: "/estilos", icon: Palette, label: "Estilos" },
    { to: "/disenos", icon: Sparkles, label: "Diseños" },
  ]
};

const finanzasGroup = {
  label: "Finanzas",
  icon: Wallet,
  items: [
    { to: "/gastos", icon: Receipt, label: "Gastos" },
    { to: "/ganancias", icon: TrendingUp, label: "Ganancias" },
  ]
};

const toolsNavItems = [
  { to: "/calculadora", icon: Calculator, label: "Calculadora" },
  { to: "/reportes-mensuales", icon: BarChart3, label: "Reportes" },
  { to: "/simulacion", icon: Target, label: "Simulación" },
];

// Dropdown Component
const NavDropdown = ({ group, isActive }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200",
          isActive
            ? "bg-stone-800 text-white"
            : "text-stone-600 hover:text-stone-800 hover:bg-stone-100"
        )}
      >
        <group.icon className="w-4 h-4" />
        <span>{group.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-50 animate-fade-in">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-stone-100 text-stone-800 font-medium"
                    : "text-stone-600 hover:bg-stone-50"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

// User Menu Component
const UserMenu = () => {
  const { user, logout, isPremium } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors"
        data-testid="user-menu-btn"
      >
        <div className="w-6 h-6 rounded-full bg-stone-800 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-medium text-stone-700 hidden sm:inline max-w-[100px] truncate">
          {user?.nombre || "Usuario"}
        </span>
        {isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
        <ChevronDown className={cn("w-3 h-3 text-stone-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-stone-100">
            <p className="font-medium text-stone-800 truncate">{user?.nombre}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
            {user?.nombre_negocio && (
              <p className="text-xs text-stone-400 truncate mt-0.5">{user?.nombre_negocio}</p>
            )}
          </div>
          <div className="px-4 py-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isPremium ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-600"
              )}>
                Plan {isPremium ? "Premium" : "Básico"}
              </span>
            </div>
          </div>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
              data-testid="admin-link"
            >
              <Shield className="w-4 h-4" />
              <span>Panel Admin</span>
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if current path is in a group
  const isInServiciosGroup = serviciosGroup.items.some(item => location.pathname === item.to);
  const isInFinanzasGroup = finanzasGroup.items.some(item => location.pathname === item.to);

  // All items for mobile
  const allMobileItems = [
    ...mainNavItems,
    ...serviciosGroup.items,
    ...finanzasGroup.items,
    ...toolsNavItems,
  ];

  return (
    <div className="min-h-screen bg-stone-50" data-testid="app-layout">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5" data-testid="logo-link">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-700 to-stone-900 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:flex items-baseline gap-1">
                <span className="text-lg font-semibold text-stone-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  NailCost
                </span>
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Pro</span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
              {/* Main Items */}
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200",
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

              {/* Divider */}
              <div className="w-px h-6 bg-stone-200 mx-1" />

              {/* Servicios Dropdown */}
              <NavDropdown group={serviciosGroup} isActive={isInServiciosGroup} />

              {/* Finanzas Dropdown */}
              <NavDropdown group={finanzasGroup} isActive={isInFinanzasGroup} />

              {/* Divider */}
              <div className="w-px h-6 bg-stone-200 mx-1" />

              {/* Tools Items */}
              {toolsNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200",
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

            {/* User Menu - Desktop */}
            <div className="hidden lg:block">
              <UserMenu />
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <UserMenu />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <nav 
            className="absolute top-14 left-0 right-0 bg-white border-b border-stone-200 shadow-lg p-4 animate-fade-in max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="mobile-nav"
          >
            {/* Main Section */}
            <div className="mb-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 px-2">Principal</p>
              <div className="grid grid-cols-3 gap-2">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition-colors duration-200",
                        isActive
                          ? "bg-stone-800 text-white"
                          : "text-stone-600 hover:bg-stone-100"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Servicios Section */}
            <div className="mb-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 px-2">Servicios</p>
              <div className="grid grid-cols-3 gap-2">
                {serviciosGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition-colors duration-200",
                        isActive
                          ? "bg-stone-800 text-white"
                          : "text-stone-600 hover:bg-stone-100"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Finanzas Section */}
            <div className="mb-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 px-2">Finanzas</p>
              <div className="grid grid-cols-2 gap-2">
                {finanzasGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition-colors duration-200",
                        isActive
                          ? "bg-stone-800 text-white"
                          : "text-stone-600 hover:bg-stone-100"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Herramientas Section */}
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-2 px-2">Herramientas</p>
              <div className="grid grid-cols-3 gap-2">
                {toolsNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition-colors duration-200",
                        isActive
                          ? "bg-stone-800 text-white"
                          : "text-stone-600 hover:bg-stone-100"
                      )
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Footer - Simplified */}
      <footer className="border-t border-stone-100 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>NailCost Pro</span>
            <span>USD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
