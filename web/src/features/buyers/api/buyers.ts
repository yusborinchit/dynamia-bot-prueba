import {
  type Buyer,
  type BuyerUpdateBody,
  buyerListResponseSchema,
  buyerSchema,
} from '@wsp/contracts';
import { apiError } from '#/lib/api/api-error';
import { api } from '#/lib/api/client';

export async function listBuyers(): Promise<Buyer[]> {
  return buyerListResponseSchema.parse(await api.get('buyers').json()).data;
}

export async function updateBuyer({
  id,
  body,
}: {
  id: number;
  body: BuyerUpdateBody;
}): Promise<Buyer> {
  try {
    return buyerSchema.parse(await api.patch(`buyers/${id}`, { json: body }).json());
  } catch (error) {
    throw apiError(error, 'No pudimos guardar el comprador.');
  }
}
