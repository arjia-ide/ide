import TronWeb from "tronweb";
import {wait} from "../utils/promise";
import {TopToaster} from "../utils/toast";
import {Intent} from "@blueprintjs/core";


export default async function prepareTestNetWallet(
  walletAddress: string,
  amount: number = 100000000000,
  freezeAmount: number = 250000000000) {

  // const walletTronWeb = new TronWeb(
  //   'https://api.shasta.trongrid.io',
  //   'https://api.shasta.trongrid.io',
  //   'https://api.shasta.trongrid.io',
  //   wallet.privateKey,
  // );

  const testNetTronWeb = new TronWeb(
    'https://api.shasta.trongrid.io',
    'https://api.shasta.trongrid.io',
    'https://api.shasta.trongrid.io',
    '4E49E081F09C5A9F0A6A9D381FCEDEF130A4CC872AC9592062EA16314381E6A3',
  );

  const key = TopToaster.show({
    message: `Sending ${amount / 1000000} to ${walletAddress}`,
    icon: 'exchange',
    timeout: 30000
  });

  await testNetTronWeb.trx.sendTransaction(walletAddress, amount);

  await wait(2500);
  //
  // TopToaster.show({
  //   message: `Freezing ${freezeAmount / 1000000} TRX for Energy`,
  //   icon: 'snowflake',
  //   timeout: 30000,
  // }, key);
  //
  // await walletTronWeb.trx.freezeBalance(freezeAmount, 3, "ENERGY");

  TopToaster.show({
    message: `Testnet Wallet Ready!`,
    icon: 'tick',
    intent: Intent.SUCCESS,
    timeout: 3000,
  }, key);
}
