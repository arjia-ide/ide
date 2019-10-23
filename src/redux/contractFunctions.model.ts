import { createModel } from "@rematch/core";

export const contractFunctions = createModel({
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
});
