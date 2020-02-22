import TronWeb from "tronweb";

interface ContractDeployOptions {
  name: string;
  userFeePercentage?: number;
  parameters?: any[];
}

/**
 * Handles Contract deployment
 */
export default class ContractDeployer {

  tronWeb: any;

  constructor(tronWeb: any) {
    this.tronWeb = tronWeb;
  }

  /**
   * @param contract
   * @param deployOptions
   */
  async deployContract(contract, deployOptions: ContractDeployOptions) {

    const tronWeb = this.tronWeb;

    const tx = await tronWeb.transactionBuilder.createSmartContract({
      abi: contract.abi,
      bytecode: '0x' + contract.evm.bytecode.object,
      name: deployOptions.name,
      originEnergyLimit: 10000000,
      feeLimit: 1000000000,
      userFeePercentage: 100,
      ...deployOptions,
    }, tronWeb.defaultAddress.hex);

    const signedTx = await tronWeb.trx.sign(tx);
    await tronWeb.trx.sendRawTransaction(signedTx);

    const transactionInfo = await tronWeb.trx.getTransaction(signedTx.txID);

    return {
      contractAddress: TronWeb.address.fromHex(transactionInfo.contract_address),
    };
  }
}
