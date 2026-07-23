import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAlumno, useAlumnoMutations } from "../../Hooks/swr/useAlumnos";
import { usePagoMutations } from "../../Hooks/swr/usePagos";
import { Load } from "../../components/ui/Load";
import FilterTabs from "../../components/ui/FilterTabs";
import { RegisterPagoModal } from "../../components/ui/Modales/RegisterPagoModal.jsx";
import { RegisterAlumnoModal } from "../../components/ui/Modales/RegisterAlumnoModal.jsx";
import { generarFacturaPDF } from "../facturas/FacturaPdf.jsx";
import { message } from "antd";
import { useHome } from "../../components/providers/HomeProvider";
import { buildInvoiceData } from "../../lib/invoice";

import { AlumnoDatos } from "./components/AlumnosDatos";
import { AlumnoPagos } from "./components/AlumnosPagos";
import { AlumnoUbicacion } from "./components/AlumnosUbicacion";

// Helper para convertir la ubicación en { lat, lng }
function parseUbicacion(ubicacion) {
  if (!ubicacion) return null;

  if (
    typeof ubicacion === "object" &&
    ubicacion !== null &&
    "lat" in ubicacion &&
    "lng" in ubicacion
  ) {
    return ubicacion;
  }

  if (typeof ubicacion === "string") {
    const [lat, lng] = ubicacion.split(",").map(Number);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

export const VerAlumno = () => {
  const router = useRouter();
  const { darkMode, userData } = useHome();
  const { id } = useParams();

  const [isRegisterPagoModalOpen, setIsRegisterPagoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [optFilter, setOptFilter] = useState(["Datos", "Pagos"]);
  const [selectedTab, setSelectedTab] = useState("Datos");

  const { alumno, isLoading: load, mutate: refreshAlumno } = useAlumno(id);
  const { updateAlumno } = useAlumnoMutations();
  const { deletePago } = usePagoMutations();

  useEffect(() => {
    setOptFilter(
      alumno?.ubicacion ? ["Datos", "Pagos", "Ubicación"] : ["Datos", "Pagos"]
    );
  }, [alumno?.ubicacion]);

  const handleDeleteAlumno = async () => {
    try {
      await updateAlumno(id, { activo: false });
      message.success("Alumno desactivado correctamente.");
      router.push("/home/alumnos");
    } catch (error) {
      console.error("Error al desactivar el alumno:", error);
      message.error("No se pudo desactivar el alumno.");
    }
  };

  const handleDeletePago = async (pago) => {
    try {
      await deletePago(pago.id);
      message.success("Pago eliminado correctamente");
    } catch (error) {
      message.error("Error al eliminar el ingreso");
      console.error("Error al eliminar el pago:", error);
    }
  };

  const descargarFactura = async (pago) => {
    const data = buildInvoiceData({ alumno, pago, user: userData });

    try {
      await generarFacturaPDF(data);
    } catch (error) {
      console.error("Error al imprimir la factura: ", error);
      message.error("No se pudo generar la factura.");
    }
  };

  const verFactura = (pago) => {
    router.push(`/home/alumnos/${id}/factura?paymentId=${pago.id}`);
  };

  if (load || !alumno) return <Load />;

  const ubicacionAlumno = parseUbicacion(alumno.ubicacion);

  return (
    <div className="min-h-screen w-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl md:text-3xl font-bold tracking-tight text-foreground">
              Información del Alumno
            </h2>
            <p className="text-sm text-muted-foreground">
              {alumno?.nombre} {alumno?.apellido}
            </p>
          </div>

          {/* Tabs */}
          <FilterTabs
            options={optFilter}
            onSelect={setSelectedTab}
            theme={darkMode}
          />
        </div>

        {/* Contenido por pestaña */}
        <div className="pt-2">
          {selectedTab === "Datos" && (
            <AlumnoDatos
              alumno={alumno}
              darkMode={darkMode}
              onEdit={() => setIsEditModalOpen(true)}
              onDeactivate={handleDeleteAlumno}
            />
          )}

          {selectedTab === "Pagos" && (
            <AlumnoPagos
              alumno={alumno}
              darkMode={darkMode}
              onDeletePago={handleDeletePago}
              onVerFactura={verFactura}
              onDescargarFactura={descargarFactura} 
              onOpenRegisterPagoModal={() => setIsRegisterPagoModalOpen(true)}
            />
          )}

          {selectedTab === "Ubicación" && (
            <AlumnoUbicacion ubicacion={ubicacionAlumno} darkMode={darkMode} />
          )}
        </div>
      </div>

      {/* Modales */}
      <RegisterPagoModal
        isOpen={isRegisterPagoModalOpen}
        onClose={() => setIsRegisterPagoModalOpen(false)}
        theme={darkMode}
        onPagoRegistered={refreshAlumno}
        alumnoData={alumno}
      />

      <RegisterAlumnoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onAlumnoRegistered={refreshAlumno}
        theme={darkMode}
        currentUser={userData}
        alumnoToEdit={alumno}
      />
    </div>
  );
};
