import { IUserModel } from './IUserModel';

export interface ICompleteGroup {
  id: string;
  name: string;
  users: IUserModel[];
}
