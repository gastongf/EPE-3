# Partticipantes: Erich Armijo, Gaston Gonzalez, Claudio Sepulveda, Miguel Quiñones, Miguel Duran, Miguel Ibañez.

# VetSystem - Sistema de Gestión Veterinaria Multi-Sucursal

Sistema de gestión para clínicas veterinarias con soporte multi-sucursal (multi-tenant), desarrollado con **Django REST Framework** (backend) y **Angular 18** (frontend).

---

## Tecnologías

### Backend
| Paquete | Versión | Propósito |
|---|---|---|
| Django | 5.0.x | Framework web |
| djangorestframework | 3.15.x | API REST |
| djangorestframework-simplejwt | 5.3.x | Autenticación JWT |
| django-cors-headers | 4.3.x | CORS para desarrollo Angular |
| drf-spectacular | 0.27.x | Documentación OpenAPI / Swagger |
| psycopg2-binary | 2.9.x | Driver PostgreSQL |
| python-decouple | 3.8.x | Variables de entorno |

### Frontend
| Paquete | Versión | Propósito |
|---|---|---|
| Angular | 18.x | SPA Framework |
| Angular Material | 18.x | Componentes Material Design |
| RxJS | 7.8.x | Programación reactiva |

### Infraestructura
- **Python 3.12** (imagen Docker base)
- **PostgreSQL 16** (Docker)
- **pgAdmin4** (UI gestión BD, puerto 5050)
- **Docker Compose** (3 servicios: db, backend, pgadmin)

---

## Estructura del Proyecto

```
vet-system/
├── backend/                          # Django REST API
│   ├── config/                       # Configuración Django (settings, urls, wsgi)
│   ├── apps/                         # Apps de negocio
│   │   ├── sucursales/               # Sucursales (tenants)
│   │   ├── doctores/                 # Doctores veterinarios
│   │   ├── tutores/                  # Dueños de mascotas
│   │   ├── pacientes/                # Pacientes (mascotas)
│   │   ├── fichas_medicas/           # Fichas médicas
│   │   ├── citas/                    # Agenda de citas
│   │   ├── facturacion/              # Facturación
│   │   └── notificaciones/           # Notificaciones (email, whatsapp, llamada)
│   ├── users/                        # Modelo User personalizado + auth
│   ├── core/                         # Código compartido (TenantMixin, middleware)
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── entrypoint.sh                 # Script de inicio (migraciones + seed)
│   ├── init_db.py                    # Datos de prueba (seed)
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                         # Angular 18 SPA
    └── src/
        └── app/
            ├── core/                 # Servicios (auth, api, guard, interceptor)
            ├── features/             # Componentes por página
            │   ├── login/
            │   ├── dashboard/
            │   ├── sucursales/
            │   ├── usuarios/
            │   ├── doctores/
            │   ├── tutores/
            │   ├── pacientes/
            │   ├── historial-clinico/
            │   ├── agenda/
            │   ├── facturacion/
            │   └── microchip/
            └── shared/               # Interfaces TypeScript (models.ts)
```

---

## Cómo Ejecutar el Proyecto

### Requisitos
- Docker y Docker Compose
- Node.js 18+ (para frontend)
- Angular CLI 18 (`npm install -g @angular/cli`)

### 1. Levantar Backend + Base de Datos

```bash
cd vet-system/backend
docker-compose up --build
```

Esto inicia:
- **db**: PostgreSQL 16 en `localhost:5432`
- **backend**: Django en `http://localhost:8000`
- **pgadmin**: Interfaz de BD en `http://localhost:5050`

El script `entrypoint.sh` ejecuta automáticamente:
1. Espera a que PostgreSQL esté listo
2. Corre `makemigrations` y `migrate` para todas las apps
3. Ejecuta `init_db.py` para cargar datos de prueba

### 2. Levantar Frontend

```bash
cd vet-system/frontend
npm install
npm start
```

Frontend disponible en `http://localhost:4200`. Las peticiones a `/api` se proxyfían a `localhost:8000`.

---

## Roles y Permisos

| Rol | Visibilidad | Crear | Editar | Eliminar |
|---|---|---|---|---|
| **superadmin** | Todo (todas las sucursales) | Todo | Todo | Todo |
| **admin** | Solo su sucursal | Usuarios, doctores, tutores, pacientes, citas, facturas | Usuarios, doctores, pacientes, citas, facturas | Recursos de su sucursal |
| **doctor** | Solo su sucursal | Fichas médicas, citas | Fichas médicas, citas | Ninguno |
| **asistente** | Solo su sucursal | Ninguno (solo lectura) | Ninguno | Ninguno |

---

## Credenciales

### Usuarios de la Aplicación

| Usuario | Contraseña | Rol | Sucursal |
|---|---|---|---|
| `superadmin` | `super123` | superadmin | Global |
| `admin` | `admin123` | admin | Providencia |
| `dr.perez` | `doc123` | doctor | Providencia |
| `dra.lopez` | `doc123` | doctor | Vitacura |
| `asistente` | `asist123` | asistente | Providencia |

### Base de Datos

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `vetdb` |
| Usuario | `vetuser` |
| Contraseña | `vetpass` |

### pgAdmin

| Campo | Valor |
|---|---|
| URL | `http://localhost:5050` |
| Email | `admin@vetadmin.com` |
| Contraseña | `admin123` |

---

## Datos Semilla (Seed)

### Sucursales
1. **Veterinaria Los Andes Principal** - Providencia
2. **Veterinaria Los Andes Vitacura** - Vitacura

### Doctores
| Doctor | Especialidad | Sucursal |
|---|---|---|
| Dr. Carlos Perez | Medicina General | Providencia |
| Dra. Maria Lopez | Cirugía Veterinaria | Vitacura |

### Tutores (dueños)
| Nombre | RUT |
|---|---|
| Juan Gonzalez | 11.111.111-1 |
| Ana Silva | 22.222.222-2 |

### Pacientes (mascotas)
| Nombre | Especie | Raza | Tutor | Sucursal |
|---|---|---|---|---|
| Firulais | Perro | Labrador | Juan Gonzalez | Providencia |
| Mishi | Gato | Siames | Juan Gonzalez | Providencia |
| Rocky | Perro | Pastor Aleman | Ana Silva | Vitacura |

---

## Endpoints API

### Autenticación (`/api/auth/`)

| Método | URL | Descripción |
|---|---|---|
| POST | `/api/auth/login/` | Iniciar sesión (devuelve JWT access + refresh) |
| GET | `/api/auth/me/` | Obtener usuario autenticado actual |
| GET/POST | `/api/auth/usuarios/` | Listar / Crear usuarios |
| GET/PUT/PATCH/DELETE | `/api/auth/usuarios/{id}/` | Detalle / Editar / Eliminar usuario |

### Recursos CRUD (todos usan ViewSets REST estándar)

| Prefijo | App |
|---|---|
| `/api/sucursales/` | Sucursales |
| `/api/doctores/` | Doctores |
| `/api/tutores/` | Tutores |
| `/api/pacientes/` | Pacientes |
| `/api/fichas-medicas/` | Fichas médicas |
| `/api/citas/` | Citas |
| `/api/facturas/` | Facturas |
| `/api/notificaciones/` | Notificaciones |

Cada recurso soporta: `GET /` (listar), `POST /` (crear), `GET /{id}/` (detalle), `PUT /{id}/` (actualizar), `PATCH /{id}/` (parcial), `DELETE /{id}/` (eliminar).

### Endpoints especiales

| Método | URL | Descripción |
|---|---|---|
| GET | `/api/pacientes/buscar-microchip/?chip=XXX` | Buscar mascota por microchip |
| POST | `/api/pacientes/{id}/enviar-codigo/` | Enviar código de autorización al tutor |
| POST | `/api/pacientes/{id}/verificar-codigo/` | Verificar código para acceso cruzado |
| GET | `/api/fichas-medicas/acceso/{codigo}/` | Acceso público a ficha médica (sin login) |

### Filtros por query string
- **Citas**: `?fecha=YYYY-MM-DD`, `?doctor=UUID`, `?estado=estado`
- **Tutores**: `?rut=search_string`
- **Fichas Médicas**: `?mascota=UUID`

### Documentación Swagger
Disponible en `http://localhost:8000/api/docs/` cuando el backend está corriendo.

---

## Rutas del Frontend

| Ruta | Componente | Acceso |
|---|---|---|
| `/login` | Login | Público |
| `/dashboard` | Dashboard con tarjetas de estadísticas | Autenticado |
| `/sucursales` | CRUD de sucursales | superadmin |
| `/usuarios` | Gestión de usuarios | superadmin |
| `/doctores` | CRUD de doctores | superadmin / admin |
| `/tutores` | CRUD de tutores | Todos menos asistente |
| `/pacientes` | CRUD de pacientes + búsqueda microchip | Todos |
| `/historial-clinico` | Fichas médicas por paciente | Autenticado |
| `/historial-clinico/:mascotaId` | Historial de paciente específico | Autenticado |
| `/agenda` | Calendario de citas | Todos menos asistente |
| `/facturacion` | CRUD facturas con cálculo de IVA | superadmin / admin |
| `/microchip` | Búsqueda rápida por microchip | Autenticado |
| `/acceso-historial/:codigo` | Acceso público a ficha médica | Público |

---

## Arquitectura Multi-Tenant

El sistema aísla los datos por sucursal mediante:

1. **TenantMiddleware** (`core/mixins.py`): Extrae `X-Tenant-ID` del header o usa `request.user.sucursal`.
2. **TenantMixin**: Mixin abstracto que agrega FK a Sucursal y la auto-completa al guardar.
3. **Filtrado por vista**: Cada ViewSet filtra datos según el rol:
   - `superadmin` ve todo
   - Otros roles ven solo los datos de su sucursal

### Acceso Cruzado de Pacientes
Cuando un doctor necesita ver un paciente de otra sucursal:
1. Hace clic en "Autorizar" sobre el paciente bloqueado
2. El sistema envía un código de 6 dígitos al email del tutor
3. El tutor entrega el código, se ingresa en el formulario de verificación
4. Al verificar, el paciente queda visible para todas las sucursales

---

## Variables de Entorno (docker-compose.yml)

| Variable | Valor por defecto |
|---|---|
| `SECRET_KEY` | `django-insecure-vet-system-dev-key-change-in-production` |
| `DEBUG` | `True` |
| `DB_NAME` | `vetdb` |
| `DB_USER` | `vetuser` |
| `DB_PASSWORD` | `vetpass` |
| `DB_HOST` | `db` (nombre del servicio Docker) |
| `DB_PORT` | `5432` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USE_TLS` | `True` |

---

## Notas

- Todos los IDs primarios son **UUID**, excepto User que usa `BigAutoField`.
- Paginación global: **20 items por página**.
- JWT: access token expira en **1 día**, refresh token en **7 días**.
- Timezone: **America/Santiago**, idioma: **es-cl**.
- No hay tests implementados actualmente.
