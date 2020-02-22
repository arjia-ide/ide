import { createModel } from "@rematch/core";

export const omnibar = createModel({
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
});
