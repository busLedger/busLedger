# 🚌 Bus Ledger

**Bus Ledger** es una aplicación web moderna diseñada para dueños y conductores de buses escolares. Su objetivo es facilitar el control de ingresos, pagos de alumnos y gastos asociados a cada unidad de transporte.

La aplicación está construida como un frontend-only project utilizando **React**, con **Firebase Authentication** para el manejo seguro de usuarios, y **Supabase** como base de datos y backend-as-a-service para almacenamiento y consultas.

---

## 🚀 Funcionalidades

- 📋 Registro de alumnos con dirección y ubicación geográfica.
- 💰 Gestión de pagos mensuales por alumno, con control por mes específico.
- 📈 Cálculo automático de ingresos por bus.
- 🧾 Registro de gastos como combustible, aceite, reparaciones y revisiones mecánicas.
- 📊 Panel resumen por bus y estado financiero general.
- 👥 Control de roles (Admin, Dueños de buses y Conductores).
- 🔐 Inicio de sesión y registro seguro con Firebase Authentication.

---

## 🛠️ Tecnologías Usadas

- **React** – Framework principal del frontend.
- **Firebase Authentication** – Manejo de sesiones de usuario y control de acceso.
- **Supabase** – Base de datos relacional (PostgreSQL) + API automática.
- **Netlify** – Hosting del frontend.

---

## 📦 Estructura del Proyecto

src/
├── api/ # Controladores con la logica del negocio y peticiones a supabase
├── components/ # Componentes reutilizables
├── pages/ # Vistas principales de la app
└── hooks/ # Hooks personalizados

---

## ⚙️ Configuración del Proyecto

1. Clona este repositorio:
```bash
git clone https://github.com/tu-usuario/bus-ledger.git
cd bus-ledger
```

2. Instala dependencias:
  npm install

3. Crea un archivo .env con tus credenciales de Firebase y Supabase:
  
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  VITE_FIREBASE_API_KEY=your_firebase_api_key
  VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
  VITE_FIREBASE_PROJECT_ID=your_project_id

4. Ejecuta la app:
   npm run dev

✍️ Autor
Desarrollado con ❤️ por Harol Morales


