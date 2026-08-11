/* eslint-disable react/prop-types */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Banknote,
  BusFront,
  ChevronDown,
  Circle,
  Gauge,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  ShieldCheck,
  Sun,
  UserCircle2,
  UsersRound,
} from "lucide-react";
import Button from "./Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logo from "../../assets/logo.png";
import { cn } from "@/lib/utils";

const menuIcons = {
  "admin-panel": ShieldCheck,
  dashboard: Gauge,
  "unidades-transporte": BusFront,
  alumnos: UsersRound,
  pagos: Banknote,
  gastos: ReceiptText,
  "panel-usuario": UserCircle2,
};

export const Sidebar = ({
  isOpen,
  Menus,
  toggleTheme,
  cerrarSesion,
  onToggle,
  darkMode,
  userData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleNavigation = (ruta) => {
    navigate(`/home/${ruta}`);
  };

  const isActiveRoute = (ruta) => location.pathname === `/home/${ruta}`;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen shrink-0 flex-col border-r shadow-sm transition-all duration-300",
          darkMode
            ? "border-slate-800 bg-slate-950 text-slate-100"
            : "border-slate-200 bg-white text-slate-950",
          isOpen ? "w-64" : "w-20"
        )}
      >
        <div
          className={cn(
            "flex h-[76px] items-center border-b px-4",
            darkMode ? "border-slate-800" : "border-slate-200"
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
              darkMode
                ? "border-slate-700 bg-slate-900 hover:border-indigo-400"
                : "border-slate-200 bg-slate-50 hover:border-indigo-300"
            )}
            aria-label={isOpen ? "Contraer menu" : "Expandir menu"}
          >
            <img src={Logo} alt="Logo" className="h-8 w-8 object-contain" />
          </button>

          <div
            className={cn(
              "ml-3 min-w-0 overflow-hidden transition-all duration-200",
              !isOpen && "w-0 opacity-0"
            )}
          >
            <h2
              className={cn(
                "truncate text-base font-semibold leading-5",
                darkMode ? "text-white" : "text-slate-950"
              )}
            >
              Bus Ledger
            </h2>
            <p
              className={cn(
                "truncate text-xs",
                darkMode ? "text-slate-400" : "text-slate-500"
              )}
            >
              Gestion escolar
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "absolute -right-4 top-24 z-50 flex h-8 w-8 items-center justify-center rounded-full border shadow-lg transition-all",
            darkMode
              ? "border-slate-700 bg-slate-900 text-white hover:border-indigo-400 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:bg-slate-50"
          )}
          aria-label={isOpen ? "Contraer menu" : "Expandir menu"}
        >
          {isOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>

        <ScrollArea className="flex-1 px-3 py-5">
          {isOpen && (
            <p
              className={cn(
                "mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em]",
                darkMode ? "text-slate-500" : "text-slate-400"
              )}
            >
              Menu
            </p>
          )}

          <nav className="space-y-1.5">
            {Menus.map((menu, index) => {
              const isActive = isActiveRoute(menu.ruta);
              const MenuIcon = menuIcons[menu.ruta] || Circle;
              const menuButton = (
                <button
                  type="button"
                  onClick={() => handleNavigation(menu.ruta)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    menu.gap && "mt-8",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : darkMode
                        ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-white" />
                  )}
                  <MenuIcon
                    aria-hidden="true"
                    className={cn(
                      "h-5 w-5 shrink-0 transition-all",
                      isActive
                        ? "scale-110 text-white"
                        : darkMode
                          ? "text-slate-400 group-hover:text-indigo-300"
                          : "text-slate-400 group-hover:text-indigo-600"
                    )}
                  />
                  <span
                    className={cn(
                      "truncate transition-all duration-200",
                      !isOpen && "w-0 opacity-0"
                    )}
                  >
                    {menu.title}
                  </span>
                </button>
              );

              return isOpen ? (
                <div key={index}>{menuButton}</div>
              ) : (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {menu.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className={darkMode ? "bg-slate-800" : "bg-slate-200"} />

        <div className="space-y-3 p-4">
          {isOpen && userData && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setAccountOpen((current) => !current)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  darkMode
                    ? "text-slate-200 hover:bg-slate-900"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <UserCircle2
                  className={cn(
                    "h-6 w-6 shrink-0",
                    darkMode ? "text-indigo-300" : "text-indigo-600"
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      darkMode ? "text-slate-100" : "text-slate-900"
                    )}
                  >
                    {userData.nombre || userData.displayName || userData.email}
                  </p>
                  <p
                    className={cn(
                      "truncate text-xs",
                      darkMode ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    {userData.roles?.join(", ")}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform",
                    accountOpen && "rotate-180"
                  )}
                />
              </button>

              {accountOpen && (
                <div
                  className={cn(
                    "space-y-2 rounded-xl border p-2",
                    darkMode
                      ? "border-slate-800 bg-slate-900/70"
                      : "border-slate-200 bg-slate-50"
                  )}
                >
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      darkMode
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    )}
                  >
                    {darkMode ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    <span>{darkMode ? "Modo Claro" : "Modo Oscuro"}</span>
                  </button>

                  <Button
                    text="Cerrar Sesion"
                    onClick={cerrarSesion}
                    confirm={true}
                    confirmTitle="Cerrar sesion?"
                    confirmDescription="Estas seguro de que deseas salir?"
                    confirmOkText="Si, salir"
                    confirmCancelText="Cancelar"
                    className="w-full !rounded-lg !bg-red-600 !px-2.5 !py-2 text-left hover:!bg-red-700"
                  />
                </div>
              )}
            </div>
          )}

          {!isOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={cn(
                    "flex w-full items-center justify-center rounded-xl p-2.5 transition-colors",
                    darkMode
                      ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {darkMode ? "Modo Claro" : "Modo Oscuro"}
              </TooltipContent>
            </Tooltip>
          )}

          {!isOpen && userData && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setAccountOpen((current) => !current)}
                  className={cn(
                    "flex w-full items-center justify-center rounded-xl p-2.5 transition-colors",
                    darkMode
                      ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  <UserCircle2 className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {userData.nombre || userData.displayName || userData.email}
              </TooltipContent>
            </Tooltip>
          )}

          {!isOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={cerrarSesion}
                  className={cn(
                    "flex w-full items-center justify-center rounded-xl p-2.5 text-red-600 transition-colors",
                    darkMode ? "hover:bg-red-950/70" : "hover:bg-red-50"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar Sesion</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};
