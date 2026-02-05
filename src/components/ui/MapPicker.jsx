/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: -3.745,
  lng: -38.523,
};

export const MapPicker = ({ onLocationSelect }) => {
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [map, setMap] = useState(null);
  const [locationChecked, setLocationChecked] = useState(false);

  // Carga del script de Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Geolocalización del usuario (solo una vez)
  useEffect(() => {
    if (!isLoaded || locationChecked) return;

    if (!navigator.geolocation) {
      console.warn("Geolocalización no soportada por el navegador.");
      setLocationChecked(true);
      return;
    }

    setLocationChecked(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLocation = { lat: latitude, lng: longitude };

        setMarkerPosition(userLocation);
        onLocationSelect?.(userLocation);

        if (map) {
          map.panTo(userLocation);
        }
      },
      (error) => {
        console.warn("No se pudo obtener la ubicación del usuario:", error);
        // Si falla, se queda con defaultCenter
        if (map) {
          map.panTo(defaultCenter);
        }
      }
    );
  }, [isLoaded, locationChecked, map, onLocationSelect]);

  // Permite al usuario mover el marcador manualmente
  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPos = { lat, lng };
      setMarkerPosition(newPos);
      onLocationSelect?.(newPos);
    },
    [onLocationSelect]
  );

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  if (loadError) {
    return <p>No se pudo cargar el mapa. Revisa tu API Key.</p>;
  }

  if (!isLoaded) {
    return <p>Cargando mapa...</p>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={markerPosition || defaultCenter}
      zoom={15}
      onClick={handleMapClick}
      onLoad={handleMapLoad}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
};
