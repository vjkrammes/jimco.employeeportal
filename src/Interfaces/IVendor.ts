export interface IVendor {
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  contact: string;
  email: string;
  phone: string;
  fax: string;
  hasVendorRole: boolean;
  userExists: boolean;
  canDelete: boolean;
}
