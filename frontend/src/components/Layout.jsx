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
          "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
          isActive
            ? "bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg shadow-[#E84A8A]/25"
            : "text-[#64748B] hover:text-[#E84A8A] hover:bg-[#FDF2F7]"
        )}
      >
        <group.icon className="w-4 h-4" />
        <span>{group.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#FCE7F0] py-2 z-50 animate-fade-in">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-[#FDF2F7] text-[#E84A8A] font-medium"
                    : "text-[#64748B] hover:bg-[#FDF2F7] hover:text-[#E84A8A]"
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
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FDF2F7] hover:bg-[#FCE7F0] transition-colors border border-[#FCE7F0]"
        data-testid="user-menu-btn"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-[#1A1A2E] hidden sm:inline max-w-[100px] truncate">
          {user?.nombre || "Usuario"}
        </span>
        {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
        <ChevronDown className={cn("w-3 h-3 text-[#64748B] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#FCE7F0] py-2 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-[#FCE7F0]">
            <p className="font-semibold text-[#1A1A2E] truncate">{user?.nombre}</p>
            <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
            {user?.nombre_negocio && (
              <p className="text-xs text-[#E84A8A] truncate mt-0.5">{user?.nombre_negocio}</p>
            )}
          </div>
          <div className="px-4 py-2 border-b border-[#FCE7F0]">
            <span className={cn(
              "text-xs px-3 py-1 rounded-full font-medium",
              isPremium 
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" 
                : "bg-[#FDF2F7] text-[#E84A8A]"
            )}>
              {isPremium ? "✨ Premium" : "Plan Básico"}
            </span>
          </div>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
              data-testid="admin-link"
            >
              <Shield className="w-4 h-4" />
              <span>Panel Admin</span>
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FDF2F7]" data-testid="app-layout">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-[#FCE7F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5" data-testid="logo-link">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg shadow-[#E84A8A]/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  NailCost
                </span>
                <span className="text-xs font-semibold text-[#E84A8A] uppercase tracking-wider">Pro</span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg shadow-[#E84A8A]/25"
                        : "text-[#64748B] hover:text-[#E84A8A] hover:bg-[#FDF2F7]"
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
                        ? "bg-gradient-to-r from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg shadow-[#E84A8A]/25"
                        : "text-[#64748B] hover:text-[#E84A8A] hover:bg-[#FDF2F7]"
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
                className="p-2.5 rounded-xl bg-[#FDF2F7] hover:bg-[#FCE7F0] transition-colors"
                data-testid="mobile-menu-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#E84A8A]" /> : <Menu className="w-5 h-5 text-[#E84A8A]" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <nav 
            className="absolute top-16 left-0 right-0 bg-white border-b border-[#FCE7F0] shadow-xl p-4 animate-fade-in max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="mobile-nav"
          >
            {/* Main Section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#E84A8A] uppercase tracking-wider mb-3 px-2">Principal</p>
              <div className="grid grid-cols-3 gap-2">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg"
                          : "bg-[#FDF2F7] text-[#64748B] hover:bg-[#FCE7F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Servicios Section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#E84A8A] uppercase tracking-wider mb-3 px-2">Servicios</p>
              <div className="grid grid-cols-3 gap-2">
                {serviciosGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg"
                          : "bg-[#FDF2F7] text-[#64748B] hover:bg-[#FCE7F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Finanzas Section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#E84A8A] uppercase tracking-wider mb-3 px-2">Finanzas</p>
              <div className="grid grid-cols-2 gap-2">
                {finanzasGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg"
                          : "bg-[#FDF2F7] text-[#64748B] hover:bg-[#FCE7F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Herramientas Section */}
            <div>
              <p className="text-xs font-semibold text-[#E84A8A] uppercase tracking-wider mb-3 px-2">Herramientas</p>
              <div className="grid grid-cols-3 gap-2">
                {toolsNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] text-white shadow-lg"
                          : "bg-[#FDF2F7] text-[#64748B] hover:bg-[#FCE7F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
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

      {/* Footer */}
      <footer className="border-t border-[#FCE7F0] bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#E84A8A]" />
              NailCost Pro
            </span>
            <span>USD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
