
export const app = {
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
};
