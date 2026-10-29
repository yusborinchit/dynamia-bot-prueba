import { createDeepSeek } from '@ai-sdk/deepseek';
import type { LanguageModel } from 'ai';
import { env } from '#/config/env';

globalThis.AI_SDK_LOG_WARNINGS = false;

const deepSeek = createDeepSeek({ apiKey: env.DEEPSEEK_API_KEY });

export function createExtractionModel(modelId: string = env.AI_MODEL): LanguageModel {
  return deepSeek(modelId);
}

export const extractionModel = createExtractionModel();
