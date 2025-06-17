/* Especies y subespecies 🎄 */
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
    descripcion TEXT,
    fotografia TEXT
);

CREATE TABLE Especies (
    id_especie SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    id_forma_hoja INT REFERENCES DescripcionesFormaHoja(id_forma_hoja) ON DELETE SET NULL,
    id_forma_flor INT REFERENCES DescripcionesFormaFlor(id_forma_flor) ON DELETE SET NULL,
    id_origen INT REFERENCES DescripcionesOrigen(id_origen) ON DELETE SET NULL,
    fotografia TEXT,
    descripcion TEXT
);

CREATE TABLE Subespecies (
    id_subespecie SERIAL PRIMARY KEY,
    id_especie INT REFERENCES Especies(id_especie) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL
);


/* actores: Usuarios, Brigadas, Expertos, Ciudadanos 😊 */
-- Tipos de Usuario
CREATE TABLE TiposUsuario (
    id_tipo SERIAL PRIMARY KEY,
    tipo VARCHAR(50) UNIQUE NOT NULL
);

-- Usuarios generales
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL, -- Alias exclusivo para plataforma
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    curp VARCHAR(18) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    id_tipo INT REFERENCES TiposUsuario(id_tipo) ON DELETE SET NULL,
    fotografia TEXT
);

/* Zonas y Localización 🗺️ */
-- Zonas
CREATE TABLE Zonas (
    id_zona SERIAL PRIMARY KEY,
    alcaldia VARCHAR(100),
    colonia VARCHAR(100),
    calle VARCHAR(255),
    numero VARCHAR(20),
    codigo_postal INT CHECK (codigo_postal >= 00000 AND codigo_postal <= 99999),
    latitud DECIMAL(10,6),
    longitud DECIMAL(10,6)
);

-- Brigadas
CREATE TABLE Brigadas (
    id_brigada SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Brigadas Zonas (multivalor: brigada puede tener varias zonas)
CREATE TABLE BrigadasZonas (
    id_brigada_zona SERIAL PRIMARY KEY,
    id_brigada INT REFERENCES Brigadas(id_brigada) ON DELETE CASCADE,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE CASCADE
);

-- Brigadistas (integrantes de brigadas)
CREATE TABLE Brigadistas (
    id_brigadista SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_brigada INT REFERENCES Brigadas(id_brigada) ON DELETE SET NULL,
    salario DECIMAL(10,2),
    antiguedad INT, -- años de servicio
    en_servicio BOOLEAN DEFAULT TRUE
);

-- Expertos
CREATE TABLE Expertos (
    id_experto SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    salario DECIMAL(10,2)
);

-- Expertos Zonas (multivalor)
CREATE TABLE ExpertosZonas (
    id_experto_zona SERIAL PRIMARY KEY,
    id_experto INT REFERENCES Expertos(id_experto) ON DELETE CASCADE,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE CASCADE
);

-- Niveles de Educación 🏫 
CREATE TABLE NivelesEducacion (
    id_nivel SERIAL PRIMARY KEY,
    nombre_nivel VARCHAR(100) NOT NULL
);

-- Educación de Expertos (multivalor)
CREATE TABLE ExpertosEducacion (
    id_experto_educacion SERIAL PRIMARY KEY,
    id_experto INT REFERENCES Expertos(id_experto) ON DELETE CASCADE,
    id_nivel INT REFERENCES NivelesEducacion(id_nivel) ON DELETE CASCADE
);

-- Ciudadanos
CREATE TABLE Ciudadanos (
    id_ciudadano SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

/* Árboles 🌳 y seguimientos */
-- Árboles
CREATE TABLE Arboles (
    id_arbol INT PRIMARY KEY,
    id_especie INT REFERENCES Especies(id_especie) ON DELETE SET NULL,
    id_subespecie INT REFERENCES Subespecies(id_subespecie) ON DELETE SET NULL,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE SET NULL,
    grosor_tronco DECIMAL(5,2),
    altura DECIMAL(5,2),
    grosor_copa DECIMAL(5,2),
    ultima_inspeccion DATE DEFAULT CURRENT_DATE,
    observaciones TEXT
);


-- Niveles de Muérdago
CREATE TABLE NivelesMuérdago (
    id_nivel SERIAL PRIMARY KEY,
    nivel VARCHAR(10) NOT NULL, -- Ejemplo: I, II, III, IV, V
    descripcion_porcentaje TEXT,
    categoria TEXT
);

-- Seguimiento detallado de estado del árbol
CREATE TABLE SeguimientoArbol (
    id_seguimiento SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    fecha_seguimiento DATE DEFAULT CURRENT_DATE,
    estado_raices VARCHAR(20) CHECK (estado_raices IN ('Bueno', 'Regular', 'Malo')),
    estado_copa VARCHAR(20) CHECK (estado_copa IN ('Bueno', 'Regular', 'Malo')),
    inclinacion DECIMAL(5,2),
    id_nivel_muérdago INT REFERENCES NivelesMuérdago(id_nivel) ON DELETE SET NULL,
    plaga_detectada BOOLEAN DEFAULT FALSE,
    descripcion_general TEXT,
    tratamiento_recomendado TEXT
);

/*Plagas y mantenimiento ⛑ */
-- Plagas
CREATE TABLE Plagas (
    id_plaga SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Plagas Árboles (relación muchos a muchos)
CREATE TABLE ArbolesPlagas (
    id_registro SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    id_plaga INT REFERENCES Plagas(id_plaga) ON DELETE CASCADE,
    fecha_detectada DATE DEFAULT CURRENT_DATE
);
-- mantenimiento de árboles
CREATE TABLE Mantenimientos (
    id_mantenimiento SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    tipo_intervencion VARCHAR(50), -- Ej: poda, derribo, etc.
    tipo_detalle VARCHAR(100),     -- Ej: LIMPIEZA DE COPA, Banqueo, etc.
    causa_detalle VARCHAR(150),    -- Ej: RIESGO, Reubicación para Aprovechamiento, etc.
    fecha DATE DEFAULT CURRENT_DATE,
    descripcion TEXT,
    responsable TEXT,
    observaciones TEXT,

    -- Campos condicionales según tipo de intervención
    destino_material TEXT,          -- solo si tipo_intervencion = 'derribo'
    ubicacion_original TEXT,        -- solo si tipo_intervencion = 'trasplante'
    nueva_ubicacion TEXT,           -- solo si tipo_intervencion = 'trasplante'
    exito_trasplante VARCHAR(20),   -- solo si tipo_intervencion = 'trasplante'

    -- Fotografías
    foto_antes TEXT,
    foto_despues TEXT,

    -- Metadatos
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Reforestaciones 🌱
CREATE TABLE Reforestaciones (
    id_reforestacion SERIAL PRIMARY KEY,
    id_brigada INT REFERENCES Brigadas(id_brigada) ON DELETE SET NULL,
    id_especie INT REFERENCES Especies(id_especie) ON DELETE SET NULL,
    id_subespecie INT REFERENCES Subespecies(id_subespecie) ON DELETE SET NULL,
    fecha_plantacion DATE NOT NULL,
    id_zona INT REFERENCES Zonas(id_zona) ON DELETE SET NULL,
    responsable VARCHAR(255)
);
-- Incendios 🔥
CREATE TABLE Incendios (
    id_incendio SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    fecha DATE DEFAULT CURRENT_DATE,
    estado_despues VARCHAR(50),
    observaciones TEXT
);
/* Tramites y auditoría 📜 */
CREATE TABLE Tramites (
    id_tramite SERIAL PRIMARY KEY,
    id_ciudadano INT REFERENCES Ciudadanos(id_ciudadano) ON DELETE CASCADE,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    tipo VARCHAR(50) CHECK (tipo IN ('Derribo', 'Corte de raíz', 'Reporte de plaga', 'Reporte de poda', 'Reporte de riego', 'Riesgo de caída', 'Reporte de incendio')),
    fecha_solicitud DATE DEFAULT CURRENT_DATE,
    estatus VARCHAR(50) CHECK (estatus IN ('Pendiente', 'En proceso', 'Completado', 'Rechazado')) DEFAULT 'Pendiente',
    evidencia TEXT
);

CREATE TABLE SeguimientoTramites (
    id_seguimiento_tramite SERIAL PRIMARY KEY,
    id_tramite INT REFERENCES Tramites(id_tramite) ON DELETE CASCADE,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estatus VARCHAR(50) CHECK (estatus IN ('Pendiente', 'En proceso', 'Completado', 'Rechazado')),
    observaciones TEXT
);

CREATE TABLE Auditoria (
    id_auditoria SERIAL PRIMARY KEY,
    usuario VARCHAR(50),
    tabla_afectada VARCHAR(50),
    operacion VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detalle TEXT
);
-- Fotografias del arbol
CREATE TABLE fotos_arbol (
    id_foto SERIAL PRIMARY KEY,
    id_arbol INT REFERENCES Arboles(id_arbol) ON DELETE CASCADE,
    imagen BYTEA NOT NULL,
    descripcion TEXT,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
