/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: -3.745, // Ubicación por defecto si no se obtiene la ubicación
  lng: -38.523,
};

export const MapPicker = ({ onLocationSelect }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [locationChecked, setLocationChecked] = useState(false); // Para evitar reintentos
  const mapRef = useRef(null);

  // Solicita la ubicación del usuario solo la primera vez
  useEffect(() => {
    if (!locationChecked && navigator.geolocation) {
      setLocationChecked(true); // Evita reintentos

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userLocation = { lat: latitude, lng: longitude };

          // Mueve el mapa sin provocar un re-render
          if (mapRef.current) {
            mapRef.current.panTo(userLocation);
          }

          setMarkerPosition(userLocation);
          onLocationSelect(userLocation);
        },
        () => {
          console.warn("No se pudo obtener la ubicación del usuario.");
          setMarkerPosition(defaultCenter);
          if (mapRef.current) {
            mapRef.current.panTo(defaultCenter);
          }
        }
      );
    }
  }, [locationChecked, onLocationSelect]);

  // Permite al usuario mover el marcador manualmente
  const onMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      onLocationSelect({ lat, lng });
    },
    [onLocationSelect]
  );

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        defaultCenter={defaultCenter} // No cambia dinámicamente, usa panTo()
        zoom={15}
        onClick={onMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </LoadScript>
  );
};
