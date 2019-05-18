
export const omnibar = {
  state: {
    isOpen: false,
  },
  reducers: {
    toggleOmnibar(state) {
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    },
    setOmnibar(state, isOpen) {
      return {
        ...state,
        isOpen,
      };
    },
  },
};
