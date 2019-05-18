export const cache = {
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
      })
    },
  },
};
