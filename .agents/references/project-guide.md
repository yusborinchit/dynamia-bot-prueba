# prueba-wsp-bot — guía del proyecto

Contexto que no se deduce del código. Para las reglas del día a día, ver `AGENTS.md`.

## Qué es

El cliente vende verdura (y afines) a compradores que hacen sus pedidos en un grupo de WhatsApp.
Hoy una persona, a contraturno, lee todo el grupo y anota los pedidos a mano.

El objetivo: que el sistema lea el grupo, arme los pedidos con IA y que esa persona solo los
revise, corrija y apruebe en el panel web. La IA propone y la persona decide: ningún pedido
queda aprobado sin acción humana.

El sistema es independiente: no se integra con el sistema que el cliente usa hoy. El catálogo y
los pedidos aprobados viven acá.

Empieza como prueba, pero cada decisión se toma para que pasar a producto sea crecer, no
reescribir.

## Los dos problemas de fondo

1. **Volumen.** Muchos pedidos, concentrados en un pico de noche. Un pedido no es un mensaje: se
   arma con varios mensajes del mismo comprador ("una caja de tomates", "y una bolsa de papa",
   "no, mejor 4 de tomate"), mezclados con saludos, consultas y charla de otros.
2. **Lenguaje.** Escriben mal, abrevian y usan muchos nombres para el mismo producto ("tomate
   perita", "perita", "tom. p", "tomatito"), con unidades informales (cajón, bolsa, atado,
   docena, "medio").

## Cómo se resuelve

- **El bot solo escucha.** Es un número dedicado (no personal), miembro del grupo, que no
  escribe, no reacciona y no marca presencia. Menos actividad implica menos riesgo de baneo, y
  la recolección no necesita enviar nada.
- **Guardar todo en crudo.** Cada mensaje de texto del grupo se persiste tal como llegó, con
  autor, hora y mensaje citado (si es respuesta). Es la fuente de verdad y permite reprocesar.
- **Ventana con hora de corte.** Hay ventana todos los días. Durante la ventana solo se
  recolecta; no se llama a la IA. Al llegar la hora de corte se procesa todo junto, en lote. La
  hora de corte es configuración, no un valor fijo en el código.
- **Un texto por comprador.** Los mensajes de cada comprador dentro de la ventana se unen en
  orden cronológico en un solo texto, y la IA analiza ese texto entero de una vez. Así resuelve
  naturalmente correcciones y agregados ("una caja de tomates… no, mejor 4"). Una llamada por
  comprador, no por mensaje: el costo queda acotado y predecible. Si un mensaje cita a otro,
  se incluye el texto citado como contexto.
- **Catálogo propio con alias.** Productos y unidades se gestionan desde el panel, cada uno con
  su lista de alias. La IA recibe el catálogo y devuelve salida estructurada: id de producto
  del catálogo (o "no reconocido" con el texto original), cantidad, unidad y nivel de
  confianza. Nunca inventa productos fuera del catálogo.
- **El sistema aprende de las correcciones.** Cuando la persona corrige un producto mal
  reconocido, ese texto queda guardado como alias nuevo. Con el uso, cada vez hay menos que
  corregir.
- **Compradores por número.** Cada comprador se identifica por su número de WhatsApp. Se da de
  alta solo la primera vez que escribe, con el nombre que muestra WhatsApp, y desde el panel se
  le puede poner un nombre propio.
- **Lo que llega tarde, a la ventana siguiente.** Un mensaje posterior al corte entra en la
  ventana siguiente. Desde el panel se puede forzar el procesamiento de lo pendiente sin esperar
  al próximo corte.
- **Solo texto.** Audios, fotos y stickers no se procesan. Si un comprador mandó alguno dentro
  de la ventana, su pedido lo indica para que la persona lo revise a mano.
- **Trazabilidad.** Cada pedido muestra los mensajes originales al lado del borrador y resalta
  lo dudoso (productos no reconocidos, confianza baja).

## Stack

La prioridad es la experiencia de desarrollo: todo lo más type safe posible, de punta a punta.

- **TypeScript estricto** en `api/` y `web/`. Zod como única fuente de validación y de tipos de
  datos externos (requests, respuestas, salida de la IA, variables de entorno).
- **Back**: Node + Fastify con validación por Zod en las rutas.
- **Monorepo con pnpm workspaces**: `api/`, `web/` y `packages/contracts/`. Como los dos lados
  son TypeScript, el contrato HTTP se escribe una sola vez en Zod y lo importan ambos. En
  crm-uls y appcu el contrato estaba duplicado (Resource en Laravel y schema Zod en el front) y
  solo se detectaba un desfasaje en runtime; acá deja de compilar.
- **Base**: Postgres con Drizzle. En desarrollo se levanta con Docker Compose. Se eligió sobre
  MySQL porque con Drizzle da mejor experiencia (por ejemplo `.returning()` en inserts y
  updates) y es lo que ya se usa en kdet y tribu.
- **Deploy de la api**: VPS con Docker. La api tiene que poder construirse y correr como imagen,
  con su configuración solo por variables de entorno.
- **Deploy del front**: build estático en cPanel, como crm-uls y appcu. Front y api quedan en
  dominios distintos, así que hay CORS: la api tiene que permitir el origin del front.
- **Deploy de la prueba en Coolify**: para salir rápido, `docker-compose.prod.yml` levanta
  postgres, api y web (el mismo build estático servido por nginx desde `web/Dockerfile`) en el
  VPS, cada servicio con su subdominio. Toda la configuración se carga como variables en
  Coolify; `VITE_API_URL` se fija en el build del front, así que cambiarla obliga a redeployar
  `web`. Pasar el front a cPanel es sacar ese servicio, sin tocar código.
- **Sesión de WhatsApp en Postgres.** El estado de autenticación de Baileys (credenciales y
  llaves) se guarda en la base, no en archivos: así sobrevive a cada redeploy del contenedor
  y no hay que volver a escanear el QR. Re-vincular seguido es además una señal de riesgo de
  baneo.
- **Auth del panel**: email y contraseña, sin roles ni permisos por ahora; todo usuario logueado
  puede hacer todo. Sin registro público: los usuarios se crean desde la api (seed o comando).
  Como front y api están en dominios distintos, la sesión viaja como bearer token en el header
  `Authorization`, no con cookies (mismo motivo que Sanctum en modo token en crm-uls). Si más
  adelante hacen falta roles, se suman como en crm-uls/appcu.
- **Logs mínimos.** Sin auditoría ni registro de conversaciones (los mensajes ya están en la
  base). Solo lo necesario para saber si algo se rompió: errores, estado de la conexión con
  WhatsApp (conectado, desconectado, reconectando) y el resultado de cada procesamiento en lote.
- **Sin tests automatizados**, igual que crm-uls y appcu. La seguridad viene de los tipos
  (TypeScript estricto + contrato compartido) y de la verificación manual del flujo completo.
- **IA**: Vercel AI SDK (open source, gratis, sin depender de Vercel). Se busca el modelo más
  barato que reconozca bien texto informal contra un catálogo; DeepSeek es el primer candidato y
  la elección se valida con mensajes reales del grupo. La key de DeepSeek es la misma que usa el
  proyecto tarot-tiktok.

## Diferencias con crm-uls y appcu

El front sigue sus convenciones. El back no: no es Laravel ni va en cPanel. Necesita un proceso
Node siempre corriendo para sostener la conexión con WhatsApp, cosa que el hosting compartido no
permite.

## Por qué adaptadores para WhatsApp e IA

- **Baileys** usa el protocolo de WhatsApp Web; no es la API oficial. Es rápido para probar, pero
  conlleva riesgo de baneo del número y puede romperse con cambios de WhatsApp. Si el proyecto
  pasa a producto, puede tocar migrar a la WhatsApp Cloud API. Por eso Baileys queda encerrado
  en un solo módulo.
- **El modelo de IA** todavía no está elegido. El AI SDK unifica la API de todos los
  proveedores: probar otro es cambiar la configuración del modelo, sin tocar el dominio.

## Decisiones abiertas

Cuando se cierre una, pasarla a la sección correspondiente (acá o en el `AGENTS.md`) y borrarla
de esta lista.

- Modelo de IA definitivo (DeepSeek como primer candidato, a validar con mensajes reales).
- Paginación: el MVP no pagina (listados acotados); definirla cuando haga falta.
- Hora de corte concreta (por ahora es configurable y no está fijada).
- Concurrencia del procesamiento en lote: arranca en 5 compradores en paralelo
  (`AI_CONCURRENCY`); ajustar con el volumen real del pico nocturno.
- Corte automático por horario: en el MVP el procesamiento se dispara solo a mano.
