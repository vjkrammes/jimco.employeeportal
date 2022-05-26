export interface IPromotion {
  id: string;
  productId: string;
  createdOn: Date;
  createdBy: string;
  startDate: Date;
  stopDate: Date;
  canceledOn: Date;
  canceledBy: string;
  price: number;
  description: string;
  limitedQuantity: boolean;
  maximumQuantity: number;
  canDelete: boolean;
}
