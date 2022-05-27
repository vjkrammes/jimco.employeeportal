import { http, HttpResponse } from './http';
import { IGroup } from '../Interfaces/IGroup';
import { IApiResponse } from '../Interfaces/IApiResponse';

export async function readGroup(
  name: string,
  token: string,
): Promise<HttpResponse<IGroup | IApiResponse> | null> {
  if (!name) {
    return null;
  }
  const response = await http<IGroup | IApiResponse>({
    path: `/Group/Byname/${name}`,
    token: token,
  });
  return response;
}

export async function addUserToGroup(
  identifier: string,
  groupName: string,
  token: string,
): Promise<HttpResponse<IGroup | IApiResponse>> {
  const response = await http<IGroup | IApiResponse>({
    path: `/Group/Add/${groupName}/${identifier}`,
    method: 'post',
    token: token,
  });
  return response;
}
