/* eslint-disable react/prop-types */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Banknote,
  BusFront,
  ChevronDown,
  Circle,
  Gauge,
  Moon,
  ReceiptText,
  ShieldCheck,
  Sun,
  User,
  UserCircle2,
  UsersRound,
  X,
} from "lucide-react";
import Button from "./Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

export const MobileNav = ({
  isOpen,
  onClose,
  Menus,
  toggleTheme,
  cerrarSesion,
  darkMode,
  userData,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);

  const handleNavigation = (ruta) => {
    navigate(`/home/${ruta}`);
    onClose();
  };

  const handleLogout = () => {
    cerrarSesion();
    onClose();
  };

  const isActiveRoute = (ruta) => location.pathname === `/home/${ruta}`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform shadow-xl transition-transform duration-300 ease-in-out lg:hidden",
          darkMode
            ? "border-r border-slate-800 bg-slate-950"
            : "border-r border-slate-200 bg-white",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex items-center justify-between border-b p-4",
              darkMode ? "border-slate-800" : "border-slate-200"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl border",
                  darkMode
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-slate-50"
                )}
              >
                <img src={Logo} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
              <div>
                <h2
                  className={cn(
                    "text-lg font-semibold",
                    darkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  Bus Ledger
                </h2>
                <p
                  className={cn(
                    "text-xs",
                    darkMode ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  Gestion de transporte
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "rounded-xl p-2 transition-colors",
                darkMode ? "hover:bg-slate-900" : "hover:bg-slate-100"
              )}
              aria-label="Cerrar menu"
            >
              <X
                className={cn(
                  "h-5 w-5",
                  darkMode ? "text-white" : "text-slate-900"
                )}
              />
            </button>
          </div>

          <ScrollArea className="flex-1 px-3 py-5">
            <p
              className={cn(
                "mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em]",
                darkMode ? "text-slate-500" : "text-slate-400"
              )}
            >
              Menu
            </p>
            <nav className="space-y-1.5">
              {Menus.map((menu, index) => {
                const isActive = isActiveRoute(menu.ruta);
                const MenuIcon = menuIcons[menu.ruta] || Circle;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleNavigation(menu.ruta)}
                    className={cn(
                      "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      menu.gap && "mt-6",
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
                    <span className="truncate">{menu.title}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          <div
            className={cn(
              "space-y-2 border-t p-4",
              darkMode ? "border-slate-800" : "border-slate-200"
            )}
          >
            {userData && (
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
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarImage src={userData.photoURL} />
                  <AvatarFallback
                    className={darkMode ? "bg-slate-900" : "bg-slate-100"}
                  >
                    <User
                      className={cn(
                        "h-4 w-4",
                        darkMode ? "text-white" : "text-slate-900"
                      )}
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-sm font-semibold",
                      darkMode ? "text-white" : "text-slate-900"
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
            )}

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
                  onClick={handleLogout}
                  confirm={true}
                  confirmTitle="Cerrar sesion?"
                  confirmDescription="Estas seguro de que deseas salir?"
                  confirmOkText="Si, salir"
                  confirmCancelText="Cancelar"
                  className="w-full !rounded-lg !bg-red-600 !px-3 !py-2.5 hover:!bg-red-700"
                />
              </div>
            )}

            {!userData && (
              <button
                type="button"
                onClick={toggleTheme}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                darkMode
                  ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
