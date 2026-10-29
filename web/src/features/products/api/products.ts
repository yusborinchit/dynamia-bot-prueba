import {
  type Product,
  type ProductBody,
  productListResponseSchema,
  productSchema,
} from '@wsp/contracts';
import { apiError } from '#/lib/api/api-error';
import { api } from '#/lib/api/client';

export async function listProducts(): Promise<Product[]> {
  return productListResponseSchema.parse(await api.get('products').json()).data;
}

export async function createProduct(body: ProductBody): Promise<Product> {
  try {
    return productSchema.parse(await api.post('products', { json: body }).json());
  } catch (error) {
    throw apiError(error, 'No pudimos crear el producto.');
  }
}

export async function updateProduct({
  id,
  body,
}: {
  id: number;
  body: ProductBody;
}): Promise<Product> {
  try {
    return productSchema.parse(await api.put(`products/${id}`, { json: body }).json());
  } catch (error) {
    throw apiError(error, 'No pudimos guardar el producto.');
  }
}

export async function deleteProduct(id: number): Promise<void> {
  try {
    await api.delete(`products/${id}`);
  } catch (error) {
    throw apiError(error, 'No pudimos borrar el producto.');
  }
}
