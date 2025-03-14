import { useParams } from "react-router-dom";
export const VerUnidad = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>Detalles de la Unidad {id}</h2>
    </div>
  );
};
