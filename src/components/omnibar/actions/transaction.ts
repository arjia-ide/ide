import {IActionHandler} from "./actionHandler";
import {IAction} from "../action";


export default class TransactionActions implements IActionHandler {

  canHandle(query: string, items: IAction[]): boolean {
    return query && query.length === 64;
  }


  canProvide(query: string, items: IAction[]): boolean {
    return false;
  }

  onItemsList(query: string, items: IAction[]): IAction[] {
    return [
      {
        name: 'Open Transaction',
        run: context => context.navigateTo(`/transaction/${query}`),
      },
      {
        name: 'Open Transaction in Tronscan',
        run: () => window.open(`https://tronscan.org/#/transaction/${query}`),
      },
    ];
  }

}
