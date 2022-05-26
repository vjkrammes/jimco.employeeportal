import { IItem } from "./IItem";

export interface ICart {
  created: Date;
  updated: Date;
  items: IItem[] | null;
}
