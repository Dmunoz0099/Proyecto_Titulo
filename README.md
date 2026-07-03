# Plataforma de Apoyo al Cuidado de Adultos Mayores (CuidaMayor)

Plataforma web fullstack para apoyar el cuidado de adultos mayores con deterioro
cognitivo. Permite gestionar **medicamentos y tomas**, la **agenda diaria**,
**alertas SOS** ("Necesito ayuda"), **juegos de estimulación cognitiva** con
seguimiento del progreso, y **recordatorios** para el paciente.

Proyecto de título. Pensado con foco en **accesibilidad** para personas mayores
(tipografía grande, alto contraste, botones grandes y navegación simple).

> 📖 La explicación detallada del código y su funcionamiento está en
> [`explicación.md`](./explicación.md).

---

## 🧱 Stack tecnológico

| Capa            | Tecnología                                  |
| --------------- | ------------------------------------------- |
| Frontend        | React + Vite, React Router, Axios           |
| Backend         | Node.js + Express (ES Modules)              |
| Base de datos   | Supabase (PostgreSQL)                       |
| ORM             | Prisma                                       |
| Autenticación   | JWT + bcryptjs                              |
| Validación      | Zod                                          |
| Gestor paquetes | **pnpm**                                     |

---

## 👥 Roles de la plataforma

Cada rol tiene **acciones propias**, no solo más o menos permisos:

| Rol          | Qué puede hacer |
| ------------ | --------------- |
| **PACIENTE** | Vista simple y accesible. Botón **SOS "Necesito ayuda"** (exclusivo), campana de recordatorios, marcar sus tomas, jugar Memorice. |
| **CUIDADOR** | Único que **gestiona**: crea/edita/elimina medicamentos y eventos de agenda. Ve y atiende alertas SOS (panel del inicio + campana de notificaciones). Puede jugar y ve el seguimiento. |
| **FAMILIAR** | **Monitorea** a distancia: consulta medicamentos, agenda y progreso. Ve y atiende alertas SOS (panel del inicio + campana de notificaciones). No gestiona ni juega. |

El inicio de sesión es por **nombre de usuario** (no email), pensado para adultos
mayores que pueden no tener o no recordar un correo. El email es opcional.

---

## ✨ Funcionalidades

- **Autenticación completa**: registro, login y perfil con JWT; rutas protegidas por
  rol tanto en el backend como en el frontend.
- **Inicio diferenciado por rol**: el paciente ve su botón SOS y módulos simples;
  cuidador/familiar ven el panel de alertas y la gestión. Incluye un "vistazo de
  hoy" con la próxima toma y la siguiente actividad.
- **Medicamentos**: CRUD (solo cuidador), registro de tomas con historial de quién y
  cuándo, y borrado lógico para no perder el historial.
- **Agenda diaria**: rutina del día ordenada por hora, con iconos; gestión solo del
  cuidador.
- **Alertas SOS**: el paciente pide ayuda con un botón grande; el cuidador/familiar
  las ven (pendientes primero) y las marcan como atendidas.
- **Juegos — Memorice**: juego de parejas con emojis por temas (frutas, autos,
  objetos, variado) y 3 niveles, sin presión de tiempo. La victoria solo se declara
  cuando la última carta está dada vuelta, y el modal aparece un instante después
  para verla girar. Cada partida se guarda como sesión y alimenta la pantalla de
  **Seguimiento** (progreso partida a partida).
- **Campana de recordatorios** (paciente): avisa de tomas olvidadas (hora pasada sin
  registro) y actividades recientes; permite resolver la toma o avisar al cuidador.
- **Centro de notificaciones** (cuidador y familiar): campana en la barra superior
  con las alertas SOS pendientes del adulto mayor; se atienden desde cualquier
  pantalla, sin volver al inicio.

---

## 📁 Estructura del monorepo

```
Proyecto_Titulo/
├── explicación.md           # Explicación detallada del código y su funcionamiento
├── client/                  # Frontend (React + Vite) — puerto 8099
│   └── src/
│       ├── api/             # Capa Axios (única que habla con el backend)
│       ├── components/
│       │   ├── ui/          # Componentes reutilizables (Icon, Logo)
│       │   └── layout/      # AppBar (barra superior + campana)
│       ├── features/        # agenda, alertas, juegos, medicamentos, recordatorios
│       ├── context/         # AuthContext (sesión global)
│       ├── hooks/           # useAuth
│       ├── pages/           # Login, Registro, Inicio
│       ├── routes/          # AppRoutes + RutaProtegida (por rol)
│       ├── styles/          # Paleta (variables CSS) y estilos CuidaMayor
│       └── utils/           # Utilidades del frontend
│
└── server/                  # Backend (Express + Prisma) — puerto 4000
    ├── prisma/
    │   ├── schema.prisma         # Modelo de datos de Prisma
    │   ├── supabase_schema.sql   # DDL para ejecutar en Supabase
    │   └── seed.js               # Datos de prueba (idempotente)
    └── src/
        ├── config/          # config.js (env) y prisma.js (cliente singleton)
        ├── controllers/     # Reciben req/res y llaman a servicios
        ├── services/        # Lógica de negocio + acceso a datos (Prisma)
        ├── routes/          # Endpoints (auth, medicamentos, agenda, alertas, juegos)
        ├── middlewares/     # autenticar (JWT), autorizar (rol), validar (Zod), errores
        ├── validators/      # Esquemas Zod por módulo
        ├── utils/           # crearError, jwt
        ├── app.js           # Configura Express (CORS, JSON, /api/health)
        └── server.js        # Levanta el servidor y conecta a la BD
```

---

## 🔌 API (resumen)

Todos los endpoints bajo `/api`. 🔒 = requiere token JWT; entre paréntesis, roles
permitidos.

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| GET    | `/health` | Health check |
| POST   | `/auth/registro` | Crear cuenta |
| POST   | `/auth/login` | Iniciar sesión |
| GET    | `/auth/perfil` | 🔒 Perfil del usuario autenticado |
| GET    | `/medicamentos` | 🔒 Medicamentos activos |
| POST   | `/medicamentos` | 🔒 (CUIDADOR) Crear |
| PUT    | `/medicamentos/:id` | 🔒 (CUIDADOR) Actualizar |
| DELETE | `/medicamentos/:id` | 🔒 (CUIDADOR) Borrado lógico |
| POST   | `/medicamentos/:id/tomas` | 🔒 Registrar toma |
| GET    | `/medicamentos/:id/tomas` | 🔒 Historial de un medicamento |
| GET    | `/medicamentos/tomas` | 🔒 Todas las tomas del adulto mayor |
| GET    | `/agenda` | 🔒 Eventos del día (por hora) |
| POST   | `/agenda` | 🔒 (CUIDADOR) Crear evento |
| PUT    | `/agenda/:id` | 🔒 (CUIDADOR) Actualizar evento |
| DELETE | `/agenda/:id` | 🔒 (CUIDADOR) Eliminar evento |
| POST   | `/alertas` | 🔒 (PACIENTE) Crear alerta SOS |
| GET    | `/alertas` | 🔒 (CUIDADOR, FAMILIAR) Listar alertas |
| POST   | `/alertas/:id/atender` | 🔒 (CUIDADOR, FAMILIAR) Atender alerta |
| POST   | `/juegos/sesiones` | 🔒 (PACIENTE, CUIDADOR) Guardar partida |
| GET    | `/juegos/sesiones` | 🔒 Historial de partidas |

---

## ✅ Requisitos previos

- **Node.js** 18 o superior.
- **pnpm** instalado globalmente. Si no lo tienes:
  ```bash
  npm install -g pnpm
  ```
- Una cuenta gratuita en **[Supabase](https://supabase.com)**.

---

## 🗄️ 1) Crear el proyecto en Supabase y obtener la `DATABASE_URL`

1. Entra a [supabase.com](https://supabase.com) e inicia sesión.
2. Pulsa **"New project"**, elige un nombre, una **contraseña de base de datos**
   (guárdala) y una región cercana.
3. Espera a que el proyecto termine de aprovisionarse (1–2 minutos).
4. Ve a **Project Settings → Database → Connection string** y selecciona la pestaña
   **"URI"** (o **"Connection pooling"**). Allí encontrarás:
   - **Connection pooling** (puerto **6543**) → la usaremos como `DATABASE_URL`
     (añadiendo `?pgbouncer=true`). Es la conexión de la app.
   - **Direct connection** (puerto **5432**) → la usaremos como `DIRECT_URL`
     (necesaria para las migraciones de Prisma).
5. Copia esas cadenas y reemplaza `[PASSWORD]` por tu contraseña real.

> Las cadenas tienen este aspecto:
> ```
> postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
> postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres
> ```

### Configurar variables de entorno del backend

```bash
# Dentro de la carpeta server/
cp .env.example .env       # En Windows PowerShell: copy .env.example .env
```

Edita `server/.env` y pega tus `DATABASE_URL` y `DIRECT_URL` reales. Define también
un `JWT_SECRET` largo y aleatorio.

### Configurar variables de entorno del frontend

```bash
# Dentro de la carpeta client/
cp .env.example .env       # En Windows PowerShell: copy .env.example .env
```

---

## 🏗️ 2) Crear las tablas en la base de datos

Tienes **dos opciones equivalentes** (elige una):

### Opción A — Ejecutar el SQL en Supabase

1. En el panel de Supabase ve a **SQL Editor → New query**.
2. Abre el archivo `server/prisma/supabase_schema.sql`, copia todo su contenido y
   pégalo en el editor.
3. Pulsa **"Run"**. Esto crea los enums, las tablas, las claves foráneas y los índices.
4. Para que Prisma reconozca esas tablas ya creadas, genera el cliente:
   ```bash
   cd server
   pnpm prisma:generate
   ```

### Opción B — Usar migraciones de Prisma

```bash
cd server
pnpm prisma migrate dev --name init
```

Esto lee `schema.prisma`, crea las tablas en Supabase y genera el cliente.

> Nota: ambas opciones producen las mismas tablas y relaciones. El SQL define un
> `DEFAULT gen_random_uuid()` a nivel de base de datos; Prisma, en cambio, genera el
> UUID desde la aplicación. Ambos enfoques funcionan correctamente.

---

## 🚀 3) Instalar dependencias y levantar el proyecto

> Hay que instalar dependencias en **cada** carpeta (`server` y `client`).

### Backend

```bash
cd server
pnpm install        # instala dependencias
pnpm dev            # arranca el servidor con recarga automática (nodemon)
```

Deberías ver en consola:
```
✅ Conexión establecida con la base de datos (Supabase/PostgreSQL)
🚀 Servidor escuchando en http://localhost:4000
```

### Frontend (en otra terminal)

```bash
cd client
pnpm install        # instala dependencias
pnpm dev            # arranca Vite en http://localhost:8099
```

> El frontend usa el **proxy de Vite**: las peticiones a `/api` se reenvían
> automáticamente a `http://localhost:4000` (sin problemas de CORS en desarrollo).

### Datos de prueba (seed)

```bash
cd server
pnpm seed
```

Crea un adulto mayor (Luis Zapata) con medicamentos y agenda, y estos usuarios
(contraseña `123456` para todos):

| Usuario  | Rol      |
| -------- | -------- |
| `luis`   | PACIENTE |
| `milena` | CUIDADOR |
| `diego`  | FAMILIAR |

> El seed es idempotente: **borra todos los datos existentes** y los vuelve a crear.

---

## 🔍 4) Verificar que todo funciona

### Verificar el backend (`/api/health`)

- En el navegador abre: <http://localhost:4000/api/health>
- O por terminal:
  ```bash
  curl http://localhost:4000/api/health
  ```
- Respuesta esperada:
  ```json
  {
    "estado": "ok",
    "mensaje": "El servidor está funcionando correctamente",
    "entorno": "development",
    "timestamp": "2026-06-11T12:00:00.000Z"
  }
  ```

### Verificar el frontend

- Abre <http://localhost:8099>.
- Inicia sesión con uno de los usuarios del seed (p. ej. `milena` / `123456`) y
  deberías ver la página de inicio según el rol.

---

## 📜 Scripts disponibles

### Backend (`server/`)
| Comando               | Descripción                                  |
| --------------------- | -------------------------------------------- |
| `pnpm dev`            | Servidor en modo desarrollo (nodemon).       |
| `pnpm start`          | Servidor en modo producción.                 |
| `pnpm seed`           | Pobla la BD con datos de prueba.             |
| `pnpm prisma:generate`| Genera el cliente de Prisma.                 |
| `pnpm prisma:migrate` | Crea/aplica migraciones.                     |

### Frontend (`client/`)
| Comando         | Descripción                          |
| --------------- | ------------------------------------ |
| `pnpm dev`      | Servidor de desarrollo (Vite).       |
| `pnpm build`    | Compila para producción.             |
| `pnpm preview`  | Previsualiza el build de producción. |
