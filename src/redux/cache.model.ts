import { createModel } from "@rematch/core";

export const cache = createModel({
  state: {

  },
  reducers: {
    setCacheValue(state, { key, value }) {
      return ({
        ...state,
        [key]: value,
      });
    },
    patchCacheValue(state, { key, value }) {
      return ({
        ...state,
        [key]: {
          ...(state[key] || {}),
          ...value,
        },
      });
    },
  },
});
