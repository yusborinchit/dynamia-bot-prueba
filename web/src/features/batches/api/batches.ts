import {
  type Batch,
  batchListResponseSchema,
  batchSchema,
  type PendingResponse,
  pendingResponseSchema,
} from '@wsp/contracts';
import { apiError } from '#/lib/api/api-error';
import { api } from '#/lib/api/client';

export async function listBatches(): Promise<Batch[]> {
  return batchListResponseSchema.parse(await api.get('batches').json()).data;
}

export async function getPending(): Promise<PendingResponse> {
  return pendingResponseSchema.parse(await api.get('batches/pending').json());
}

export async function createBatch(): Promise<Batch> {
  try {
    return batchSchema.parse(await api.post('batches').json());
  } catch (error) {
    throw apiError(error, 'No pudimos iniciar el procesamiento.');
  }
}
