-- Ajustes requeridos por las APIs REST de Next.js.
-- Ejecutar una vez sobre la base PostgreSQL/Neon existente.

ALTER TABLE ingresos
  ADD COLUMN IF NOT EXISTS id_pago INT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_ingresos_id_pago
  ON ingresos (id_pago)
  WHERE id_pago IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pagos_alumno_periodo
  ON pagos_alumnos (id_alumno, mes_correspondiente, anio_correspondiente);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_ingresos_pago'
  ) THEN
    ALTER TABLE ingresos
      ADD CONSTRAINT fk_ingresos_pago
      FOREIGN KEY (id_pago)
      REFERENCES pagos_alumnos(id)
      ON DELETE CASCADE;
  END IF;
END
$$;
