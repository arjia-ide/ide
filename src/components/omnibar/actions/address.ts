import {IActionHandler} from "./actionHandler";
import {IAction} from "../action";
import {isAddress, isHex} from "@trx/core/dist/utils/utils";
import {addressFromHex, addressToHex} from "@trx/core/dist/utils/address";
import {filter} from "lodash";
import {copyWithConfirmation} from "../../../utils/clipboard";
import {filterItems, ifTrue} from "../../../utils/array";

export default class AddressActions implements IActionHandler {

  canHandle(query: string, items: IAction[]): boolean {
    const [optionalAddress] = query.split(" ");
    return isAddress(optionalAddress);
  }

  canProvide(query: string, items: IAction[]): boolean {
    return false;
  }

  onItemsList(query: string, items: IAction[]): IAction[] {
    const [optionalAddress, subQuery = ''] = query.split(" ");

    const address = addressFromHex(optionalAddress);

    const actions = filterItems([
      {
        name: 'Open Events',
        run: context => context.navigateTo(`/contract-events/${query}`),
      },
      {
        name: 'Open Functions',
        run: context => context.navigateTo(`/contract-functions/${query}`),
      },
      {
        name: 'Open Address in Tronscan',
        run: () => window.open(`https://tronscan.org/#/address/${address}`),
      },
      {
        name: 'Open Contract in Tronscan',
        run: () => window.open(`https://tronscan.org/#/contract/${address}`),
      },
      {
        name: 'Open Contract in TronSmartContractSpace',
        run: () => window.open(`https://tronsmartcontract.space/#/interact/${address}`),
      },
      ifTrue(optionalAddress.length === 34, {
        name: `Copy Hex (${addressToHex(address)})`,
        run: () => copyWithConfirmation(addressToHex(address), `Copied ${addressToHex(address)} to clipboard`),
      }),
      ifTrue(isHex(optionalAddress), {
        name: `Copy Base58 (${address})`,
        run: () => copyWithConfirmation(address, `Copied ${address} to clipboard`),
      }),
    ]);

    if (subQuery.length > 0) {
      return filter(actions, action => action.name.toLowerCase().indexOf(subQuery.toLowerCase()) !== -1);
    }

    return actions;
  }

}
