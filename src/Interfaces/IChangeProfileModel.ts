export interface IChangeProfileModel {
  identifier: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  changeRoles: boolean;
  isVendor: boolean;
  isEmployee: boolean;
  isManager: boolean;
  isAdmin: boolean;
}
