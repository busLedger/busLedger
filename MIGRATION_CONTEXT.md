# Contexto de Migracion: Next.js + NeonDB

Fecha: 2026-07-23
Rama: `migration(nextJS-Convertion)`

## Objetivo

Migrar la aplicacion desde Vite + React hacia Next.js y reemplazar las consultas hechas con Supabase por consultas a NeonDB usando una connection string.

La variable esperada para Neon es:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```

## Avances Realizados

- Se creo la rama `migration(nextJS-Convertion)`.
- Se cambio el proyecto de Vite a Next.js.
- Se agrego App Router en `src/app`.
- Se conserva temporalmente una ruta catch-all en
  `src/app/[[...slug]]/page.jsx` unicamente para las pantallas dinamicas de
  detalle que aun usan `react-router-dom`.
- Se movio `src/pages` a `src/views` para evitar conflicto con el Pages Router de Next.
- Se eliminaron archivos propios de Vite:
  - `vite.config.js`
  - `index.html`
- Se elimino `supabase_connection.js`.
- Los servicios en `src/api/*.service.js` ya no importan Supabase.
- Se agrego `src/lib/clientApi.js` como cliente HTTP autenticado para las APIs.
- Se agrego `src/lib/db.js` con conexion server-side usando `pg`.
- Las consultas SQL se distribuyeron en rutas REST por dominio.
- Se agrego `.env.example` con las variables necesarias.
- Se actualizaron scripts:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
- Se agregaron dependencias:
  - `next`
  - `pg`
  - `@tailwindcss/postcss`
- Se corrigio Firebase para usar variables `NEXT_PUBLIC_FIREBASE_*`.
- Se corrigio Google Maps para usar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- Se agrego `.next` al `.gitignore`.

## Seguridad Firebase y Separacion de APIs

- El cliente ahora obtiene el ID token con `auth.currentUser.getIdToken()` y lo
  envia como `Authorization: Bearer <token>`.
- Se agrego Firebase Admin server-side en `src/lib/firebaseAdmin.js`.
- Se agrego `src/lib/auth.js` para:
  - verificar el ID token;
  - obtener el usuario y sus roles desde PostgreSQL;
  - rechazar usuarios inexistentes o inactivos;
  - evitar confiar en el UID enviado por el navegador.
- Todas las rutas exigen autenticacion y obtienen el UID desde el token
  verificado.
- El dominio de buses fue separado del RPC:
  - `GET/POST /api/buses`
  - `GET/PATCH/DELETE /api/buses/[id]`
- Las rutas de buses validan rol, propietario y conductor segun la operacion.
- El cliente de buses ya consume estas rutas REST.
- El handler antiguo de buses fue retirado.
- El dominio de alumnos tambien fue separado:
  - `GET/POST /api/alumnos`
  - `GET/PATCH/DELETE /api/alumnos/[id]`
- Las consultas de alumnos validan la relacion con el bus. Los conductores
  asignados pueden consultar; solo el dueño del bus o un administrador puede
  crear, editar, mover, desactivar o eliminar alumnos.
- El cliente de alumnos ya consume estas rutas REST y el handler antiguo fue
  retirado.
- El dominio de pagos fue separado:
  - `GET/POST /api/pagos`
  - `DELETE /api/pagos/[id]`
- El servidor obtiene el alumno y su bus antes de consultar, registrar o
  eliminar un pago. Solo el dueño del bus o un administrador puede operar.
- Registrar un pago y crear su ingreso asociado se ejecutan en una transaccion.
  La eliminacion tambien borra el ingreso asociado dentro de una transaccion.
- El handler antiguo de pagos fue retirado.
- Se agrego `Documentation/migration_next_api.sql` con la columna/relacion
  `ingresos.id_pago` y restricciones unicas para impedir pagos duplicados.
- El dominio de ingresos fue separado:
  - `GET/POST /api/ingresos`
  - `GET/DELETE /api/ingresos/[id]`
  - `GET /api/ingresos/periodos`
  - `GET /api/ingresos/resumen`
- Las rutas derivan los buses accesibles desde el usuario autenticado. El dueño
  solo accede a sus unidades y el administrador puede consultar el conjunto
  global.
- Al eliminar un ingreso generado por un pago, ingreso y pago se eliminan en
  una sola transaccion.
- El handler antiguo de ingresos fue retirado.
- El dominio de gastos fue separado:
  - `GET/POST /api/gastos`
  - `GET/DELETE /api/gastos/[id]`
  - `GET /api/gastos/periodos`
- Dueños y administradores pueden consultar y eliminar gastos. Un conductor
  asignado puede registrar un gasto en su unidad, pero las rutas de consulta
  financiera siguen restringidas al dueño o administrador.
- El handler antiguo de gastos fue retirado.
- El dominio de usuarios fue separado:
  - `GET/POST /api/usuarios`
  - `PATCH /api/usuarios/[uid]`
  - `GET /api/usuarios/me`
  - `GET /api/usuarios/roles`
- El perfil propio se resuelve exclusivamente desde el UID verificado del token.
- Las altas administrativas comprueban que el UID exista en Firebase y que su
  correo coincida antes de insertar el perfil PostgreSQL.
- Los dueños pueden crear solamente contactos con rol Conductor. El UUID se
  genera en el servidor y se devuelve al formulario para asignarlo al bus.
- Activar o desactivar una cuenta administrativa sincroniza PostgreSQL y
  Firebase Auth cuando existe una cuenta Firebase asociada.
- El handler antiguo de usuarios fue retirado.
- El dashboard fue separado:
  - `GET /api/dashboard/resumen`
  - `GET /api/dashboard/pagos`
  - `GET /api/dashboard/periodos`
- Los resúmenes mensuales y anuales derivan los buses desde el usuario
  autenticado; el administrador obtiene datos globales.
- Al completar la migracion de dashboard se elimino definitivamente
  `src/app/api/rpc/route.js` y el metodo generico `request()` del cliente.

Variables server-side nuevas:

```env
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Correccion de Estilos

Problema detectado: la app cargaba como HTML plano porque Tailwind no estaba siendo procesado correctamente por Next.

Cambios aplicados:

- Se agrego `postcss.config.cjs`.
- Se alineo Tailwind a `4.3.3`.
- Se agregaron fuentes explicitas en `src/index.css`:

```css
@source "./app/**/*.{js,jsx}";
@source "./views/**/*.{js,jsx}";
@source "./components/**/*.{js,jsx}";
@source "./routes/**/*.{js,jsx}";
@source "./Hooks/**/*.{js,jsx}";
```

- Se verifico que el CSS generado contiene utilidades como:
  - `.flex`
  - `.h-screen`
  - `.items-center`
  - `.bg-background`

## Capa de Datos con SWR

- Se agrego `swr` y un `SWRProvider` global en el layout.
- Configuracion global:
  - no revalidar al enfocar la ventana;
  - revalidar al recuperar conexion;
  - deduplicacion de 30 segundos;
  - dos reintentos ante errores.
- Se agrego una sesion reactiva de Firebase mediante `onAuthStateChanged`.
- Todos los fetchers SWR obtienen el ID token en el momento de la solicitud.
- Se agregaron hooks por dominio en `src/Hooks/swr`:
  - dashboard;
  - usuarios;
  - buses;
  - alumnos;
  - pagos;
  - ingresos;
  - gastos.
- Las mutaciones invalidan tanto su dominio como las caches relacionadas. Por
  ejemplo, un pago revalida pagos, alumnos, ingresos y dashboard.
- Dashboard y Admin Panel ya consumen SWR directamente y dejaron de gestionar
  sus cargas iniciales con `useEffect` y estado duplicado.
- Unidades ya consume `useBuses` para el listado financiero y deriva los meses
  disponibles con `useMemo`, sin una segunda copia local de los buses.
- El registro de buses usa `useBusMutations`.
- Los selectores de buses de los formularios de alumnos, ingresos y gastos
  comparten la cache de `useBuses`.
- Las mutaciones financieras tambien invalidan `/api/buses`, manteniendo
  actualizados ingresos, gastos y balance de las tarjetas de unidades.
- Se elimino `src/api/buses.service.js`.
- Alumnos y su vista de detalle ya consumen `useAlumnos`/`useAlumno`.
- Alta, edicion y desactivacion usan `useAlumnoMutations`.
- El historial y registro de pagos usan `usePagosAlumno` y
  `usePagoMutations`; los meses disponibles se derivan de la cache.
- Se eliminaron `src/api/alumnos.service.js` y `src/api/pagos.service.js`.
- Ingresos consume `useIngresos`, `useIngresoPeriods` y
  `useFinancialSummary`; altas y eliminaciones usan `useIngresoMutations`.
- Gastos consume `useGastos`, `useGastoPeriods` y el resumen financiero
  compartido; altas y eliminaciones usan `useGastoMutations`.
- Los datos filtrados por mes y las rutas disponibles se derivan con
  `useMemo`, sin recargas manuales al cambiar filtros.
- Se eliminaron `src/api/ingresos.service.js` y `src/api/gastos.service.js`.
- Home obtiene el perfil autenticado con `useMe`.
- El formulario de usuarios obtiene roles con `useRoles` y crea usuarios con
  `useCreateUser`.
- Al cerrar sesion se vacia la cache SWR para evitar reutilizar datos entre
  usuarios.
- Se eliminaron `src/api/user.service.js` y el antiguo servicio de
  autenticacion; Firebase Auth se consume desde `AuthProvider`.

## Rutas Nativas de Next

- El login ya se sirve desde `src/app/page.jsx`.
- Se agrego un layout protegido en `src/app/home/layout.jsx`.
- `/home` redirige a `/home/dashboard` con `redirect()` de Next.
- Ya existen paginas nativas para:
  - dashboard;
  - admin panel;
  - unidades;
  - alumnos;
  - pagos;
  - gastos.
- Sidebar, navegacion movil, login, logout y proteccion de sesion usan
  `next/navigation`.
- `HomeProvider` reemplaza el contexto de `Outlet` en las paginas ya migradas.
- React Router queda limitado temporalmente a las rutas dinamicas de unidad,
  alumno y factura.

## Validaciones Realizadas

Comando ejecutado:

```bash
npm.cmd run build
```

Resultado:

- Build completado correctamente.
- Next compila la app.
- Las rutas REST por dominio quedan disponibles.
- El servidor dev respondio `200 OK` en:

```text
http://127.0.0.1:3000
```

## Warnings Actuales

Estos warnings no bloquean el build:

- Next indica que no detecta plugin especifico de Next en la configuracion ESLint.
- ESLint marca algunos comentarios `eslint-disable` como no usados.
- `DATABASE_URL no esta configurada`: esperado hasta colocar la connection string real de Neon.
- npm reporta vulnerabilidades en dependencias. No se ejecuto `npm audit fix --force` porque podria romper versiones.

## Pendientes Importantes

1. Configurar `.env` real:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
```

2. Probar cada modulo contra Neon:

- Login / datos de usuario
- Dashboard
- Admin Panel
- Unidades
- Alumnos
- Pagos / Ingresos
- Gastos
- Facturas

3. Revisar compatibilidad del esquema SQL:

- La API usa columnas con nombres actuales como `id_dueño`.
- Verificar que Neon tenga exactamente los mismos nombres de columnas que el esquema anterior.
- Revisar columnas usadas por la app pero inconsistentes en `Documentation/bd_dml.sql`, por ejemplo:
  - `ingresos.id_pago`
  - indices sobre columnas no definidas como `mes` o `tipo_gasto`
  - posible falta de coma en `buses.nombre_ruta text`

4. Mejorar la API:

- La separacion del RPC por dominios fue completada.
- Agregar validacion de payloads.
- Agregar manejo mas claro de errores SQL.
- Mantener pruebas de autorizacion por dominio para dueño, conductor y
  administrador.

5. Migracion Next mas completa:

- Migrar las rutas dinamicas de unidad, alumno y factura a App Router.
- Eliminar el catch-all, `AppRouter`, `BrowserRouter` y la dependencia
  `react-router-dom` al completar esas rutas.
- Revisar componentes que dependen de `window`, `localStorage`, mapas o impresion.

6. Limpieza posterior:

- Revisar si `src/main.jsx` ya puede eliminarse.
- Revisar si `src/output.css` todavia es necesario.
- Agregar plugin/config ESLint de Next.
- Corregir warnings de `eslint-disable` no usados.

## Archivos Clave

- `next.config.js`
- `postcss.config.cjs`
- `.env.example`
- `src/app/layout.jsx`
- `src/app/[[...slug]]/page.jsx`
- `src/app/api/**/route.js`
- `src/lib/db.js`
- `src/lib/clientApi.js`
- `src/index.css`
- `src/routes/AppRouter.jsx`
- `src/views/**`

## Sesion Firebase y SWR

- `AuthProvider` mantiene una unica suscripcion global a Firebase Auth.
- Login, recuperacion de contraseña y logout consumen el contexto de autenticacion.
- `/home` esta protegido y redirige al login cuando no existe una sesion valida.
- La identidad ya no se duplica en `localStorage`; Firebase conserva la sesion.
- Los hooks SWR reutilizan el estado global y envian el ID token mediante
  `authFetch`.
- Firebase Client se inicializa de forma diferida solo en el navegador para no
  interferir con el prerender de Next.

## Nota Para Retomar

El build ya funciona y los estilos Tailwind ya se generan. Lo siguiente deberia ser conectar una `DATABASE_URL` real de Neon y hacer pruebas funcionales pantalla por pantalla, corrigiendo SQL segun el esquema real migrado.
