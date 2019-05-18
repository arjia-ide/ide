import {activeNetworkSelector} from "./config.selectors";
import TronWeb from "tronweb";

export const wallet = {
  state: {

  },
  reducers: {

  },
  effects: (dispatch) => ({
    async reloadWallet(walletAddress, state) {
      const activeNetwork = activeNetworkSelector(state);

      const tronWeb = new TronWeb(
        activeNetwork.fullNodeUrl,
        activeNetwork.solidityNodeUrl,
        activeNetwork.eventServerUrl,
      );

      const account = await tronWeb.trx.getUnconfirmedAccount(walletAddress);
      const resources = await tronWeb.trx.getAccountResources(walletAddress);

      dispatch.cache.setCacheValue({
        key: `wallet-${walletAddress}`,
        value: {
          balance: account.balance || 0,
          energy: resources.EnergyLimit || 0,
        }
      });
    },
  })
};
