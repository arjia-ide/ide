import {createSelector} from "reselect";

export interface Network {
  id: string;
  name: string;
  fullNodeUrl: string;
  solidityNodeUrl: string;
  eventServerUrl: string;
}

export const activeNetworkSelector = (state): Network => {

  const {networks, activeNetwork} = state.config;

  // @ts-ignore
  if (activeNetwork === 'extension' && window.tronWeb && window.tronWeb.fullNode) {

    // @ts-ignore
    const tronWeb = window.tronWeb;

    return {
      id: 'extension',
      name: 'Extension',
      fullNodeUrl: tronWeb.fullNode.host,
      solidityNodeUrl: tronWeb.solidityNode.host,
      eventServerUrl: tronWeb.eventServer.host,
    };
  }

  return networks[activeNetwork];
};

export const activeWalletDataSelector = createSelector(
  // @ts-ignore
  state => state.config.wallets,
  // @ts-ignore
  state => activeWalletSelector(state),
  // @ts-ignore
  state => state.cache,
  (wallets, activeWallet, cache) => {

    if (activeWallet && cache[`wallet-${activeWallet.address}`]) {
      return {
        ...cache[`wallet-${activeWallet.address}`]
      };
    }

    return {
      balance: 0,
      energy: 0,
    };
  }
);

export const activeWalletSelector = state => {

  const {config} = state;

  const wallet = config.wallets[config.activeWallet];

  if (config.activeNetwork === 'extension') {

    // @ts-ignore
    if (window.tronWeb) {

      // @ts-ignore
      return {
        name: 'Extension',
        // @ts-ignore
        address: window.tronWeb.defaultAddress.base58 || "No open wallet",
        privateKey: null,
      };
    }
  }

  if (!wallet) {
    return {
      name: 'None',
      address: '-',
    };
  }

  return wallet;
};
