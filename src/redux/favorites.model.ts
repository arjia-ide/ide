import { createModel } from "@rematch/core";

interface FavoritesState {
  addresses: { [key: string]: string };
}

export const favorites = createModel<FavoritesState>({
  state: {
    addresses: {},
  },
  reducers: {
    addFavoriteAddress(state, address) {
      return {
        ...state,
        addresses: {
          ...state.addresses,
          [address]: {
            address,
          },
        }
      };
    },
    deleteFavoriteAddress(state, address: string) {
      const { [address]: remove, ...newList } = state.addresses;

      return {
        ...state,
        addresses: newList,
      };
    },
  },
});
