import { confidenceSchema, unitSchema } from '@wsp/contracts';
import { generateText, type LanguageModel, Output } from 'ai';
import { z } from 'zod';
import { env } from '#/config/env';
import {
  buildPrompt,
  type CatalogEntry,
  type ConversationLine,
  EXTRACTION_INSTRUCTIONS,
} from './prompt';

const extractionSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.number().int().nullable(),
      raw_text: z.string(),
      quantity: z.number().positive(),
      unit: unitSchema,
      confidence: confidenceSchema,
    }),
  ),
});

export type ExtractedItem = z.infer<typeof extractionSchema>['items'][number];

export async function extractOrder(input: {
  model: LanguageModel;
  catalog: CatalogEntry[];
  lines: ConversationLine[];
}): Promise<ExtractedItem[]> {
  const { output } = await generateText({
    model: input.model,
    instructions: EXTRACTION_INSTRUCTIONS,
    prompt: buildPrompt(input.catalog, input.lines),
    output: Output.object({ schema: extractionSchema }),
    reasoning: env.AI_REASONING,
    timeout: 120_000,
  });

  const knownIds = new Set(input.catalog.map((entry) => entry.id));
  return output.items.map((item) => ({
    ...item,
    product_id: item.product_id !== null && knownIds.has(item.product_id) ? item.product_id : null,
  }));
}
