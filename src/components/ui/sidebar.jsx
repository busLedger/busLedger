/* eslint-disable react/prop-types */
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun } from "lucide-react";
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

export const Sidebar = ({
  isOpen,
  Menus,
  toggleTheme,
  cerrarSesion,
  onToggle,
  darkMode,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (ruta) => {
    navigate(`/home/${ruta}`);
  };

  const isActiveRoute = (ruta) => {
    return location.pathname === `/home/${ruta}`;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex h-screen flex-col border-r transition-all duration-300",
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
          isOpen ? "w-64" : "w-20"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center justify-between border-b px-4",
          darkMode ? "border-gray-800" : "border-gray-200"
        )}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={Logo}
              alt="Logo"
              className={cn(
                "h-10 w-10 cursor-pointer transition-transform duration-500",
                isOpen && "rotate-[360deg]"
              )}
              onClick={onToggle}
            />
            <div
              className={cn(
                "transition-all duration-200",
                !isOpen && "w-0 opacity-0"
              )}
            >
              <h2 className={cn(
                "text-lg font-bold",
                darkMode ? "text-white" : "text-gray-900"
              )}>
                Bus Ledger
              </h2>
              <p className={cn(
                "text-xs",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}>
                Gestión escolar
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-4 top-20 z-50 h-8 w-8 rounded-full border shadow-md transition-colors flex items-center justify-center",
            darkMode 
              ? "bg-gray-900 border-gray-700 hover:bg-gray-800 text-white" 
              : "bg-white border-gray-300 hover:bg-gray-100 text-gray-900"
          )}
        >
          {isOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Navigation Menu */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {Menus.map((menu, index) => {
              const isActive = isActiveRoute(menu.ruta);
              const MenuButton = (
                <button
                  onClick={() => handleNavigation(menu.ruta)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative overflow-hidden",
                    menu.gap && "mt-8",
                    isActive
                      ? "bg-indigo-600 text-white"  // ← Siempre texto blanco cuando está activo
                      : darkMode
                        ? "text-white hover:bg-gray-800"
                        : "text-gray-900 hover:bg-gray-100"
                  )}
                >
                  {/* Barra lateral de indicador activo */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                  
                  <img
                    src={menu.src}
                    alt={menu.title}
                    className={cn(
                      "h-5 w-5 flex-shrink-0 object-contain transition-all",
                      isActive 
                        ? "brightness-0 invert scale-110" 
                        : darkMode
                          ? "opacity-90 brightness-200"
                          : "opacity-70"
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
                <div key={index}>{MenuButton}</div>
              ) : (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>{MenuButton}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {menu.title}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator className={darkMode ? "bg-gray-800" : "bg-gray-200"} />

        {/* Footer Actions */}
        <div className="space-y-3 p-4">
          {/* Toggle Theme */}
          {isOpen ? (
            <button
              onClick={toggleTheme}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                darkMode 
                  ? "text-white hover:bg-gray-800" 
                  : "text-gray-900 hover:bg-gray-100"
              )}
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleTheme}
                  className={cn(
                    "flex w-full items-center justify-center rounded-lg p-2.5 transition-colors",
                    darkMode 
                      ? "hover:bg-gray-800 text-white" 
                      : "hover:bg-gray-100 text-gray-900"
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

          {/* Logout */}
          {isOpen ? (
            <Button
              text="Cerrar Sesión"
              onClick={cerrarSesion}
              confirm={true}
              confirmTitle="¿Cerrar sesión?"
              confirmDescription="¿Estás seguro de que deseas salir?"
              confirmOkText="Sí, salir"
              confirmCancelText="Cancelar"
              className="w-full !bg-red-600 hover:!bg-red-700"
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={cerrarSesion}
                  className={cn(
                    "flex w-full items-center justify-center rounded-lg p-2.5 text-red-600 transition-colors",
                    darkMode ? "hover:bg-red-950" : "hover:bg-red-100"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar Sesión</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};