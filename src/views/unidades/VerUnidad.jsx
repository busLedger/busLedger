import { useParams } from "next/navigation";
export const VerUnidad = () => {
  const { id } = useParams();
  return (
    <div>
      <h2>Detalles de la Unidad {id}</h2>
    </div>
  );
};
