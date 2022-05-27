import { http, HttpResponse } from './http';
import { IUserModel } from '../Interfaces/IUserModel';
import { IChangeProfileModel } from '../Interfaces/IChangeProfileModel';
import { IApiResponse } from '../Interfaces/IApiResponse';

export async function getUsers(token: string): Promise<IUserModel[]> {
  const response = await http<IUserModel[]>({
    path: '/User',
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return [];
}

export async function getUserModel(
  email: string,
  identifier: string,
  token?: string,
): Promise<IUserModel | null> {
  if (email) {
    const response = await http<IUserModel>({
      path: `/User/ByEmail/${encodeURIComponent(email)}`,
      token: token,
    });
    if (response.ok && response.body) {
      if (response.body.identifier) {
        return response.body;
      }
      // need to update user with identifier
      const updatedUser = response.body;
      updatedUser.identifier = identifier;
      const updateResult = await http<IUserModel, IUserModel>({
        path: '/User/UpdateIdentifier',
        method: 'put',
        body: updatedUser,
        token: token,
      });
      if (updateResult && updateResult.ok && updateResult.body) {
        return updateResult.body;
      }
      console.error('Update failed on user without identifier', updateResult);
      return null;
    }
    const newUser: IUserModel = {
      id: '',
      email: email,
      identifier: identifier,
      displayName: email,
      firstName: '',
      lastName: '',
      dateJoined: new Date().toISOString(),
      jobTitles: '["Employee"]',
    };
    const createResult = await http<IUserModel, IUserModel>({
      path: '/User',
      method: 'post',
      body: newUser,
      token: token,
    });
    if (createResult && createResult.ok && createResult.body) {
      return createResult.body;
    }
    console.error('Create failed on user with no DB entry', createResult);
  }
  return null;
}

export async function createUser(
  user: IUserModel,
  token: string,
): Promise<HttpResponse<IUserModel | IApiResponse>> {
  const response = await http<IUserModel | IApiResponse, IUserModel>({
    path: '/User',
    method: 'post',
    body: user,
    token: token,
  });
  return response;
}

export async function getNameFromEmail(
  email: string,
  token: string,
): Promise<string> {
  const response = await http<string>({
    path: `/User/Name/email/${email}`,
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return '';
}

export async function getNameFromIdentifier(
  identifier: string,
  token: string,
): Promise<string> {
  const response = await http<string>({
    path: `/User/Name/identifier/${identifier}`,
    token: token,
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return '';
}

export async function updateUserModel(
  model: IChangeProfileModel,
  token: string,
): Promise<HttpResponse<any>> {
  const response = await http<any, IChangeProfileModel>({
    path: '/User/UpdateProfile',
    method: 'put',
    body: model,
    token: token,
  });
  return response;
}
