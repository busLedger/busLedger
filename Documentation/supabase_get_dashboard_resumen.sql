create or replace function public.get_dashboard_resumen(
  p_user_id text,
  p_anio integer,
  p_mes text default 'todos'
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with params as (
  select
    p_user_id as user_id,
    p_anio as anio,
    lower(trim(coalesce(p_mes, 'todos'))) as mes,
    case lower(trim(coalesce(p_mes, 'todos')))
      when 'enero' then 1
      when 'febrero' then 2
      when 'marzo' then 3
      when 'abril' then 4
      when 'mayo' then 5
      when 'junio' then 6
      when 'julio' then 7
      when 'agosto' then 8
      when 'septiembre' then 9
      when 'octubre' then 10
      when 'noviembre' then 11
      when 'diciembre' then 12
      else null
    end as mes_num
),
rangos as (
  select
    user_id,
    anio,
    mes,
    mes_num,
    case
      when mes = 'todos' then make_date(anio, 1, 1)
      else make_date(anio, mes_num, 1)
    end as fecha_inicio,
    case
      when mes = 'todos' then make_date(anio, 12, 31)
      else (make_date(anio, mes_num, 1) + interval '1 month - 1 day')::date
    end as fecha_fin,
    make_date(anio, 1, 1) as fecha_inicio_acumulado
  from params
),
buses_usuario as (
  select b.id
  from public.buses b
  join rangos r on true
  where b."id_dueño" = r.user_id
),
alumnos_usuario as (
  select a.id, coalesce(a.pago_mensual, 0)::numeric as pago_mensual
  from public.alumnos a
  where a.activo = true
    and a.id_bus in (select id from buses_usuario)
),
pagos_periodo as (
  select p.id_alumno, coalesce(p.monto, 0)::numeric as monto
  from public.pagos_alumnos p
  join rangos r on true
  where p.id_alumno in (select id from alumnos_usuario)
    and p.anio_correspondiente = r.anio
    and (
      r.mes = 'todos'
      or lower(p.mes_correspondiente) = r.mes
    )
),
alumnos_pagaron as (
  select distinct id_alumno
  from pagos_periodo
),
ingresos_periodo as (
  select coalesce(sum(i.total_ingreso), 0)::numeric as total
  from public.ingresos i
  cross join rangos r
  where i.id_bus in (select id from buses_usuario)
    and i.fecha between r.fecha_inicio and r.fecha_fin
),
gastos_periodo as (
  select
    coalesce(sum(g.monto), 0)::numeric as total,
    coalesce(
      sum(g.monto) filter (where g.descripcion_gasto = 'Combustible'),
      0
    )::numeric as combustible
  from public.gastos g
  cross join rangos r
  where g.id_bus in (select id from buses_usuario)
    and g.fecha_gasto between r.fecha_inicio and r.fecha_fin
),
ingresos_acumulados as (
  select coalesce(sum(i.total_ingreso), 0)::numeric as total
  from public.ingresos i
  cross join rangos r
  where i.id_bus in (select id from buses_usuario)
    and i.fecha between r.fecha_inicio_acumulado and r.fecha_fin
),
gastos_acumulados as (
  select coalesce(sum(g.monto), 0)::numeric as total
  from public.gastos g
  cross join rangos r
  where g.id_bus in (select id from buses_usuario)
    and g.fecha_gasto between r.fecha_inicio_acumulado and r.fecha_fin
),
totales as (
  select
    (select count(*) from buses_usuario) as total_buses,
    (select count(*) from alumnos_usuario) as total_alumnos,
    (select count(*) from alumnos_pagaron) as alumnos_pagaron,
    (select coalesce(sum(monto), 0) from pagos_periodo) as total_dinero_obtenido,
    (select total from ingresos_periodo) as total_ingresos,
    (select total from gastos_periodo) as total_gastos,
    (select combustible from gastos_periodo) as total_combustible,
    (select total from ingresos_acumulados) as total_ingresos_acumulados,
    (select total from gastos_acumulados) as total_gastos_acumulados
)
select jsonb_build_object(
  'totalBuses', total_buses,
  'totalAlumnos', total_alumnos,
  'alumnosPagaron', alumnos_pagaron,
  'alumnosNoPagaron', greatest(total_alumnos - alumnos_pagaron, 0),
  'totalDineroObtenido', total_dinero_obtenido,
  'totalDineroFaltante', (
    select coalesce(sum(a.pago_mensual), 0)
    from alumnos_usuario a
    where not exists (
      select 1
      from alumnos_pagaron ap
      where ap.id_alumno = a.id
    )
  ),
  'totalIngresos', total_ingresos,
  'totalGastos', total_gastos,
  'totalCombustible', total_combustible,
  'disponible', total_ingresos - total_gastos,
  'disponibleAcumulado', total_ingresos_acumulados - total_gastos_acumulados
)
from totales;
$$;
