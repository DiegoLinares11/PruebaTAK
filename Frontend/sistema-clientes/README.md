### Frontend — Prueba Técnica Corporación TAK

Este proyecto corresponde al frontend del sistema de gestión de clientes desarrollado como parte de la prueba técnica para Corporación TAK.

Este se refactorizo ya que tenia tiempo entonces me ayude de lovable para hacer un frontend mejor. Para ver la version hecha por mi a manita se puede retroceder un commit :)

Está construido con:

React + TypeScript

Vite

Tailwind CSS

shadcn/ui

Axios para comunicación con la API

### Requisitos previos

Asegúrate de tener instalado:

* Node.js (versión recomendada: 18+)

* npm (incluido con Node)

Puedes verificarlo con:
```bash
node -v
npm -v

```
### Instalación y ejecución

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/DiegoLinares11/PruebaTAK
cd frontend/sistema-clientes
npm install
```
Inicia el servidor de desarrollo:

```bash
npm run dev
```

El proyecto quedará disponible en:
```bash
http://localhost:8080
```

### Conexión con el backend

El frontend consume la API .NET que expone los endpoints:

```
https://localhost:7282/api/Clientes
https://localhost:7282/api/Auth
```
Asegúrate de:

1. Tener la API corriendo.

2. Actualizar las constantes URL_API y URL_AUTH en el componente que lo requiera.

