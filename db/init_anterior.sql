/* 2025-03-10 16:34:20 [101 ms] */ 
CREATE TABLE Especies (
    id_especie SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    id_forma_hoja INT REFERENCES DescripcionesFormaHoja(id_forma_hoja) ON DELETE SET NULL,
    id_forma_flor INT REFERENCES DescripcionesFormaFlor(id_forma_flor) ON DELETE SET NULL,
    id_origen INT REFERENCES DescripcionesOrigen(id_origen) ON DELETE SET NULL,
    fotografia TEXT
);

CREATE TABLE DescripcionesFormaHoja (
    id_forma_hoja SERIAL PRIMARY KEY,
    forma_hoja VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    fotografia TEXT
);

CREATE TABLE DescripcionesFormaFlor (
    id_forma_flor SERIAL PRIMARY KEY,
    forma_flor VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    fotografia TEXT
);

CREATE TABLE DescripcionesOrigen (
    id_origen SERIAL PRIMARY KEY,
    origen VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
    fotografia TEXT
);
/* 2025-03-10 16:34:26 [24 ms] */ 
CREATE TABLE Subespecies (
    id_subespecie SERIAL PRIMARY KEY,
    id_especie INT REFERENCES Especies(id_especie) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL
);
/* 2025-03-10 16:34:28 [16 ms] */ 
CREATE TABLE Zonas (
    id_zona SERIAL PRIMARY KEY,
    alcaldia VARCHAR(100),
    colonia VARCHAR(100),
    calle VARCHAR(255),
    numero VARCHAR(20),
    latitud DECIMAL(10,6),
    longitud DECIMAL(10,6)
);
/* 2025-03-10 16:34:40 [18 ms] */ 
CREATE TABLE Expertos (
    id_experto SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE SET NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100) UNIQUE
);
/* 2025-03-10 16:34:52 [19 ms] */ 
CREATE TABLE Arboles (
    id_arbol SERIAL PRIMARY KEY,
    id_especie INT REFERENCES Especies(id_especie) ON DELETE SET NULL,
    id_subespecie INT REFERENCES Subespecies(id_subespecie) ON DELETE SET NULL,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE SET NULL,
    grosor_tronco DECIMAL(5,2),
    altura DECIMAL(5,2),
    grosor_copa DECIMAL(5,2),
    angulo_inclinacion DECIMAL(5,2),
    estado_raices VARCHAR(20) CHECK (estado_raices IN ('Bueno', 'Regular', 'Malo')),
    estado_follaje VARCHAR(20) CHECK (estado_follaje IN ('Bueno', 'Regular', 'Malo')),
    ultima_inspeccion DATE DEFAULT CURRENT_DATE,
    fotografia TEXT,
    observaciones TEXT,
    id_experto INT REFERENCES Expertos(id_experto) ON DELETE SET NULL
);
/* 2025-03-10 16:34:55 [20 ms] */ 
CREATE TABLE HistorialInspecciones (
    id_inspeccion SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    fecha_inspeccion DATE DEFAULT CURRENT_DATE,
    estado_raices VARCHAR(20) CHECK (estado_raices IN ('Bueno', 'Regular', 'Malo')),
    estado_follaje VARCHAR(20) CHECK (estado_follaje IN ('Bueno', 'Regular', 'Malo')),
    observaciones TEXT,
    id_experto INT REFERENCES Expertos(id_experto) ON DELETE SET NULL
);
/* 2025-03-10 16:34:57 [25 ms] */ 
CREATE TABLE Ciudadanos (
    id_ciudadano SERIAL PRIMARY KEY,
    curp VARCHAR(18) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    direccion TEXT,
    correo VARCHAR(100) UNIQUE,
    telefono VARCHAR(20)
);
/* 2025-03-10 16:34:59 [26 ms] */ 
CREATE TABLE Tramites (
    id_tramite SERIAL PRIMARY KEY,
    id_ciudadano INT REFERENCES Ciudadanos(id_ciudadano) ON DELETE CASCADE,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    tipo VARCHAR(50) CHECK (tipo IN ('Derribo', 'Corte de raíz', 'Reporte de plaga', 'Reporte de poda', 'Reporte de riego', 'Riesgo de caída', 'Reporte de incendio')),
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estatus VARCHAR(50) CHECK (estatus IN ('Pendiente', 'En proceso', 'Completado', 'Rechazado')) DEFAULT 'Pendiente',
    evidencia TEXT
);
/* 2025-03-10 16:35:01 [20 ms] */ 
CREATE TABLE SeguimientoTramites (
    id_seguimiento SERIAL PRIMARY KEY,
    id_tramite INT REFERENCES Tramites(id_tramite) ON DELETE CASCADE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estatus VARCHAR(50) CHECK (estatus IN ('Pendiente', 'En proceso', 'Completado', 'Rechazado')),
    observaciones TEXT
);
/* 2025-03-10 16:35:02 [11 ms] */ 
CREATE TABLE Brigadas (
    id_brigada SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE SET NULL,
    telefono VARCHAR(20)
);
/* 2025-03-10 16:35:04 [19 ms] */ 
CREATE TABLE Mantenimientos (
    id_mantenimiento SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    tipo VARCHAR(50) CHECK (tipo IN ('Riego', 'Poda', 'Corte de raíz', 'Tratamiento de plagas', 'Otro')) NOT NULL,
    fecha DATE DEFAULT CURRENT_DATE,
    id_brigada INT REFERENCES Brigadas(id_brigada) ON DELETE SET NULL,
    observaciones TEXT
);
/* 2025-03-10 16:35:06 [17 ms] */ 
CREATE TABLE Reforestaciones (
    id_reforestacion SERIAL PRIMARY KEY,
    id_brigada INT REFERENCES Brigadas(id_brigada) ON DELETE SET NULL,
    id_especie INT REFERENCES Especies(id_especie) ON DELETE SET NULL,
    id_subespecie INT REFERENCES Subespecies(id_subespecie) ON DELETE SET NULL,
    fecha_plantacion DATE NOT NULL,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE SET NULL,
    responsable VARCHAR(255)
);
/* 2025-03-10 16:35:11 [18 ms] */ 
CREATE TABLE Plagas (
    id_plaga SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);
/* 2025-03-10 16:35:12 [17 ms] */ 
CREATE TABLE ArbolesPlagas (
    id_registro SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    id_plaga INT REFERENCES Plagas(id_plaga) ON DELETE CASCADE,
    fecha_detectada DATE DEFAULT CURRENT_DATE
);
/* 2025-03-10 16:35:14 [26 ms] */ 
CREATE TABLE Incendios (
    id_incendio SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    estado_despues VARCHAR(50),
    observaciones TEXT
);
/* 2025-03-10 16:35:16 [96 ms] */ 
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) CHECK (tipo_usuario IN ('Administrador', 'Brigada', 'Experto', 'Ciudadano')) NOT NULL,
    fotografia TEXT,
    correo VARCHAR(100) UNIQUE NOT NULL,
);
/* 2025-03-10 16:35:18 [18 ms] */ 
CREATE TABLE Auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    usuario VARCHAR(50),
    tabla_afectada VARCHAR(50),
    operacion VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT
);
/* 2025-03-10 16:36:08 [14 ms] */ 
CREATE OR REPLACE FUNCTION auditoria_arboles()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO Auditoria (usuario, tabla_afectada, operacion, detalle)
    VALUES (CURRENT_USER, 'Arboles', TG_OP, 'Arbol ID ' || OLD.id_arbol || ' modificado.');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
/* 2025-03-10 16:36:10 [8 ms] */ 
CREATE TRIGGER auditoria_arboles_trigger
AFTER UPDATE ON Arboles
FOR EACH ROW EXECUTE FUNCTION auditoria_arboles();
/* 2025-03-10 20:53:05 [101 ms] */ 
INSERT INTO Zonas (alcaldia, colonia) VALUES
('Álvaro Obregón', 'San Ángel'),
('Álvaro Obregón', 'Mixcoac'),
('Azcapotzalco', 'Clavería'),
('Azcapotzalco', 'San Álvaro'),
('Benito Juárez', 'Narvarte'),
('Benito Juárez', 'Del Valle'),
('Coyoacán', 'Centro de Coyoacán'),
('Coyoacán', 'Copilco'),
('Cuauhtémoc', 'Roma Norte'),
('Cuauhtémoc', 'Condesa'),
('Gustavo A. Madero', 'Lindavista'),
('Gustavo A. Madero', 'Vallejo'),
('Iztapalapa', 'Santa Martha Acatitla'),
('Iztapalapa', 'San Lorenzo Tezonco'),
('Tlalpan', 'Coapa'),
('Tlalpan', 'Ajusco'),
('Xochimilco', 'Centro Xochimilco'),
('Xochimilco', 'Nativitas');
/* 2025-03-10 22:44:55 [15 ms] */ 
INSERT INTO "expertos"("id_experto","id_zona","correo","nombre_completo","telefono") VALUES(1,1,'r@mail.com','prueba','00000000');