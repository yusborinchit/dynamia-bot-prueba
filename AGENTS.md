# prueba-wsp-bot

Lee un grupo de WhatsApp de compradores de verdura, arma los pedidos con IA y los deja en un
panel web para que una persona los revise, corrija y apruebe. Arranca como prueba, pero se
construye como si fuera a producto: las decisiones se toman pensando en que el salto a
producción no obligue a reescribir.

Monorepo con pnpm workspaces:

- `api/`: Node con Fastify. Proceso residente que mantiene la conexión con WhatsApp (Baileys),
  habla con el proveedor de IA y expone la API REST. Única fuente de lógica de negocio.
- `web/`: React SPA con Vite y TanStack Router; build estático, solo cliente.
- `packages/contracts/`: schemas Zod del contrato HTTP entre `api/` y `web/`. Los dos lados los
  importan; ninguno los redefine.

Leer también el `AGENTS.md` del subproyecto afectado. El contexto y las decisiones abiertas están
en [.agents/references/project-guide.md](.agents/references/project-guide.md); consultarlo antes de
cualquier cambio que toque hosting, la conexión con WhatsApp, la IA o el contrato API/web.

## Restricciones compartidas

- TypeScript estricto en los dos lados. La prioridad es la experiencia de desarrollo: preferir
  siempre la opción más type safe. Sin `any`; los datos externos se validan con Zod y los tipos
  se derivan de los schemas, no se escriben a mano en paralelo.
- Toda lógica de servidor vive en `api/`. El front nunca habla directo con WhatsApp ni con el
  proveedor de IA, y nunca recibe sus credenciales.
- API bajo `/api/v1`, JSON en ambas direcciones, fechas ISO 8601 UTC. Un único formato de error y
  de paginación para toda la API; no inventar variantes por endpoint.
- El contrato de cada endpoint (request y response) vive en `packages/contracts/`. La api lo usa
  para validar y el web para tipar y parsear. Un cambio de contrato se hace ahí y se corrige lo
  que deje de compilar en ambos lados, en el mismo cambio.
- Dependencias con pnpm desde la raíz del workspace. Nada de npm ni yarn.
- Secretos (`.env`, credenciales de IA, estado de sesión de WhatsApp) nunca se commitean ni se
  escriben en logs.
- Código, nombres, JSON, rutas y commits en inglés. Español solo para texto visible al usuario,
  incluidos los mensajes que el bot envía.
- Sin comentarios. El código se explica con nombres, tipos y funciones chicas. Se permiten solo
  directivas funcionales de herramientas (`biome-ignore`, `ts-expect-error`). Si algo necesita
  explicación, va en `.agents/references/project-guide.md`.
- Preferir el patrón ya establecido para casos análogos. Si el patrón no sirve, modificarlo de
  forma consistente en todos lados y actualizar estas instrucciones.

## Flujo y verificación

- Para features que cruzan ambos lados, fijar primero el contrato en `api/` y luego consumirlo en
  `web/`.
- El proyecto no tiene tests automatizados y no se agregan. Un cambio se da por terminado cuando
  se vio funcionar el flujo completo, no cuando compila.
- Ejecutar los linters, formatters y chequeos de tipos indicados por cada subproyecto.
- Commits convencionales con scope obligatorio `api`, `web` o `contracts`:
  `<tipo>(<scope>): <descripción>`.
  Tipos: `feat`, `fix`, `refactor`, `docs`, `chore`.
