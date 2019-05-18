
export const contractFunctions = {
  state: {
    contractCalls: [],
  },
  reducers: {
    addContractCall(state, contractCall) {
      return {
        ...state,
        contractCalls: [ contractCall, ...state.contractCalls ],
      };
    },
  },
};
