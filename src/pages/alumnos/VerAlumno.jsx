/* eslint-disable react-hooks/exhaustive-deps */
import { useParams, useNavigate } from "react-router-dom";
import { useContainerHeight } from "../../Hooks/useContainerHeight.js";
import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAlumno, deleteAlumno } from "../../api/alumnos.service";
import { Load } from "../../components/ui/Load";
import { CardResum } from "../../components/ui/CardResum";
import FilterTabs from "../../components/ui/FilterTabs";
import Button from "../../components/ui/Button";
import { Fab } from "../../components/ui/Fab/Fab.jsx";
import { RegisterPagoModal } from "../../components/ui/Modales/RegisterPagoModal.jsx";
import { message } from "antd";

export const VerAlumno = () => {
  const navigate = useNavigate();

  const containerRef = useContainerHeight();
  const [isRegisterPagoModalOpen, setIsRegisterPagoModalOpen] = useState(false);
  const { darkMode } = useOutletContext();
  const [optFilter, setOptFilter] = useState(["Datos", "Pagos"]);
  const [load, setLoad] = useState(true);
  const [alumno, setAlumno] = useState(null);
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState("Datos");

  const fetchAlumno = async () => {
    try {
      const alumnoData = await getAlumno(id);
      console.log("Alumno:", alumnoData);
      if (alumnoData?.ubicacion !== "") {
        setOptFilter(["Datos", "Pagos", "Ubicación"]);
      }
      setAlumno(alumnoData[0]);
    } catch (error) {
      console.error("Error al obtener el alumno:", error);
      message.error("Error al cargar los datos del alumno.");
    } finally {
      setLoad(false);
    }
  };
  const handleDeleteAlumno = async () => {
    try {
      await deleteAlumno(id);
      message.success("Alumno eliminado correctamente.");
      navigate("/home/alumnos");
    } catch (error) {
      console.error("Error al eliminar el alumno:", error);
    }
  };
  useEffect(() => {
    fetchAlumno();
  }, []);

  if (load) return <Load />;

  // **Cálculo del total recibido y pagos faltantes**
  const pagosRealizados = alumno?.pagos_alumnos.length || 0;
  const totalRecibido =
    alumno?.pagos_alumnos.reduce((sum, pago) => sum + pago.monto, 0) || 0;
  const pagosEsperados = 10; // Se esperan 10 pagos anuales
  const pagosFaltantes = pagosEsperados - pagosRealizados;
  const ingresosAnualesEsperados = alumno?.pago_mensual * 10 || 0;

  return (
    <section className="p-3">
      <div ref={containerRef} className="container-movil container w-full mx-auto p-2">
        <div className="flex justify-center w-full">
          <p className="title-pages w-4/5">Información del alumno</p>
        </div>
        <FilterTabs
          options={optFilter}
          onSelect={setSelectedTab}
          theme={darkMode}
        />
      </div>

      <div className="data-div p-4">
        <p className="text-center mt-4 mb-2 text-xl font-semibold">
          {alumno.nombre}
        </p>
        {selectedTab === "Datos" && alumno && (
          <div className="overflow-auto max-h-[60vh]">
            <table
              className={`w-full border-collapse rounded-lg ${
                darkMode
                  ? "bg-dark-purple text-white"
                  : "bg-white text-black border border-gray-300"
              }`}
            >
              <thead>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-500 text-white"
                      : "border-gray-300 text-black"
                  }`}
                ></tr>
              </thead>
              <tbody>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Encargado</td>
                  <td className="p-3">{alumno.encargado}</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Teléfono</td>
                  <td className="p-3">{alumno.no_encargado}</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Dirección</td>
                  <td className="p-3">{alumno.direccion}</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Pago Mensual</td>
                  <td className="p-3">{alumno.pago_mensual} Lps</td>
                </tr>
                <tr
                  className={`border-b ${
                    darkMode
                      ? "border-gray-600 hover:bg-dark-purple/80"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <td className="p-3 font-semibold">Ingreso Anual Esperado</td>
                  <td className="p-3">{ingresosAnualesEsperados} Lps</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full flex justify-center gap-4 mt-4">
              <Button
                text={"Eliminar Alumno"}
                onClick={handleDeleteAlumno.bind(this, alumno.id)}
                confirm={true}
                confirmTitle="¿Eliminar alumno?"
                confirmDescription="Esta acción no se puede deshacer y eliminara todos los registros relaciondas con este alumno."
                confirmOkText="Sí, eliminar"
                confirmCancelText="No"
                confirmPlacement="top"
              />
            </div>
          </div>
        )}

        {selectedTab === "Pagos" && alumno?.pagos_alumnos.length >= 0 && (
          <>
            {/* 📌 Sección de estadísticas con CardResum */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <CardResum
                title="Total Recibido"
                description={`${totalRecibido} Lps`}
                theme={darkMode}
              />
              <CardResum
                title="Pagos Faltantes"
                description={`${pagosFaltantes} ${
                  pagosFaltantes === 1 ? "pago" : "pagos"
                }`}
                theme={darkMode}
              />
            </div>

            {/* 📌 Tabla de pagos con scroll y sin paginación */}
            <div className="overflow-auto max-h-[60vh]">
              <table
                className={`w-full border-collapse rounded-lg ${
                  darkMode
                    ? "bg-dark-purple text-white"
                    : "bg-white text-black border border-gray-300"
                }`}
              >
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode
                        ? "border-gray-600 hover:bg-dark-purple/80"
                        : "border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <th className="p-3">Mes</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Fecha de Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {alumno.pagos_alumnos.map((pago) => (
                    <tr
                      key={pago.id}
                      className={`border-b ${
                        darkMode
                          ? "border-gray-600 hover:bg-dark-purple/80"
                          : "border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <td className="p-3">{pago.mes_correspondiente}</td>
                      <td className="p-3">{pago.monto} Lps</td>
                      <td className="p-3">
                        {new Date(pago.fecha_pago).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Fab onClick={() => setIsRegisterPagoModalOpen(true)} />
            <RegisterPagoModal
              isOpen={isRegisterPagoModalOpen}
              onClose={() => setIsRegisterPagoModalOpen(false)}
              theme={darkMode}
              onPagoRegistered={fetchAlumno}
              alumnoData={alumno}
            />
          </>
        )}

        {selectedTab === "Ubicación" && (
          <div
            className={`overflow-auto max-h-[60vh] rounded-lg p-4 text-center text-lg font-semibold ${
              darkMode ? "bg-dark-purple text-white" : "bg-gray-100 text-black"
            }`}
          >
            Aquí se verá la ubicación pronto.
          </div>
        )}
      </div>
    </section>
  );
};
