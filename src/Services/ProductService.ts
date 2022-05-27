import { http, HttpResponse } from './http';
import { IProduct } from '../Interfaces/IProduct';
import { IApiResponse, SUCCESS } from '../Interfaces/IApiResponse';

export async function getProductById(id: string): Promise<IProduct | null> {
  if (id) {
    const response = await http<IProduct | null>({
      path: `/Product/ById/${id}`,
    });
    if (response && response.ok && response.body) {
      return response.body;
    }
  }
  return null;
}

export async function getProductBySku(sku: string): Promise<IProduct | null> {
  if (sku) {
    const response = await http<IProduct | null>({
      path: `/Product/BySky/${sku}`,
    });
    if (response && response.ok && response.body) {
      return response.body;
    }
  }
  return null;
}

export async function getProducts(categoryId?: string): Promise<IProduct[]> {
  const uri = categoryId ? `/Product/ForCategory/${categoryId}` : '/Product';
  const response = await http<IProduct[]>({
    path: uri,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

export async function searchProduct(
  categoryId: string,
  searchText: string,
): Promise<IProduct[]> {
  let response: HttpResponse<IProduct[]>;
  if (!categoryId || categoryId === '0') {
    response = await http<IProduct[]>({
      path: `/Product/Search/${searchText}`,
    });
  } else {
    response = await http<IProduct[]>({
      path: `/Product/Search/${categoryId}/${searchText}`,
    });
  }
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

export async function createProduct(
  product: IProduct,
  token: string,
): Promise<HttpResponse<IProduct | IApiResponse>> {
  const response = await http<IProduct | IApiResponse, IProduct>({
    path: '/Product',
    method: 'post',
    body: product,
    token: token,
  });
  return response;
}

export async function updateProduct(
  product: IProduct,
  token: string,
): Promise<HttpResponse<IProduct | IApiResponse>> {
  const response = await http<IProduct | IApiResponse, IProduct>({
    path: '/Product',
    method: 'put',
    body: product,
    token: token,
  });
  return response;
}

export async function deleteProduct(
  product: IProduct,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/Delete/${product.id}`,
    method: 'delete',
    token: token,
  });
  if (response && !response.ok) {
    if (response.body) {
      return response.body;
    }
    return {
      code: 0,
      message: `An unexpected error occurred (${response.code || 0})`,
      messages: [],
    };
  }
  return SUCCESS;
}
