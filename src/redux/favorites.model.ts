
export const favorites = {
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
    deleteFavoriteAddress(state, address) {
      const {[address]: remove, ...newList} = state.addresses;

      return {
        ...state,
        addresses: newList,
      };
    },
  },
};
