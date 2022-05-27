import { IItem } from '../Interfaces/IItem';
import { ICreateOrderModel } from '../Interfaces/ICreateOrderModel';
import { ICreateOrderItem } from '../Interfaces/ICreateOrderItem';
import { v4 as uuidv4 } from 'uuid';
import { http, HttpResponse } from './http';
import { IApiResponse } from '../Interfaces/IApiResponse';
import { IUserModel } from '../Interfaces/IUserModel';
import { IOrder } from '../Interfaces/IOrder';
import { ICompletedOrder } from '../Interfaces/ICompletedOrder';

export async function getOrders(): Promise<ICompletedOrder[]> {
  const result = await http<ICompletedOrder[]>({
    path: '/Order',
  });
  if (result && result.ok && result.body) {
    return result.body;
  }
  return [];
}
export async function readOrder(
  orderId: string,
): Promise<ICompletedOrder | null> {
  const result = await http<ICompletedOrder>({
    path: `/Order/ById/${orderId}`,
  });
  if (result && result.ok && result.body) {
    return result.body;
  }
  return null;
}

export async function updateOrder(
  order: ICompletedOrder,
  token: string,
): Promise<HttpResponse<IApiResponse | ICompletedOrder>> {
  const result = await http<IApiResponse | ICompletedOrder, ICompletedOrder>({
    path: '/Order',
    method: 'put',
    body: order,
    token: token,
  });
  return result;
}

export function createOrder(
  email: string,
  name: string,
  pin: number,
  ageRequired: number,
  items: IItem[],
): ICreateOrderModel | null {
  if (!email || !name || pin <= 0 || !items || items.length === 0) {
    return null;
  }
  const ret: ICreateOrderModel = {
    email: email,
    name: name,
    pin: pin,
    ageRequired: ageRequired <= 0 ? 0 : ageRequired,
    items: [],
  };
  items.forEach((x) => {
    const item: ICreateOrderItem = {
      id: uuidv4(),
      productId: x.product.id,
      quantity: x.quantity,
      price: x.price,
    };
    ret.items.push(item);
  });
  return ret;
}

export async function submitOrder(
  order: ICreateOrderModel,
  token: string,
): Promise<HttpResponse<IOrder | IApiResponse>> {
  const response = await http<IOrder | IApiResponse, ICreateOrderModel>({
    path: '/Order/Online',
    method: 'post',
    body: order,
    token: token,
  });
  return response;
}

export async function checkOut(
  order: ICreateOrderItem[],
  override: boolean,
  token: string,
  user?: IUserModel,
): Promise<HttpResponse<IApiResponse>> {
  const response = await http<IApiResponse, ICreateOrderItem[]>({
    path: !(override && user)
      ? '/Order/Checkout'
      : `/Order/Checkout/${user.identifier}`,
    method: 'post',
    body: order,
    token: token,
  });
  return response;
}

export async function deleteOrder(
  orderid: string,
  token: string,
): Promise<HttpResponse<IApiResponse>> {
  const response = await http<IApiResponse>({
    path: `/Order/${orderid}`,
    method: 'delete',
    token: token,
  });
  return response;
}
