# Admin Dashboard - Gestión de Órdenes

Proyecto base de un Admin Dashboard construido con React + TypeScript + Vite.

## 🏗️ Arquitectura

El proyecto sigue una arquitectura por features con capas claras:

```
src/
├── app/                    # Configuración de la aplicación
│   ├── App.tsx            # Componente raíz
│   ├── router.tsx         # Configuración de rutas
│   └── providers/         # Providers globales
│       ├── queryClient.ts # TanStack Query
│       └── i18n.ts        # i18next
│
├── shared/                 # Código compartido
│   ├── components/        # Componentes reutilizables
│   │   ├── ui/           # Componentes UI base (Shadcn)
│   │   ├── layout/       # Componentes de layout
│   │   ├── data-display/ # Componentes de visualización
│   │   └── feedback/     # Componentes de feedback
│   ├── hooks/            # Hooks compartidos
│   ├── utils/            # Utilidades
│   ├── constants/        # Constantes
│   └── types/            # Tipos compartidos
│
├── features/              # Features del dominio
│   ├── auth/             # Autenticación
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── store/        # Zustand store
│   │   ├── validators/   # Zod schemas
│   │   └── types/
│   ├── dashboard/
│   ├── users/
│   ├── roles/
│   ├── reports/
│   └── settings/
│
├── assets/                # Assets estáticos
└── styles/                # Estilos globales
    └── index.css         # Tailwind CSS
```

## 🛠️ Stack Tecnológico

- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **TanStack Query** - Gestión de estado del servidor
- **Zustand** - Gestión de estado del cliente
- **React Router** - Enrutamiento
- **React Hook Form + Zod** - Formularios y validación
- **Tailwind CSS** - Estilos
- **Shadcn UI** - Componentes UI
- **i18next** - Internacionalización

## 📦 Instalación

```bash
npm install
```

## 🚀 Desarrollo

```bash
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 📝 Configuración

### Aliases

El proyecto usa aliases `@/` para imports:

```typescript
import { cn } from '@/shared/utils'
import { useAuthStore } from '@/features/auth/store'
```

### TypeScript

TypeScript está configurado en modo estricto. No se permite el uso de `any`.

### Tailwind CSS

Tailwind está configurado con las variables CSS de Shadcn UI. Los estilos se encuentran en `src/styles/index.css`.

### Shadcn UI

Shadcn UI está configurado. Para agregar componentes:

```bash
npx shadcn@latest add [component-name]
```

Los componentes se agregarán en `src/shared/components/ui/`.

## 📋 Próximos Pasos

Este es un proyecto base sin vistas implementadas. Las siguientes tareas están pendientes:

- [ ] Crear componentes UI base
- [ ] Implementar vistas de autenticación
- [ ] Implementar dashboard
- [ ] Implementar gestión de usuarios
- [ ] Implementar gestión de roles
- [ ] Implementar reportes
- [ ] Implementar configuración

## 📄 Licencia

Privado
