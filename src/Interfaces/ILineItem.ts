import { IProduct } from './IProduct';

export interface ILineItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  ageRequired: number;
  statusDate: Date;
  status: number;
  product: IProduct;
  canDelete: boolean;
}
