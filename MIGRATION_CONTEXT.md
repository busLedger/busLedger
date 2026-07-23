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
- Se agrego una ruta catch-all en `src/app/[[...slug]]/page.jsx` para conservar temporalmente el routing existente con `react-router-dom`.
- Se movio `src/pages` a `src/views` para evitar conflicto con el Pages Router de Next.
- Se eliminaron archivos propios de Vite:
  - `vite.config.js`
  - `index.html`
- Se elimino `supabase_connection.js`.
- Los servicios en `src/api/*.service.js` ya no importan Supabase.
- Se agrego `src/lib/clientApi.js` como cliente HTTP interno hacia `/api/rpc`.
- Se agrego `src/lib/db.js` con conexion server-side usando `pg`.
- Se agrego `src/app/api/rpc/route.js` como API route central para ejecutar consultas SQL contra Neon.
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

## Validaciones Realizadas

Comando ejecutado:

```bash
npm.cmd run build
```

Resultado:

- Build completado correctamente.
- Next compila la app.
- La API route `/api/rpc` queda disponible.
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

- Separar `/api/rpc` en endpoints por dominio.
- Agregar validacion de payloads.
- Agregar manejo mas claro de errores SQL.
- Evitar exponer operaciones genericas sin auth server-side.

5. Migracion Next mas completa:

- Reemplazar gradualmente `react-router-dom` por rutas nativas de Next.
- Convertir pantallas a pages/layouts reales de App Router cuando convenga.
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
- `src/app/api/rpc/route.js`
- `src/lib/db.js`
- `src/lib/clientApi.js`
- `src/index.css`
- `src/routes/AppRouter.jsx`
- `src/views/**`

## Nota Para Retomar

El build ya funciona y los estilos Tailwind ya se generan. Lo siguiente deberia ser conectar una `DATABASE_URL` real de Neon y hacer pruebas funcionales pantalla por pantalla, corrigiendo SQL segun el esquema real migrado.
