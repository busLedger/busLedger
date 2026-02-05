/* eslint-disable react/prop-types */
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin } from "lucide-react";

export const AlumnoUbicacion = ({ ubicacion, darkMode }) => {
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const handleOpenInGoogleMaps = () => {
    if (!ubicacion) return;
    const { lat, lng } = ubicacion;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`
        rounded-lg overflow-hidden border
        ${
          darkMode
            ? "bg-gray-900 border-gray-800"
            : "bg-white border-gray-200"
        }
      `}
    >
      {isMapLoaded && ubicacion ? (
        <>
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "400px" }}
            center={ubicacion}
            zoom={16}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
            onClick={handleOpenInGoogleMaps}
          >
            <Marker position={ubicacion} />
          </GoogleMap>
          <div className="p-3 text-center text-sm text-muted-foreground">
            Haz clic en el mapa para abrir esta ubicación en Google Maps.
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <MapPin
            className={`h-16 w-16 mx-auto mb-4 ${
              darkMode ? "text-gray-600" : "text-gray-400"
            }`}
          />
          <p
            className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Ubicación no disponible
          </p>
        </div>
      )}
    </div>
  );
};
