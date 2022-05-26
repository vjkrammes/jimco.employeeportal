import { IAlert } from './IAlert';

export interface IAlertResponse {
  alerts: IAlert[];
  notices: IAlert[];
}
