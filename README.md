#  Sistema de Gestión de Clientes - Prueba Técnica

Este repositorio contiene la solución para el reto técnico (Opción B), implementando una aplicación Full Stack para la gestión de clientes corporativos y sus contactos, incluyendo autenticación JWT y dashboard protegido.

##  Stack Tecnológico

**Base de Datos:**
* Microsoft SQL Server
* Diseño Relacional (1:N)

**Backend:**
* .NET 8.0 (ASP.NET Core Web API)
* Entity Framework Core (Code First approach logic)
* JWT (JSON Web Tokens) para seguridad
* Swagger UI

**Frontend:**
Con el frontend lo realice yo manualmente y se puede observar con 
```bash
git checkout 9cff3c31c69d585c8ba635bce9aaa65bd290cd92
```
Sin embargo como tenia tiempo aun me ayude de Lovable para que me ayudara a definir una interfaz mas bonita y adaptada a la empresa Coorporacion tak. 

En `evidencia/EnFrontend` se puede observar mi interfaz y en `evidencia/NuevaInterfaz` se observa la refactorizada.

---

##  Requisitos Cumplidos

### Técnicos
- [x] **Estructura:** Solución dividida en Backend (.NET) y Frontend (React).
- [x] **Seguridad:** Implementación de Token JWT con expiración (10 min).
- [x] **UI/UX:** Uso de Framework de diseño (Bootstrap/Custom) y diseño responsivo.
- [x] **Versionamiento:** Git flow utilizado para el desarrollo.

### Funcionales
- [x] **Base de Datos:** Tablas `Clientes` y `Contactos` con integridad referencial.
- [x] **CRUD Maestro-Detalle:** Creación y edición de Clientes junto con sus Contactos en un mismo formulario.
- [x] **Validaciones:** Reglas de negocio para correos, teléfonos y campos obligatorios (Regex).
- [x] **Endpoints Auth:** Generación y Validación de Token.
- [x] **Endpoint GetByID:** Búsqueda específica de clientes.
- [x] **Dashboard Protegido:** Vista "Reportes Confidenciales" accesible solo con Token válido.

---

##  Guía de Instalación y Ejecución

Sigue estos pasos para levantar el proyecto en tu entorno local.

### 1. Base de Datos 
1.  Abre **SQL Server Management Studio (SSMS)**.
2.  Crea una base de datos llamada `PruebaTecnicaDB`.
3.  Ejecuta el script ubicado en `/Database/ScriptDB.sql` para generar las tablas y datos semilla.

### 2. Backend (.NET API) 
1.  Navega a la carpeta del backend:
    ```bash
    cd Backend/BackendApi
    ```
2.  Abre el archivo `appsettings.json` y verifica que la `CadenaSQL` apunte a tu servidor local.
    ```json
    "ConnectionStrings": {
      "CadenaSQL": "Server=.;Database=PruebaTecnicaDB;Trusted_Connection=True;TrustServerCertificate=True;"
    }
    ```
3.  Ejecuta la aplicación:
    ```bash
    dotnet run
    ```
    *El backend iniciará (usualmente en `https://localhost:7282` o similar).*

### 3. Frontend (React App) 
1.  Abre una nueva terminal y navega a la carpeta del frontend:
    ```bash
    cd Frontend/sistema-clientes
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Ejecuta el servidor de desarrollo:
    ```bash
    npm run dev
    ```
4.  Abre tu navegador en la URL que te indique (ej. `http://localhost:8080`).

---

##  Uso de la Aplicación

1.  **Gestión de Clientes (Público):**
    * Puedes ver, crear, editar y eliminar clientes libremente.
    * Usa el botón **"Nuevo Cliente"** para probar el formulario Maestro-Detalle.
    * Usa el buscador por ID para filtrar registros específicos.

2.  **Reportes Confidenciales (Privado):**
    * Ve a la pestaña "Reportes". Verás un bloqueo de acceso.
    * Haz clic en **"Simular Login"** o **"Generar Token"** en la barra superior.
    * El sistema obtendrá un JWT válido por 10 minutos.
    * Ahora tendrás acceso al Dashboard Ejecutivo con datos sensibles traídos del servidor.

---

##  Capturas de Pantalla

*(Las capturas de pantalla se encuentran en la carpeta `/evidencias` del repositorio)*

---

## 👤 Autor

Desarrollado por **Diego Linares** como parte del proceso de selección para **Corporación TAK**.