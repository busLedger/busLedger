DO $$ 
BEGIN
    CREATE TABLE IF NOT EXISTS usuarios (
        uid TEXT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        correo VARCHAR(255) UNIQUE NOT NULL,
        whatsapp VARCHAR(25) UNIQUE,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios (correo);
    CREATE INDEX IF NOT EXISTS idx_usuarios_whatsapp ON usuarios (whatsapp);

    CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS usuarios_roles (
        id SERIAL PRIMARY KEY,
        uid_usuario TEXT NOT NULL,
        id_rol INT NOT NULL,
        FOREIGN KEY (uid_usuario) REFERENCES usuarios(uid) ON DELETE CASCADE,
        FOREIGN KEY (id_rol) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON usuarios_roles (uid_usuario);
    CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON usuarios_roles (id_rol);

    CREATE TABLE IF NOT EXISTS buses (
        id SERIAL PRIMARY KEY,
        placa VARCHAR(20) UNIQUE NOT NULL,
        modelo VARCHAR(50) NOT NULL,
        año INT NOT NULL,
        id_dueño TEXT NOT NULL,
        id_conductor TEXT,
        nombre_ruta text
        FOREIGN KEY (id_dueño) REFERENCES usuarios(uid) ON DELETE CASCADE,
        FOREIGN KEY (id_conductor) REFERENCES usuarios(uid) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_buses_placa ON buses (placa);
    CREATE INDEX IF NOT EXISTS idx_buses_dueño ON buses (id_dueño);
    CREATE INDEX IF NOT EXISTS idx_buses_conductor ON buses (id_conductor);

    CREATE TABLE IF NOT EXISTS alumnos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        encargado VARCHAR(100) NOT NULL,
        no_encargado VARCHAR(25) NOT NULL,
        id_bus INT NOT NULL,
        direccion TEXT NOT NULL,
        ubicacion VARCHAR(255),
        activo BOOLEAN DEFAULT TRUE,
        pago_mensual DECIMAL(10,2) NOT NULL CHECK (pago_mensual >= 0),
        FOREIGN KEY (id_bus) REFERENCES buses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_alumnos_bus ON alumnos (id_bus);
    CREATE INDEX IF NOT EXISTS idx_alumnos_no_encargado ON alumnos (no_encargado);

    CREATE TABLE IF NOT EXISTS pagos_alumnos (
        id SERIAL PRIMARY KEY,
        id_alumno INT NOT NULL,
        fecha_pago DATE NOT NULL,
        mes_correspondiente VARCHAR(7) NOT NULL,
        monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
        FOREIGN KEY (id_alumno) REFERENCES alumnos(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_pagos_alumnos_alumno ON pagos_alumnos (id_alumno);
    CREATE INDEX IF NOT EXISTS idx_pagos_alumnos_mes ON pagos_alumnos (mes_correspondiente);

    CREATE TABLE IF NOT EXISTS ingresos (
        id SERIAL PRIMARY KEY,
        id_bus INT NOT NULL,
        fecha DATE NOT NULL,
        descripcion_ingreso TEXT NOT NULL,
        total_ingreso DECIMAL(10,2) NOT NULL CHECK (total_ingreso >= 0),
        FOREIGN KEY (id_bus) REFERENCES buses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_ingresos_bus ON ingresos (id_bus);
    CREATE INDEX IF NOT EXISTS idx_ingresos_mes ON ingresos (mes);

    CREATE TABLE IF NOT EXISTS gastos (
        id SERIAL PRIMARY KEY,
        id_bus INT NOT NULL,
        descripcion_gasto TEXT NOT NULL,
        monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
        fecha_gasto DATE NOT NULL,
        FOREIGN KEY (id_bus) REFERENCES buses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_gastos_bus ON gastos (id_bus);
    CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos (tipo_gasto);

    CREATE TABLE IF NOT EXISTS salarios_conductores (
        id SERIAL PRIMARY KEY,
        id_conductor TEXT NOT NULL,
        id_bus INT NOT NULL,
        mes VARCHAR(7) NOT NULL,
        monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
        FOREIGN KEY (id_conductor) REFERENCES usuarios(uid) ON DELETE CASCADE,
        FOREIGN KEY (id_bus) REFERENCES buses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_salarios_conductor ON salarios_conductores (id_conductor);
    CREATE INDEX IF NOT EXISTS idx_salarios_bus ON salarios_conductores (id_bus);
    CREATE INDEX IF NOT EXISTS idx_salarios_mes ON salarios_conductores (mes);

    INSERT INTO roles (nombre) 
    VALUES ('Admin'), ('Dueño'), ('Conductor')
    ON CONFLICT (nombre) DO NOTHING;
END $$;
