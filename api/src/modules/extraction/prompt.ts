import type { Unit } from '@wsp/contracts';

export type CatalogEntry = { id: number; name: string; aliases: string[] };

export type ConversationLine = { time: string; body: string; quoted: string | null };

const UNIT_LABELS: Record<Unit, string> = {
  crate: 'cajón / caja',
  bag: 'bolsa',
  kg: 'kilo',
  unit: 'unidad',
  bunch: 'atado',
  dozen: 'docena',
};

export const EXTRACTION_INSTRUCTIONS = `Sos un asistente que arma pedidos de una verdulería mayorista a partir de los mensajes que un comprador escribió en un grupo de WhatsApp.

Reglas:
- Leé todos los mensajes del comprador como una sola conversación, en orden. Si corrige o cambia algo ("no, mejor 4", "sacá las papas", "agregale 2 más"), el pedido final refleja la última intención.
- Ignorá saludos, consultas de precio, charla y todo lo que no sea un pedido.
- Un mensaje puede citar otro mensaje (marcado como "cita"). La cita suele ser de OTRA persona y es solo contexto: nunca agregues productos que aparecen únicamente en la cita. La única excepción es que el comprador diga explícitamente que quiere lo mismo ("yo igual", "lo mismo para mí").
- Cada producto pedido es un ítem. Usá el id del catálogo que corresponda. Los compradores escriben mal, abrevian y usan apodos: buscá el producto por nombre, alias o parecido.
- Si un producto no está en el catálogo o no estás seguro de cuál es, usá product_id null. Nunca inventes ids.
- raw_text es cómo el comprador nombró el producto, sin cantidad ni unidad (por ejemplo "tomate perita", "papa negra").
- quantity es un número (medio = 0.5). Si no dice cantidad, usá 1.
- unit es la unidad pedida. Si no la dice, usá la más razonable para ese producto en una verdulería mayorista (normalmente cajón).
- confidence: high si el producto, la cantidad y la unidad son claros; medium si tuviste que suponer algo; low si es muy dudoso.
- Si no hay ningún pedido en los mensajes, devolvé items vacío.`;

export function buildPrompt(catalog: CatalogEntry[], lines: ConversationLine[]): string {
  const catalogText = catalog
    .map((entry) =>
      entry.aliases.length > 0
        ? `${entry.id}: ${entry.name} (también: ${entry.aliases.join(', ')})`
        : `${entry.id}: ${entry.name}`,
    )
    .join('\n');

  const unitsText = Object.entries(UNIT_LABELS)
    .map(([unit, label]) => `${unit}: ${label}`)
    .join('\n');

  const conversation = lines
    .map((line) =>
      line.quoted
        ? `[${line.time}] ${line.body}\n    (cita, solo contexto: "${line.quoted}")`
        : `[${line.time}] ${line.body}`,
    )
    .join('\n');

  return `Catálogo (id: nombre):
${catalogText || '(vacío)'}

Unidades (valor: significado):
${unitsText}

Mensajes del comprador:
${conversation}`;
}
