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
  Shield,
  Building2,
  History,
  UserCheck,
  Box,
  Home
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { FloatingCalculator } from "@/components/FloatingCalculator";

// =========================
// PERSONA LAYOUT (Mobile-first, App-like)
// =========================
const PersonaLayout = () => {
  const location = useLocation();
  const { user, logout, isPremium } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Bottom nav items for Persona
  const bottomNavItems = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/clientes", icon: Users, label: "Clientes" },
    { to: "/calculadora", icon: Calculator, label: "Calcular", primary: true },
    { to: "/agenda", icon: Calendar, label: "Agenda" },
    { to: "/historial", icon: History, label: "Historial" },
  ];

  // More menu items
  const moreMenuItems = [
    { to: "/productos", icon: Package, label: "Productos" },
    { to: "/estilos", icon: Palette, label: "Estilos" },
    { to: "/disenos", icon: Sparkles, label: "Diseños" },
    { to: "/gastos", icon: Receipt, label: "Gastos" },
    { to: "/ganancias", icon: TrendingUp, label: "Ganancias" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FDF2F7]" data-testid="persona-layout">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-[#FCE7F0]">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              NailCost
            </span>
          </NavLink>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full bg-[#FDF2F7] border border-[#FCE7F0]"
              data-testid="persona-user-menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#FCE7F0] py-2 z-50 animate-fade-in">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-[#FCE7F0]">
                  <p className="font-semibold text-[#1A1A2E] truncate">{user?.nombre}</p>
                  <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
                  <span className={cn(
                    "inline-block mt-2 text-xs px-2 py-0.5 rounded-full",
                    isPremium ? "bg-amber-100 text-amber-700" : "bg-[#FDF2F7] text-[#E84A8A]"
                  )}>
                    {isPremium ? "✨ Premium" : "Plan Básico"}
                  </span>
                </div>

                {/* More Options */}
                <div className="py-2 border-b border-[#FCE7F0]">
                  <p className="px-4 py-1 text-xs font-semibold text-[#64748B] uppercase">Más opciones</p>
                  {moreMenuItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        isActive ? "bg-[#FDF2F7] text-[#E84A8A]" : "text-[#64748B] hover:bg-[#FDF2F7]"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                {/* Admin Link */}
                {user?.role === "admin" && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50"
                  >
                    <Shield className="w-4 h-4" />
                    Panel Admin
                  </NavLink>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#FCE7F0] safe-area-bottom" data-testid="bottom-nav">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all",
                item.primary ? "relative -top-3" : "",
                isActive && !item.primary ? "text-[#E84A8A]" : "text-[#94A3B8]"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.primary ? (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg shadow-[#E84A8A]/40">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <>
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating Calculator Button (hidden on calculadora page) */}
      {location.pathname !== '/calculadora' && <FloatingCalculator />}
    </div>
  );
};

// =========================
// COMERCIO LAYOUT (Professional Desktop)
// =========================

// Navigation groups for Comercio
const comercioMainNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/empleados", icon: UserCheck, label: "Empleados" },
];

const comercioServiciosGroup = {
  label: "Servicios",
  icon: Layers,
  items: [
    { to: "/productos", icon: Package, label: "Productos" },
    { to: "/estilos", icon: Palette, label: "Estilos" },
    { to: "/disenos", icon: Sparkles, label: "Diseños" },
  ]
};

const comercioFinanzasGroup = {
  label: "Finanzas",
  icon: Wallet,
  items: [
    { to: "/gastos", icon: Receipt, label: "Gastos" },
    { to: "/ganancias", icon: TrendingUp, label: "Ganancias" },
  ]
};

const comercioToolsNav = [
  { to: "/calculadora", icon: Calculator, label: "Calculadora" },
  { to: "/reportes-mensuales", icon: BarChart3, label: "Reportes" },
  { to: "/simulacion", icon: Target, label: "Simulación" },
];

// Dropdown Component for Comercio
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
            ? "bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg shadow-purple-500/25"
            : "text-[#64748B] hover:text-[#8B5CF6] hover:bg-purple-50"
        )}
      >
        <group.icon className="w-4 h-4" />
        <span>{group.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-fade-in">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-purple-50 text-[#8B5CF6] font-medium"
                    : "text-[#64748B] hover:bg-purple-50 hover:text-[#8B5CF6]"
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

// User Menu for Comercio
const ComercioUserMenu = () => {
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
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100"
        data-testid="comercio-user-menu"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-sm">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-[#1A1A2E] hidden sm:inline max-w-[120px] truncate">
          {user?.nombre_negocio || user?.nombre}
        </span>
        {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
        <ChevronDown className={cn("w-3 h-3 text-[#64748B] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-purple-50">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-[#1A1A2E] truncate">{user?.nombre}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Negocio
              </span>
            </div>
            <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
            {user?.nombre_negocio && (
              <p className="text-xs text-[#8B5CF6] truncate mt-0.5">{user?.nombre_negocio}</p>
            )}
          </div>
          <div className="px-4 py-2 border-b border-purple-50">
            <span className={cn(
              "text-xs px-3 py-1 rounded-full font-medium",
              isPremium 
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" 
                : "bg-purple-50 text-purple-600"
            )}>
              {isPremium ? "✨ Premium Business" : "Plan Básico"}
            </span>
          </div>
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-purple-600 hover:bg-purple-50 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Panel Admin</span>
            </NavLink>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
            data-testid="comercio-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

const ComercioLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isInServiciosGroup = comercioServiciosGroup.items.some(item => location.pathname === item.to);
  const isInFinanzasGroup = comercioFinanzasGroup.items.some(item => location.pathname === item.to);

  const allMobileItems = [
    ...comercioMainNav,
    ...comercioServiciosGroup.items,
    ...comercioFinanzasGroup.items,
    ...comercioToolsNav,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30" data-testid="comercio-layout">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5" data-testid="comercio-logo">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  NailCost
                </span>
                <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">Business</span>
              </div>
            </NavLink>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {comercioMainNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg shadow-purple-500/25"
                        : "text-[#64748B] hover:text-[#8B5CF6] hover:bg-purple-50"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div className="w-px h-6 bg-purple-200 mx-1" />

              <NavDropdown group={comercioServiciosGroup} isActive={isInServiciosGroup} />
              <NavDropdown group={comercioFinanzasGroup} isActive={isInFinanzasGroup} />

              <div className="w-px h-6 bg-purple-200 mx-1" />

              {comercioToolsNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg shadow-purple-500/25"
                        : "text-[#64748B] hover:text-[#8B5CF6] hover:bg-purple-50"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Menu - Desktop */}
            <div className="hidden lg:block">
              <ComercioUserMenu />
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center gap-2 lg:hidden">
              <ComercioUserMenu />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#8B5CF6]" /> : <Menu className="w-5 h-5 text-[#8B5CF6]" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <nav 
            className="absolute top-16 left-0 right-0 bg-white border-b border-purple-100 shadow-xl p-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Section */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-3 px-2">Principal</p>
              <div className="grid grid-cols-4 gap-2">
                {comercioMainNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg"
                          : "bg-purple-50 text-[#64748B] hover:bg-purple-100"
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
              <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-3 px-2">Servicios</p>
              <div className="grid grid-cols-3 gap-2">
                {comercioServiciosGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg"
                          : "bg-purple-50 text-[#64748B] hover:bg-purple-100"
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
              <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-3 px-2">Finanzas</p>
              <div className="grid grid-cols-2 gap-2">
                {comercioFinanzasGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg"
                          : "bg-purple-50 text-[#64748B] hover:bg-purple-100"
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
              <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-3 px-2">Herramientas</p>
              <div className="grid grid-cols-3 gap-2">
                {comercioToolsNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-2xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] text-white shadow-lg"
                          : "bg-purple-50 text-[#64748B] hover:bg-purple-100"
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
      <footer className="border-t border-purple-100 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#8B5CF6]" />
              NailCost Business
            </span>
            <span>USD</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// =========================
// MAIN LAYOUT COMPONENT
// =========================
export const Layout = () => {
  const { isBusinessUser } = useAuth();
  
  // Render different layout based on user type
  if (isBusinessUser) {
    return <ComercioLayout />;
  }
  
  return <PersonaLayout />;
};
