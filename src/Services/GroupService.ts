import { http, HttpResponse } from './http';
import { IGroup } from '../Interfaces/IGroup';
import { IApiResponse, SUCCESS } from '../Interfaces/IApiResponse';
import { ICompleteGroup } from '../Interfaces/ICompleteGroup';
import { IUpdateGroupResult } from '../Interfaces/IUpdateGroupResult';
import { IUpdateGroupModel } from '../Interfaces/IUpdateGroupModel';

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

export async function deleteGroup(
  name: string,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/Group/Delete/${name}`,
    method: 'delete',
    token: token,
  });
  if (response && !response.ok && response.body) {
    return response.body;
  }
  if (response && response.ok) {
    return SUCCESS;
  }
  return {
    code: 1,
    message: `Unexpected Error Occurred (${response?.code || 0})`,
    messages: [],
  };
}

export async function renameGroup(
  name: string,
  newname: string,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse>({
    path: `/Group/Rename/${name}/${newname}`,
    method: 'put',
    token: token,
  });
  if (response && !response.ok && response.body) {
    return response.body;
  }
  if (response && response.ok) {
    return SUCCESS;
  }
  return {
    code: 1,
    message: `Unexpected Error Occurred (${response?.code || 0})`,
    messages: [],
  };
}

export async function updateGroup(
  groupname: string,
  added: string[],
  removed: string[],
  token: string,
): Promise<IUpdateGroupResult[]> {
  const body: IUpdateGroupModel = {
    name: groupname,
    added: [...added],
    removed: [...removed],
  };
  const response = await http<IUpdateGroupResult[], IUpdateGroupModel>({
    path: '/Group/Update',
    method: 'put',
    body: body,
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}
