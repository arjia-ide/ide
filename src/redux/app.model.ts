import { createModel } from "@rematch/core";

export const app = createModel({
  state: {
    activeLanguage: 'en',
  },
  reducers: {
    setActiveLanguage(state, language) {
      return {
        ...state,
        activeLanguage: language,
      };
    },
  },
});
