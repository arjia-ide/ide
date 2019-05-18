import {IActionHandler} from "./actionHandler";
import {IAction} from "../action";
import {filter} from "lodash";

export default class NavigationActions implements IActionHandler {

  canHandle(query: string, items: IAction[]): boolean {
    return false;
  }

  canProvide(query: string, items: IAction[]): boolean {
    return true;
  }

  onItemsList(query: string, items: IAction[]): IAction[] {

    return filter(
      [
        {
          name: 'Goto Editor',
          run: context => context.navigateTo("/editor"),
        },
        {
          name: 'Goto GraphQL',
          run: context => context.navigateTo("/api"),
        },
        {
          name: 'Goto Transaction',
          run: context => context.navigateTo("/transaction"),
        },
        {
          name: 'Goto Help',
          run: () => window.location.href = '/documentation',
        },
      ],
      action => action.name.toLowerCase().indexOf(query.toLowerCase()) >= 0);
  }
}
