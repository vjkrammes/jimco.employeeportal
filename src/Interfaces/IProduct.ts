import { ICategory } from './ICategory';
import { IPromotion } from './IPromotion';
import { IVendor } from './IVendor';

export interface IProduct {
  id: string;
  categoryId: string;
  vendorId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  ageRequired: number;
  quantity: number;
  reorderLevel: number;
  reorderAmount: number;
  cost: number;
  discontinued: boolean;
  category: ICategory | null;
  vendor: IVendor | null;
  promotions: IPromotion[];
  currentPromotion: IPromotion | null;
  canDelete: boolean;
}
