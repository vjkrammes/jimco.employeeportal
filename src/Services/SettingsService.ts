import { http } from './http';
import { ISettingsModel } from '../Interfaces/ISettingsModel';
import { IApiResponse, SUCCESS } from '../Interfaces/IApiResponse';

export async function getSettings(): Promise<ISettingsModel> {
  const response = await http<ISettingsModel>({
    path: '/System/Settings',
  });
  if (response && response.ok && response.body) {
    return response.body;
  }
  return {
    id: '',
    systemId: '',
    inceptionDate: '',
    banner: '',
    canDelete: false,
  };
}

export async function updateSettings(
  settings: ISettingsModel,
  token: string,
): Promise<IApiResponse> {
  const response = await http<IApiResponse, ISettingsModel>({
    path: '/System/Settings/Update',
    method: 'put',
    body: settings,
    token: token,
  });
  if (response && response.ok) {
    return SUCCESS;
  }
  if (response && response.body) {
    return response.body;
  }
  return {
    code: 1,
    message: `An unexpected error occurred (${response.code || 0})`,
    messages: [],
  };
}
