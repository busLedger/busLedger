# Requisitos del Sistema - BusLedger

## 1. Descripción General
BusLedger es una aplicación web diseñada para ayudar a los dueños de buses escolares a gestionar sus ingresos, gastos y pagos de alumnos, proporcionando un control financiero eficiente.

## 2. Actores del Sistema
### Administrador (GodSystem)
- Gestiona la aplicación completa.
- Puede crear y administrar usuarios.
- Puede ver reportes de ingresos y gastos globales.

### Dueño de Bus
- Registra y administra sus buses.
- Agrega alumnos y asigna sus pagos.
- Registra los gastos asociados a su bus.
- Supervisa los ingresos y ganancias netas.
- Puede ser también conductor si se le asigna ese rol.

### Conductor
- Puede visualizar el bus al que está asignado.
- Puede registrar gastos operativos como combustible y reparaciones.
- Si también es dueño, podrá ver los datos financieros del bus.

## 3. Requisitos Funcionales
### Módulo de Autenticación
- El sistema debe permitir el registro e inicio de sesión de usuarios con Firebase Auth.
- Solo los administradores pueden agregar nuevos usuarios.
- Los usuarios deben autenticarse con su correo y contraseña.
- Un usuario puede tener más de un rol asignado.

### Módulo de Gestión de Roles
- Se debe permitir la asignación de múltiples roles a un usuario.
- Se debe poder modificar los roles de un usuario en cualquier momento.

### Módulo de Gestión de Buses
- Los dueños pueden registrar, actualizar y eliminar buses.
- Cada bus debe estar ligado a un dueño y a un conductor.
- Un dueño puede tener varios buses.

### Módulo de Gestión de Alumnos
- Los dueños pueden agregar alumnos y asignarlos a un bus.
- Se debe registrar el monto de pago mensual de cada alumno.
- Se debe poder modificar o eliminar alumnos.
- Se debe registrar la dirección escrita del alumno.
- Se debe permitir agregar la ubicación geográfica del alumno en Google Maps.

### Módulo de Pagos de Alumnos
- Cada mes, los dueños pueden registrar los pagos de los alumnos.
- Se debe registrar la fecha en que se realizó el pago y el mes al que corresponde.
- Si un alumno no ha pagado, debe mostrarse como pendiente.
- Se debe poder visualizar el historial de pagos de cada alumno.

### Módulo de Ingresos
- Cada mes, el sistema debe calcular automáticamente los ingresos por bus.
- Se debe poder filtrar ingresos por mes y año.
- El dueño debe ver ingresos acumulados y mensuales.

### Módulo de Gastos
- Se pueden registrar gastos como:
  - Combustible.
  - Revisiones mecánicas.
  - Aceite y reparaciones.
  - Salario del conductor (automático cada mes).
- Se debe visualizar el total de gastos por bus y mes.
- Los conductores pueden registrar gastos diarios si tienen permisos.

### Módulo de Reportes y Balance Financiero
- Cada dueño debe poder ver su balance mensual (ingresos - gastos).
- El administrador puede ver reportes globales.
- Se deben mostrar gráficos de tendencias de ingresos y gastos.

## 4. Requisitos No Funcionales
### Seguridad
- Los datos deben estar protegidos con Firebase Auth y reglas de acceso en Supabase.
- Solo los dueños pueden ver sus propios datos, excepto el administrador.

### Disponibilidad
- La aplicación debe ser accesible desde web y dispositivos móviles.
- Se debe garantizar acceso offline para ciertas funciones si es posible.

### Usabilidad
- La interfaz debe ser intuitiva y fácil de usar para personas sin conocimientos técnicos.
- Se deben incluir alertas y notificaciones sobre pagos pendientes.

## 5. Casos de Uso Principales
1. Registro de usuarios y asignación de roles.
2. Registro de buses y asignación de dueño y conductor.
3. Registro de alumnos y asignación a un bus.
4. Registro de pagos mensuales de los alumnos.
5. Registro de gastos del bus.
6. Consulta del balance mensual.
7. Generación de reportes de ingresos y gastos.

## 6. Tecnologías Utilizadas
- Frontend: React
- Base de Datos: Supabase (PostgreSQL)
- Autenticación: Firebase Auth
- Mapas y Ubicación: Google Maps API

## 7. Consideraciones Finales
El sistema debe permitir la administración eficiente del negocio de transporte escolar, asegurando una gestión clara de los ingresos y gastos de cada bus. Los roles múltiples facilitarán la flexibilidad en la asignación de permisos y el control de accesos a la información. Se priorizará la seguridad en la autenticación y almacenamiento de datos.
