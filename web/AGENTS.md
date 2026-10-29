# prueba-wsp-bot / web

SPA React servida como archivos estáticos desde un cPanel, en un dominio distinto al de la api. Hereda `../AGENTS.md`. Sigue las convenciones de front
de los proyectos de `~/dev/dynamia` (crm-uls, appcu).

## Arquitectura y organización

- Vite + TanStack Router, no TanStack Start. Sin SSR, server functions, server routes ni runtime
  Node en producción.
- Todo acceso al backend pasa por `src/lib/api/client.ts`, funciones de `api/`, schemas Zod y
  TanStack Query.
- Features en `src/features/<feature>/` con carpetas por responsabilidad. Lo compartido sin dueño
  de feature vive en `src/lib/` o `src/components/`.
- No importar en profundidad desde otro feature; usar su barrel público.
- Primitivos de `src/components/ui/` usan named exports; los componentes de aplicación usan
  default export.
- Imports absolutos con `#/`. Archivos y carpetas en kebab-case.
- `type` siempre, nunca `interface`. Sin `console.*` y sin `useEffect` salvo necesidad real.
- Estado de búsqueda, filtros, orden, página y vista vive en search params de la URL.
- `routeTree.gen.ts` es generado: regenerar, no editar a mano.

## Datos, forms y UI

- Cada endpoint tiene función `api/` y `queryOptions`/mutation. La función `api/` parsea la
  respuesta con el schema de `packages/contracts`; el web no define schemas propios de respuesta.
  No llamar `api/` directo desde forms o componentes.
- Forms con TanStack Form, schema fuera del componente y errores inline.
- Prohibido interpolar clases Tailwind; usar mapa estático, `cva`/`cn` o `data-*`.
- Tokens semánticos de color y foco visible accesible. Sin dark mode: un solo tema claro.
- Dependencias con `^x.y.z`; no usar `latest`.

## Comandos

```bash
pnpm dev         # http://localhost:5173, contra VITE_API_URL (web/.env)
pnpm build       # dist/ estático para subir al cPanel (incluye .htaccess para el routing)
pnpm typecheck
```

Desde la raíz: `pnpm check` / `pnpm format` (Biome).

## Estética

Propia, distinta de crm-uls: se reutilizan los primitivos de `components/ui` y la estructura de
tokens de `styles.css`, pero no su look.

- Figtree como tipografía. Neutros con un leve tinte verde y verde como `primary` (y `ring`).
- Redondeo moderado: botones, inputs, pickers, popovers, tooltips, ítems de navegación o listas y
  bloques internos `rounded-md`; tarjetas, tablas y diálogos `rounded-lg`; tarjetas sueltas de
  página completa (login, error) `rounded-xl`. Solo badges de estado, chips y puntos de estado van
  `rounded-full`.
- Profundidad con sombras suaves además de bordes: `shadow-xs` en tarjetas, tablas, inputs y
  botones con fondo; `shadow-lg`/`shadow-xl` en popovers, toasts y diálogos.
- Estado activo/seleccionado con `bg-accent text-accent-foreground` (verde suave).

## Verificación

- No agregar tests automatizados.
- Ejecutar typecheck y lint según el cambio.
- Probar el flujo en el navegador contra la API, incluyendo estados de error, consola y red.
