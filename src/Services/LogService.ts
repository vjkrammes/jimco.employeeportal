import { IApiResponse, SUCCESS } from '../Interfaces/IApiResponse';
import { ILogModel } from '../Interfaces/ILogModel';
import { http } from './http';

export async function log(
  level: number,
  source: string,
  description: string,
  item: any,
): Promise<IApiResponse> {
  const model: ILogModel = {
    id: '',
    timestamp: new Date(),
    level: level,
    ip: '',
    identifier: '',
    source: source,
    description: description,
    data: JSON.stringify(item),
  };
  const response = await http<IApiResponse, ILogModel>({
    path: '/Log',
    method: 'post',
    body: model,
  });
  if (response && response.ok) {
    return SUCCESS;
  }
  return response.body
    ? response.body
    : {
        code: response.code ?? 0,
        message: `Error ${response.code ?? 0}`,
        messages: [],
      };
}

export async function dates(token: string) {
  const response = await http<Date[]>({
    path: '/Log/Dates',
    token: token,
  });
  if (response && response.ok) {
    return response.body;
  }
  return [];
}

export async function get(token: string) {
  const response = await http<ILogModel[]>({
    path: '/Log',
    token: token,
  });
  if (response && response.ok) {
    return response.body;
  }
  return [];
}

export async function getForDate(date: Date, level: number, token: string) {
  const response = await http<ILogModel[]>({
    path: `/Log/${date.toISOString()}/${level}`,
    token: token,
  });
  if (response && response.body) {
    return response.body;
  }
  return [];
}
