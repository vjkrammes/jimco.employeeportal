import { http } from './http';
import { IApiResponse, SUCCESS } from '../Interfaces/IApiResponse';

export async function setLineItemStatus(
  lineitemid: string,
  status: number,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/LineItem/Status/${lineitemid}/${status}`,
    method: 'put',
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  if (response && response.ok) {
    return SUCCESS;
  }
  return {
    code: response.code ?? 0,
    message: `Unexpected status code (${response.code ?? 0}) returned`,
    messages: [],
  };
}

export async function deleteLineItem(
  lineitemid: string,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/LineItem/${lineitemid}`,
    method: 'delete',
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  if (response && response.ok) {
    return SUCCESS;
  }
  return {
    code: response.code ?? 0,
    message: `Unexpected status code (${response.code ?? 0}) returned`,
    messages: [],
  };
}
