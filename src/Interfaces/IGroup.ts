import { IUserModel } from './IUserModel';

export interface IGroup {
  id: string;
  name: string;
  userId: string;
  users: IUserModel[];
}
