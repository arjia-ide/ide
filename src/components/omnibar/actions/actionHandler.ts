import {IAction} from "../action";


export interface IActionHandler {
  canHandle(query: string, items: IAction[]): boolean;
  canProvide(query: string, items: IAction[]): boolean;
  onItemsList(query: string, items: IAction[]): IAction[];
}
