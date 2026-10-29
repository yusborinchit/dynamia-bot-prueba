# prueba-wsp-bot / contracts

Schemas Zod del contrato HTTP entre `api/` y `web/`. Hereda `../../AGENTS.md`.

- Solo schemas Zod y los tipos derivados con `z.infer`. Sin lógica, sin acceso a datos, sin
  dependencias de Fastify, Drizzle ni React: tiene que poder importarse desde los dos lados.
- Un archivo por recurso, con el schema de cada request (params, query, body) y de cada response.
- Los nombres de campo son los del JSON (`snake_case`), tal cual viajan.
- Los mensajes de validación visibles al usuario van en español.
- Cambiar un schema acá es cambiar el contrato: corregir en el mismo cambio todo lo que deje de
  compilar en `api/` y `web/`.
