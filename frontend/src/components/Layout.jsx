import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Package, Palette, Sparkles, Receipt, TrendingUp, Calculator, Menu, Users, Calendar, BarChart3, History, Box, Home, Wallet, LogOut, Sun, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { FloatingCalculator } from "@/components/FloatingCalculator";

const PersonaLayout = () => {
  const location = useLocation();
  const { user, logout, isPremium } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const bottomNavItems = [{ to: "/", icon: Home, label: "Inicio" }, { to: "/clientes", icon: Users, label: "Clientes" }, { to: "/calculadora", icon: Calculator, label: "Calcular", primary: true }, { to: "/agenda", icon: Calendar, label: "Agenda" }, { to: "/historial", icon: History, label: "Historial" }];
  const moreMenuItems = [{ to: "/productos", icon: Package, label: "Productos" }, { to: "/estilos", icon: Palette, label: "Estilos" }, { to: "/disenos", icon: Sparkles, label: "Diseños" }, { to: "/inventario", icon: Box, label: "Inventario" }, { to: "/gastos", icon: Receipt, label: "Gastos" }, { to: "/ganancias", icon: TrendingUp, label: "Ganancias" }, { to: "/reporte", icon: BarChart3, label: "Reporte" }, { to: "/reportes-mensuales", icon: BarChart3, label: "Reportes mensuales" }, { to: "/reportes-financieros", icon: Wallet, label: "Reportes financieros" }];
  const handleLogout = async () => { try { await logout(); navigate("/login"); } catch (e) { console.error(e); } };
  useEffect(() => { const close = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  return <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><div className="font-bold text-xl">StetikApp</div><div className="flex items-center gap-2"><Button type="button" variant="outline" size="icon" onClick={toggleTheme} aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"} title={theme === "dark" ? "Modo claro" : "Modo oscuro"} data-testid="theme-toggle"><ThemeIcon className="h-4 w-4"/></Button><Button type="button" variant="ghost" size="icon" onClick={() => setMenuOpen(v => !v)} aria-label="Abrir menú"><Menu className="h-5 w-5"/></Button></div></div></header>
    <main className="max-w-7xl mx-auto px-4 py-6 pb-24"><Outlet/></main>
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur"><div className="max-w-2xl mx-auto grid grid-cols-5 h-16">{bottomNavItems.map(item => { const Icon=item.icon; const active=location.pathname===item.to; return <NavLink key={item.to} to={item.to} className={cn("flex flex-col items-center justify-center gap-1 text-xs",active?"text-primary":"text-muted-foreground",item.primary&&"font-semibold")}><Icon className={cn("h-5 w-5",item.primary&&"h-6 w-6")}/><span>{item.label}</span></NavLink>; })}</div></nav>
    <FloatingCalculator/>
    {menuOpen && <div ref={menuRef} className="fixed top-16 right-4 z-50 w-72 rounded-xl border border-border bg-background shadow-xl p-3"><div className="mb-3 pb-3 border-b border-border"><p className="font-semibold">{user?.nombre || user?.email || "Usuario"}</p><p className="text-xs text-muted-foreground">{isPremium ? "Premium" : "Básico"}</p></div>{moreMenuItems.map(item => <NavLink key={item.to} to={item.to} onClick={()=>setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"><item.icon className="h-4 w-4"/><span>{item.label}</span></NavLink>)}<button type="button" onClick={toggleTheme} className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted"><ThemeIcon className="h-4 w-4"/><span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span></button><button type="button" onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-red-600"><LogOut className="h-4 w-4"/><span>Cerrar sesión</span></button></div>}
  </div>;
};
export const Layout = () => <PersonaLayout />;
