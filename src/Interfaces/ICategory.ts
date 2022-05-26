export interface ICategory {
  id: string;
  name: string;
  background: string;
  isAgeRestricted: boolean;
  ageRequired: number;
  image: string;
  canDelete: boolean;
}
