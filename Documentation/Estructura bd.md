# Estructura de la Base de Datos para BusLedger

## Usuarios (`usuarios`)
Guarda la información de los usuarios autenticados mediante Firebase Auth.

| Campo         | Tipo de Dato       | Descripción |
|--------------|------------------|-------------|
| uid (PK)     | UUID             | Identificador único (Firebase UID). |
| nombre       | VARCHAR(100)     | Nombre completo del usuario. |
| correo       | VARCHAR(255)     | Correo electrónico único. |
| whatsapp     | VARCHAR(255)     | Numero de whatsapp del usuario. |
| activo       | BOOLEAN          | Indica si el usuario está activo. |
| fecha_creacion | TIMESTAMP DEFAULT CURRENT_TIMESTAMP | Fecha en que se creó el usuario. |

### Relaciones:
- Un usuario puede tener múltiples roles.
- Un usuario puede ser dueño de varios buses.
- Un usuario puede ser conductor de un bus.

---

## Roles (`roles`)
Define los diferentes roles en el sistema.

| Campo  | Tipo de Dato   | Descripción |
|--------|--------------|-------------|
| id (PK) | SERIAL       | Identificador único del rol. |
| nombre  | VARCHAR(50)  | Nombre del rol (Admin, Dueño, Conductor). |

### Relaciones:
- Un rol puede ser asignado a múltiples usuarios.

---

## Usuarios y Roles (`usuarios_roles`)
Tabla intermedia para asignar múltiples roles a un usuario.

| Campo        | Tipo de Dato | Descripción |
|-------------|------------|-------------|
| id (PK)     | SERIAL     | Identificador único. |
| uid_usuario (FK) | UUID  | Relación con `usuarios.uid`. |
| id_rol (FK) | INT       | Relación con `roles.id`. |

### Relaciones:
- Un usuario puede tener múltiples roles.
- Un rol puede ser asignado a múltiples usuarios.

---

## Buses (`buses`)
Registra los vehículos del servicio de transporte.

| Campo        | Tipo de Dato  | Descripción |
|-------------|-------------|-------------|
| id (PK)     | SERIAL      | Identificador único del bus. |
| placa       | VARCHAR(20) | Número de placa del bus (único). |
| modelo      | VARCHAR(50) | Modelo del bus. |
| año         | INT         | Año del bus. |
| id_dueño (FK) | UUID       | Relación con `usuarios.uid`. |
| id_conductor (FK) | UUID   | Relación con `usuarios.uid`. |
| nombre_ruta         | text         | Nombre de la ruta asignada |

### Relaciones:
- Un bus pertenece a un dueño.
- Un bus tiene asignado un conductor.
- Un bus puede tener varios alumnos asignados.

---

## Alumnos (`alumnos`)
Registra a los niños que utilizan el servicio de transporte.

| Campo        | Tipo de Dato  | Descripción |
|-------------|-------------|-------------|
| id (PK)     | SERIAL      | Identificador único del alumno. |
| nombre      | VARCHAR(100)| Nombre del alumno. |
| encargado   | VARCHAR(100)| Nombre del encargado. |
| no_encargado   | VARCHAR(100)| Numero del encargado. |
| id_bus (FK) | INT         | Relación con `buses.id`. |
| direccion   | TEXT        | Dirección escrita del alumno. |
| activo   | bool        | Estado del alumno en la ruta. |
| ubicacion   | VARCHAR(255) | Coordenadas o enlace de Google Maps. |
| pago_mensual | DECIMAL(10,2) | Monto que el alumno paga al mes. |

### Relaciones:
- Un alumno pertenece a un bus.
- Un alumno tiene múltiples pagos registrados.

---

## Pagos de Alumnos (`pagos_alumnos`)
Registra los pagos mensuales de los alumnos, permitiendo registrar la fecha en que se realizó el pago y el mes al que corresponde la mensualidad.

| Campo         | Tipo de Dato  | Descripción |
|--------------|-------------|-------------|
| id (PK)      | SERIAL      | Identificador único del pago. |
| id_alumno (FK) | INT       | Relación con `alumnos.id`. |
| fecha_pago   | DATE        | Fecha en que se realizó el pago. |
| mes_correspondiente | VARCHAR(7) | Mes al que pertenece el pago (formato YYYY-MM). |
| monto        | DECIMAL(10,2) | Monto pagado. |

### Relaciones:
- Un pago pertenece a un alumno.

---

## Ingresos por Bus (`ingresos`)
Cada mes se suman los pagos de los alumnos de un bus.

| Campo        | Tipo de Dato  | Descripción |
|-------------|-------------|-------------|
| id (PK)     | SERIAL      | Identificador único del ingreso. |
| id_bus (FK) | INT         | Relación con `buses.id`. |
| fecha         | VARCHAR(7)  | Tipo date (formato YYYY-MM). |
| descripcion_ingreso  | VARCHAR(7)  | Descripcion del ingreso. |
| total_ingreso | DECIMAL(10,2) | Total de ingresos de ese mes. |

### Relaciones:
- Un ingreso pertenece a un bus.

---

## Gastos por Bus (`gastos`)
Registra todos los gastos asociados a un bus.

| Campo        | Tipo de Dato  | Descripción |
|-------------|-------------|-------------|
| id (PK)     | SERIAL      | Identificador único del gasto. |
| id_bus (FK) | INT         | Relación con `buses.id`. |
| tipo_gasto  | VARCHAR(50) | Tipo de gasto (Combustible, Reparación, etc.). |
| monto       | DECIMAL(10,2) | Monto gastado. |
| fecha_gasto | DATE        | Fecha del gasto. |

### Relaciones:
- Un gasto pertenece a un bus.

---

## Salarios de Conductores (`salarios_conductores`)
Registra los pagos mensuales de los conductores.

| Campo        | Tipo de Dato  | Descripción |
|-------------|-------------|-------------|
| id (PK)     | SERIAL      | Identificador único del salario. |
| id_conductor (FK) | UUID  | Relación con `usuarios.uid`. |
| id_bus (FK) | INT         | Relación con `buses.id`. |
| mes         | VARCHAR(7)  | Mes del salario (formato YYYY-MM). |
| monto       | DECIMAL(10,2) | Monto del salario. |

### Relaciones:
- Un salario pertenece a un conductor.
- Un salario está asociado a un bus.

---

## Relaciones Clave del Sistema:
- Un usuario puede tener múltiples roles.  
- Un dueño puede tener varios buses.  
- Un conductor puede estar asignado a un solo bus.  
- Un bus puede tener varios alumnos asignados.  
- Cada mes se calculan ingresos y gastos por bus.  
- Los conductores reciben un pago mensual fijo.  
- Cada pago de alumno tiene una fecha de pago y un mes al que corresponde.  
- Cada alumno tiene una dirección escrita y una ubicación geográfica en Google Maps.  

--- 
