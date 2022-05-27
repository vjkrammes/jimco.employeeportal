import { http, HttpResponse } from './http';
import { IPromotion } from '../Interfaces/IPromotion';
import { IApiResponse, SUCCESS } from '../Interfaces/IApiResponse';

export async function getPromotions(productId: string): Promise<IPromotion[]> {
  if (productId) {
    const response = await http<IPromotion[]>({
      path: `/Promotion/ForProduct/${productId}`,
    });
    if (response && response.body) {
      return response.body;
    }
  }
  return [];
}

export async function createPromotion(
  promotion: IPromotion,
  token: string,
): Promise<HttpResponse<IPromotion | IApiResponse>> {
  const response = await http<IPromotion | IApiResponse, IPromotion>({
    path: '/Promotion',
    method: 'post',
    body: promotion,
    token: token,
  });
  return response;
}

export async function updatePromotion(
  promotion: IPromotion,
  token: string,
): Promise<HttpResponse<IPromotion | IApiResponse>> {
  const response = await http<IPromotion | IApiResponse, IPromotion>({
    path: '/Promotion',
    method: 'put',
    body: promotion,
    token: token,
  });
  return response;
}

export async function cancelPromotion(
  promotionId: string,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/Promotion/Cancel/${promotionId}`,
    method: 'put',
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  return { code: response.code || 0, message: '', messages: [] };
}

export async function unCancelPromotion(
  promotionId: string,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/Promotion/UnCancel/${promotionId}`,
    method: 'put',
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  return { code: response.code || 0, message: '', messages: [] };
}

export async function deletePromotion(
  promotionId: string,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/Promotion/${promotionId}`,
    method: 'delete',
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  return { code: response.code || 0, message: '', messages: [] };
}

export async function deleteAllExpiredPromotions(
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: '/Promotion/DeleteAllExpired',
    method: 'delete',
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  return { code: response.code || 0, message: '', messages: [] };
}

export async function deleteExpiredPromotions(
  productId: string,
  token: string,
): Promise<IApiResponse> {
  if (productId) {
    const response = await http<IApiResponse>({
      path: `/Promotion/DeleteExpired/${productId}`,
      method: 'delete',
      token: token,
    });
    if (response && response.body) {
      return response.body;
    }
    return SUCCESS;
  }
  return { code: 1, message: 'Invalid product id', messages: [] };
}
