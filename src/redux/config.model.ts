import {newId} from "../utils/common";
import Wallet from '@trx/core/dist/blockchain/wallet/wallet';
import {omit} from "lodash";

const initialWallet = Wallet.create();

export const config = {
  state: {
    wallets: {
      [initialWallet.address]: {
        name: 'Wallet',
        privateKey: initialWallet.privateKey,
        address: initialWallet.address,
      }
    },
    networks: {
      'extension': {
        id: 'extension',
        name: 'Extension',
      },
      'mainnet': {
        id: 'mainnet',
        name: 'Mainnet',
        fullNodeUrl: 'https://api.trongrid.io',
        solidityNodeUrl: 'https://api.trongrid.io',
        eventServerUrl: 'https://api.trongrid.io',
      },
      'shasta': {
        id: 'shasta',
        name: 'Shasta',
        fullNodeUrl: 'https://api.shasta.trongrid.io',
        solidityNodeUrl: 'https://api.shasta.trongrid.io',
        eventServerUrl: 'https://api.shasta.trongrid.io',
      },
    },
    activeWallet: initialWallet.address,
    activeNetwork: 'shasta',
    gitHubToken: null,
  },
  reducers: {
    setActiveWallet(state, wallet) {
      return {
        ...state,
        activeWallet: wallet,
      };
    },
    setWalletName(state, { wallet, name }) {
      return {
        ...state,
        wallets: {
          ...state.wallets,
          [wallet]: {
            ...state.wallets[wallet],
            name,
          }
        },
      };
    },
    setActiveNetwork(state, network) {
      return {
        ...state,
        activeNetwork: network,
      };
    },
    setGithubToken(state, token) {
      return {
        ...state,
        gitHubToken: token,
      };
    },
    addNetwork(state, network) {
      return {
        ...state,
        networks: {
          ...state.networks,
          [network.id]: network,
        },
      };
    },
    addWallet(state, wallet) {
      return {
        ...state,
        wallets: {
          ...state.wallets,
          [wallet.address]: {
            id: newId(),
            ...wallet,
          },
        }
      };
    },
    deleteWallet(state, wallet) {
      let newWallets: any = omit(state.wallets, [wallet]);
      // @ts-ignore
      let activeWallet = Object.values(newWallets)[0].address;

      if (Object.keys(newWallets).length === 0) {
        newWallets = {
          [initialWallet.address]: {
            name: 'Wallet',
            privateKey: initialWallet.privateKey,
            address: initialWallet.address,
          }
        };

        activeWallet = initialWallet.address;
      }

      return {
        ...state,
        wallets: newWallets,
        activeWallet,
      };
    },
  },
};
