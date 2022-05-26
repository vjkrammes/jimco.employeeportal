import { ICreateOrderItem } from './ICreateOrderItem';

export interface ICreateOrderModel {
  email: string;
  name: string;
  pin: number;
  ageRequired: number;
  items: ICreateOrderItem[];
}
