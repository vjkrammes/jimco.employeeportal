import { http, HttpResponse } from './http';
import { ICategory } from '../Interfaces/ICategory';
import { IApiResponse } from '../Interfaces/IApiResponse';

export async function getCategories(): Promise<ICategory[]> {
  const response = await http<ICategory[]>({
    path: '/Category',
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

export async function readCategory(id: string): Promise<ICategory | null> {
  const response = await http<ICategory | null>({
    path: `/Category/ById/${id}`,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return null;
}

export async function updateCategory(
  category: ICategory,
  token: string,
): Promise<HttpResponse<ICategory | IApiResponse>> {
  const response = await http<ICategory | IApiResponse, ICategory>({
    path: '/Category',
    method: 'put',
    body: category,
    token: token,
  });
  return response;
}

export async function createCategory(
  category: ICategory,
  token: string,
): Promise<HttpResponse<ICategory | IApiResponse>> {
  const response = await http<ICategory | IApiResponse, ICategory>({
    path: '/Category',
    method: 'post',
    body: category,
    token: token,
  });
  return response;
}

export async function deleteCategory(
  category: ICategory,
  token: string,
): Promise<HttpResponse<undefined | IApiResponse>> {
  const response = await http<undefined>({
    path: `/Category/Delete/${category.id}`,
    method: 'delete',
    token: token,
  });
  return response;
}
