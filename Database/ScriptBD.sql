
-- 1. Crear la base de datos
--CREATE DATABASE PruebaTecnicaDB;
--GO

-- 2. Usar esa base de datos 
USE PruebaTecnicaDB;
GO

--Creando tablas ahora 
-- 1. Tabla Principal: CLIENTES
CREATE TABLE Clientes (
    ClienteId INT IDENTITY(1,1) PRIMARY KEY,
    NombreCliente VARCHAR(100) NOT NULL,
    Direccion VARCHAR(200),
    Pais VARCHAR(50),
    Identificador VARCHAR(20) NOT NULL, -- NIT o DPI
    FechaCreacion DATETIME DEFAULT GETDATE(),
    TelefonoPrincipal VARCHAR(20),
    CorreoElectronico VARCHAR(100)
);

-- 2.Como dice que un cliente puede tener varias personas asociuadas, se parte en dos.
CREATE TABLE Contactos (
    ContactoId INT IDENTITY(1,1) PRIMARY KEY,
    ClienteId INT NOT NULL, -- llave fk
    NombreContacto VARCHAR(100),
    Puesto VARCHAR(50),
    TelefonoContacto VARCHAR(20),
    EmailContacto VARCHAR(100),
    FOREIGN KEY (ClienteId) REFERENCES Clientes(ClienteId)
);

-- Insertamos un cliente de prueba con un contacto
INSERT INTO Clientes (NombreCliente, Direccion, Pais, Identificador, TelefonoPrincipal, CorreoElectronico)
VALUES ('Diego Tak', 'Muxbal, Guatemala', 'Guatemala', '123456-7', '1234-5678', 'diego@tak.com');


-- Asignamos un contacto a ese cliente
INSERT INTO Contactos (ClienteId, NombreContacto, Puesto, TelefonoContacto, EmailContacto)
VALUES (1, 'Juan Tak', 'Gerente', '4444-4444', 'juan@tak.com');


select * from Clientes

select * from Contactos