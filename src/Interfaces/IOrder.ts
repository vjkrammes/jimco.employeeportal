import { IItem } from './IItem';

export interface IOrder {
  id: string;
  email: string;
  pin: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  createDate: Date;
  updateDate: Date;
  lineItems: IItem[] | null;
}
