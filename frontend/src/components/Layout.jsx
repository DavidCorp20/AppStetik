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
  Home,
  Settings,
  HelpCircle,
  Bell,
  Clock,
  CreditCard
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

  const bottomNavItems = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/clientes", icon: Users, label: "Clientes" },
    { to: "/calculadora", icon: Calculator, label: "Calcular", primary: true },
    { to: "/agenda", icon: Calendar, label: "Agenda" },
    { to: "/historial", icon: History, label: "Historial" },
  ];

  const moreMenuItems = [
    { to: "/productos", icon: Package, label: "Productos" },
    { to: "/estilos", icon: Palette, label: "Estilos" },
    { to: "/disenos", icon: Sparkles, label: "Diseños" },
    { to: "/inventario", icon: Box, label: "Inventario" },
    { to: "/gastos", icon: Receipt, label: "Gastos" },
    { to: "/ganancias", icon: TrendingUp, label: "Ganancias" },
    { to: "/pagos", icon: CreditCard, label: "Mi Suscripción" },
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
          <NavLink to="/" className="flex items-center gap-2 tap-effect">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1A1A2E]" style={{ fontFamily: 'Playfair Display, serif' }}>
              NailCost
            </span>
          </NavLink>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full bg-[#FDF2F7] border border-[#FCE7F0] tap-effect"
              data-testid="persona-user-menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
            </button>

            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#FCE7F0] py-2 z-50 animate-slide-down">
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

                <div className="py-2 border-b border-[#FCE7F0]">
                  <p className="px-4 py-1 text-xs font-semibold text-[#64748B] uppercase">Más opciones</p>
                  {moreMenuItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors tap-effect",
                        isActive ? "bg-[#FDF2F7] text-[#E84A8A]" : "text-[#64748B] hover:bg-[#FDF2F7]"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>

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
                "flex flex-col items-center justify-center w-16 h-full transition-all tap-effect",
                item.primary ? "relative -top-3" : "",
                isActive && !item.primary ? "text-[#E84A8A]" : "text-[#94A3B8]"
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {item.primary ? (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E84A8A] to-[#FF6B9D] flex items-center justify-center shadow-lg shadow-[#E84A8A]/40 hover:scale-110 active:scale-95 transition-transform">
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

      {location.pathname !== '/calculadora' && <FloatingCalculator />}
    </div>
  );
};

// =========================
// COMERCIO LAYOUT (Professional Corporate)
// =========================

const comercioMainNav = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
];

const comercioGestionGroup = {
  label: "Gestión",
  icon: Users,
  items: [
    { to: "/agenda", icon: Calendar, label: "Agenda" },
    { to: "/clientes", icon: Users, label: "Clientes" },
    { to: "/empleados", icon: UserCheck, label: "Empleados" },
    { to: "/gestion-usuarios", icon: Shield, label: "Usuarios" },
    { to: "/inventario", icon: Package, label: "Inventario" },
  ]
};

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
    { to: "/facturacion", icon: Receipt, label: "Facturación" },
    { to: "/gastos", icon: Receipt, label: "Gastos" },
    { to: "/ganancias", icon: TrendingUp, label: "Ganancias" },
    { to: "/reportes-financieros", icon: BarChart3, label: "Reportes" },
    { to: "/pagos", icon: CreditCard, label: "Suscripción" },
  ]
};

const comercioHerramientasGroup = {
  label: "Herramientas",
  icon: Calculator,
  items: [
    { to: "/calculadora", icon: Calculator, label: "Cotizador" },
    { to: "/simulacion", icon: Target, label: "Simulación" },
    { to: "/reportes-mensuales", icon: BarChart3, label: "Histórico" },
  ]
};

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
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
          isActive
            ? "bg-[#1E3A5F] text-white"
            : "text-[#64748B] hover:text-[#1E3A5F] hover:bg-[#F1F5F9]"
        )}
      >
        <group.icon className="w-4 h-4" />
        <span>{group.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-slide-down">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-[#F1F5F9] text-[#1E3A5F] font-medium"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#1E3A5F]"
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

// Dark Dropdown for dark header
const NavDropdownDark = ({ group, isActive }) => {
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
          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
          isActive
            ? "bg-white/20 text-white"
            : "text-slate-300 hover:text-white hover:bg-white/10"
        )}
      >
        <group.icon className="w-4 h-4" />
        <span>{group.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-[#0F172A] rounded-xl shadow-xl border border-slate-700 py-2 z-50 animate-slide-down">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-blue-600/30 text-cyan-400 font-medium"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
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

// User Menu
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors border border-[#E2E8F0]"
        data-testid="comercio-user-menu"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center shadow-sm">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-[#0F172A] hidden sm:inline max-w-[120px] truncate">
          {user?.nombre_negocio || user?.nombre}
        </span>
        {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
        <ChevronDown className={cn("w-3 h-3 text-[#64748B] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-slide-down">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0F172A] truncate">{user?.nombre}</p>
                <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
                {user?.nombre_negocio && (
                  <p className="text-xs text-[#3B82F6] truncate mt-0.5">{user?.nombre_negocio}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Plan Badge */}
          <div className="px-4 py-3 border-b border-[#E2E8F0]">
            <span className={cn(
              "text-xs px-3 py-1 rounded-md font-medium",
              isPremium 
                ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" 
                : "bg-[#F1F5F9] text-[#1E3A5F]"
            )}>
              {isPremium ? "✨ Premium Business" : "Plan Básico"}
            </span>
          </div>

          {/* Menu Items */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-[#1E3A5F] hover:bg-[#F1F5F9] transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Panel Administrador</span>
            </NavLink>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
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

// Dark User Menu for dark header
const ComercioUserMenuDark = () => {
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        data-testid="comercio-user-menu"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-white hidden sm:inline max-w-[120px] truncate">
          {user?.nombre_negocio || user?.nombre}
        </span>
        {isPremium && <Crown className="w-4 h-4 text-amber-400" />}
        <ChevronDown className={cn("w-3 h-3 text-slate-300 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[#0F172A] rounded-xl shadow-xl border border-slate-700 py-2 z-50 animate-slide-down">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{user?.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                {user?.nombre_negocio && (
                  <p className="text-xs text-cyan-400 truncate mt-0.5">{user?.nombre_negocio}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Plan Badge */}
          <div className="px-4 py-3 border-b border-slate-700">
            <span className={cn(
              "text-xs px-3 py-1 rounded-md font-medium",
              isPremium 
                ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400" 
                : "bg-slate-700 text-slate-300"
            )}>
              {isPremium ? "✨ Premium Business" : "Plan Básico"}
            </span>
          </div>

          {/* Menu Items */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-cyan-400 hover:bg-white/5 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Panel Administrador</span>
            </NavLink>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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

// Bottom Navigation Items for Comercio Mobile
const comercioBottomNav = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/agenda", icon: Calendar, label: "Agenda" },
  { to: "/calculadora", icon: Calculator, label: "Cotizar", primary: true },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/facturacion", icon: Receipt, label: "Facturar" },
];

const ComercioLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isInGestionGroup = comercioGestionGroup.items.some(item => location.pathname === item.to);
  const isInServiciosGroup = comercioServiciosGroup.items.some(item => location.pathname === item.to);
  const isInFinanzasGroup = comercioFinanzasGroup.items.some(item => location.pathname === item.to);
  const isInHerramientasGroup = comercioHerramientasGroup.items.some(item => location.pathname === item.to);

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20 lg:pb-0" data-testid="comercio-layout">
      {/* Header - Dark Blue Professional */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3" data-testid="comercio-logo">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">
                  NailCost
                </span>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-400/20 px-2 py-0.5 rounded">
                  Business
                </span>
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
                      "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/20 text-white"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <div className="w-px h-6 bg-white/20 mx-2" />

              <NavDropdownDark group={comercioGestionGroup} isActive={isInGestionGroup} />
              <NavDropdownDark group={comercioServiciosGroup} isActive={isInServiciosGroup} />
              <NavDropdownDark group={comercioFinanzasGroup} isActive={isInFinanzasGroup} />
              <NavDropdownDark group={comercioHerramientasGroup} isActive={isInHerramientasGroup} />
            </nav>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <ComercioUserMenuDark />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <nav 
            className="absolute top-16 left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-xl p-4 max-h-[80vh] overflow-y-auto animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider mb-3 px-2">Principal</p>
              <div className="grid grid-cols-4 gap-2">
                {comercioMainNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] text-white shadow-lg"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Servicios */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider mb-3 px-2">Servicios</p>
              <div className="grid grid-cols-3 gap-2">
                {comercioServiciosGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] text-white shadow-lg"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Finanzas */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider mb-3 px-2">Finanzas</p>
              <div className="grid grid-cols-2 gap-2">
                {comercioFinanzasGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] text-white shadow-lg"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                      )
                    }
                  >
                    <item.icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Herramientas */}
            <div>
              <p className="text-xs font-semibold text-[#1E3A5F] uppercase tracking-wider mb-3 px-2">Herramientas</p>
              <div className="grid grid-cols-3 gap-2">
                {comercioHerramientasGroup.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-col items-center gap-2 px-3 py-4 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] text-white shadow-lg"
                          : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
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

      {/* Mobile Bottom Navigation - Only visible on small screens */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E2E8F0] safe-area-bottom" data-testid="comercio-bottom-nav">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {comercioBottomNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-16 h-full transition-all tap-effect",
                item.primary ? "relative -top-3" : "",
                isActive && !item.primary ? "text-[#1E3A5F]" : "text-[#94A3B8]"
              )}
              data-testid={`comercio-nav-${item.label.toLowerCase()}`}
            >
              {item.primary ? (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-110 active:scale-95 transition-transform">
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

      {/* Footer - Hidden on mobile, visible on desktop */}
      <footer className="hidden lg:block border-t border-[#E2E8F0] bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E3A5F]" />
              <span className="font-medium text-[#0F172A]">NailCost Business</span>
            </span>
            <span>© 2024 - Todos los derechos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// =========================
// ADMIN LAYOUT (Dedicated Admin Interface)
// =========================
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white" data-testid="admin-layout">
      {/* Admin Header - Dark Blue Professional */}
      <header className="bg-gradient-to-r from-[#1E3A5F] to-[#0F172A] border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">NailCost</span>
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider bg-cyan-500/20 px-2 py-0.5 rounded">
                  Admin
                </span>
              </div>
            </NavLink>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-slate-600">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-300">{user?.nombre || 'Admin'}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-[#0F172A] mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-400">NailCost Admin Panel</span>
            </span>
            <span>© 2025 - Panel de Administración</span>
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
  const { isBusinessUser, isAdmin } = useAuth();
  
  // Admin gets dedicated layout
  if (isAdmin) {
    return <AdminLayout />;
  }
  
  // Business users get corporate layout
  if (isBusinessUser) {
    return <ComercioLayout />;
  }
  
  // Personal users get mobile-first layout
  return <PersonaLayout />;
};
