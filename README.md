# Dashboard Template

## 📋 Descripción

Dashboard Template es una aplicación web desarrollada en **Angular 8** que proporciona una interfaz de administración completa con sistema de autenticación, gestión de productos y usuarios. El proyecto está diseñado como una plantilla reutilizable para crear dashboards administrativos.

> ⚠️ **NOTA**: Este proyecto se encuentra actualmente **en construcción** y está siendo desarrollado activamente. Algunas funcionalidades pueden estar incompletas o en desarrollo.

## 🚀 Tecnologías Utilizadas

- **Angular 8.2.5** - Framework principal
- **Angular Material 8.2.3** - Componentes de UI
- **Bootstrap 5.3.3** - Framework CSS
- **NgRx 8.6.1** - Gestión de estado
- **FontAwesome 6.7.2** - Iconos
- **JWT Decode 4.0.0** - Manejo de tokens JWT
- **RxJS 6.4.0** - Programación reactiva

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                    # Módulo de autenticación
│   │   ├── pages/login/         # Página de login
│   │   └── auth-routing.module.ts
│   ├── core/                    # Servicios y guards centrales
│   │   ├── guards/              # Guards de autenticación
│   │   ├── interceptors/        # Interceptores HTTP
│   │   └── services/            # Servicios principales
│   ├── dashboard/               # Módulo principal del dashboard
│   │   ├── pages/
│   │   │   ├── dashboard/       # Página principal
│   │   │   ├── products/        # Gestión de productos
│   │   │   └── users/           # Gestión de usuarios
│   │   └── dashboard-routing.module.ts
│   ├── pages/
│   │   └── not-found/           # Página 404
│   └── shared/                  # Componentes compartidos
│       └── modal-message/       # Componente modal
```

## 🛣️ Rutas de la Aplicación

### Rutas Principales
- **`/`** → Redirige a `/dashboard`
- **`/auth`** → Módulo de autenticación
- **`/dashboard`** → Módulo principal del dashboard (protegido)
- **`/404`** → Página de error 404
- **`/**`** → Redirige a `/404` (rutas inexistentes)

### Rutas del Dashboard (Protegidas por AuthGuard)
- **`/dashboard`** → Página principal del dashboard
- **`/dashboard/products`** → Lista de productos
- **`/dashboard/products/create`** → Crear nuevo producto
- **`/dashboard/products/edit/:id`** → Editar producto existente
- **`/dashboard/users`** → Gestión de usuarios

### Rutas de Autenticación
- **`/auth`** → Página de login

## 🔐 Sistema de Autenticación

### Funcionalidades
- **Login/Logout** - Autenticación de usuarios
- **Registro** - Creación de nuevas cuentas
- **Reset Password** - Recuperación de contraseñas
- **AuthGuard** - Protección de rutas
- **JWT Token** - Manejo de sesiones

### Servicios de Autenticación
- `AuthService` - Gestión de autenticación
- `AuthGuard` - Protección de rutas
- `HttpService` - Interceptor HTTP para tokens

## 📊 Funcionalidades del Dashboard

### Gestión de Productos
- **Listar productos** - Vista de todos los productos
- **Crear producto** - Formulario para nuevos productos
- **Editar producto** - Modificación de productos existentes
- **Eliminar producto** - Eliminación de productos

### Gestión de Usuarios
- **Listar usuarios** - Vista de todos los usuarios
- **Gestión de perfiles** - Información de usuarios

### Componentes Compartidos
- **Modal Message** - Componente modal reutilizable
- **Navbar** - Navegación principal
- **Sidebar** - Menú lateral del dashboard

## 🎨 Interfaz de Usuario

### Características
- **Diseño responsivo** con Bootstrap 5
- **Sidebar** con navegación lateral
- **Navbar** con menú de usuario
- **Iconos FontAwesome** para mejor UX
- **Componentes Material Design**

### Navegación
- **Menú lateral** con opciones principales
- **Breadcrumbs** para navegación
- **Enlaces activos** con indicadores visuales

## 🔧 Configuración del Entorno

### Variables de Entorno
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: "https://api-template-0avi.onrender.com/",
  //apiUrl: "http://127.0.0.1:3000",
};
```

### API Endpoints
- **Base URL**: `https://api-template-0avi.onrender.com/`
- **Login**: `POST /login`
- **Signup**: `POST /signup`
- **Reset Password**: `POST /reset-password`
- **User Profile**: `GET /user/profile`
- **Products**: `GET/POST/PUT/DELETE /products`

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js (versión compatible con Angular 8)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd dashboard-template

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start

# Construir para producción
npm run build

# Ejecutar tests
npm test

# Ejecutar linting
npm run lint
```

### Comandos Disponibles
- `npm start` - Servidor de desarrollo en `http://localhost:4200`
- `npm run build` - Construcción para producción
- `npm test` - Ejecutar tests unitarios
- `npm run e2e` - Tests end-to-end
- `npm run lint` - Análisis de código

## 🧪 Testing

El proyecto incluye:
- **Tests unitarios** con Jasmine y Karma
- **Tests e2e** con Protractor
- **Linting** con TSLint y Codelyzer

## 📦 Dependencias Principales

### Dependencias de Producción
- `@angular/*` - Framework Angular 8
- `@angular/material` - Componentes Material Design
- `@angular/cdk` - Component Development Kit
- `@ngrx/*` - Gestión de estado
- `bootstrap` - Framework CSS
- `fontawesome` - Iconos
- `jwt-decode` - Decodificación de tokens JWT

### Dependencias de Desarrollo
- `@angular/cli` - CLI de Angular
- `typescript` - Compilador TypeScript
- `jasmine` - Framework de testing
- `karma` - Test runner
- `protractor` - Testing e2e

## 🔒 Seguridad

- **AuthGuard** protege todas las rutas del dashboard
- **JWT Token** para autenticación
- **Interceptores HTTP** para manejo automático de tokens
- **Validación de rutas** con redirecciones seguras

## 📱 Características Técnicas

- **Lazy Loading** - Carga diferida de módulos
- **Route Guards** - Protección de rutas
- **HTTP Interceptors** - Manejo centralizado de requests
- **Reactive Forms** - Formularios reactivos
- **Observables** - Programación reactiva con RxJS
- **State Management** - Gestión de estado con NgRx

