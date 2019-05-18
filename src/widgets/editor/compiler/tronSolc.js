const packageJson = require("../../../../package.json");

// eslint-disable-next-line
const _tronSolcUrl = require("!!file-loader!tron-solc/soljson");

export const tronSolcUrl = _tronSolcUrl;
export const trolcSolcVersion = 'tron-solc_' + packageJson.dependencies['tron-solc'];
