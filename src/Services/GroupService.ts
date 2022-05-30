import { http, HttpResponse } from './http';
import { IGroup } from '../Interfaces/IGroup';
import { IApiResponse } from '../Interfaces/IApiResponse';
import { ICompleteGroup } from '../Interfaces/ICompleteGroup';

export async function getGroups(token: string): Promise<IGroup[]> {
  const response = await http<IGroup[]>({
    path: '/Group',
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

export async function getCompleteGroups(
  token: string,
): Promise<ICompleteGroup[]> {
  const response = await http<ICompleteGroup[]>({
    path: '/Group/Groups',
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

export async function getGroupNames(token: string): Promise<string[]> {
  const response = await http<string[]>({
    path: '/Group/Names',
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

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
  id: string,
  groupName: string,
  token: string,
): Promise<HttpResponse<IGroup | IApiResponse>> {
  const response = await http<IGroup | IApiResponse>({
    path: `/Group/Add/${groupName}/${id}`,
    method: 'post',
    token: token,
  });
  return response;
}
