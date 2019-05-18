import React, {Fragment} from "react";
import {
  Button,
  Checkbox,
  Classes,
  ControlGroup,
  Dialog,
  FormGroup,
  InputGroup,
  Intent,
  NonIdealState
} from "@blueprintjs/core";
import TronWeb from "tronweb";
import Address from "../../components/utils/address";
import AddressInput from "../../components/utils/addressInput";
import TransactionDetails from "../../components/transactionDetails";
import {withApi} from "../../hoc/withApi";
import HttpApi from "@trx/core/dist/clients/http";
import ContractApi from "@trx/core/dist/smartcontract/contractApi";
import HttpTransactionBuilder from "@trx/core/dist/clients/http/transactionBuilder"
import PrivateKeyTransactionSigner from "@trx/core/dist/transaction/privateKeyTransactionSigner"
import MethodCallResult from "@trx/core/dist/smartcontract/methodCallResult";
import MethodAbi from "@trx/core/dist/smartcontract/methodAbi";
import {TopToaster} from "../../utils/toast";
import {connect} from "react-redux";
import {isAddress} from "@trx/core/dist/utils/utils";
import {withRouter} from "react-router-dom";

const trxFieldName = "___trx_value";

function FunctionParameter({ name, type, onChange = (name: string) => {} }) {
  return (
    <InputGroup placeholder={`${name} - ${type}`} onChange={ev => onChange(ev.target.value)} />
  );
}

function PayableFunction({ name, inputs = [], loading = false, submit, value = {}, onChange = (name: string, value: any) => {} }) {

  return (
    <FormGroup
      label={name}
    >
      <ControlGroup vertical={false}>
        <Checkbox />
        { inputs.map(input => <FunctionParameter key={input.name} {...input} onChange={value => onChange(input.name, value)} />) }
        <FunctionParameter
          key={trxFieldName}
          name={trxFieldName}
          type="uint256"
          onChange={value => onChange(trxFieldName, value)} />
        <Button text="Send" loading={loading} onClick={submit} />
      </ControlGroup>
    </FormGroup>
  )
}

function ConstantFunction({ name, inputs = [], value = {}, submit, loading = false, onChange = (name: string, value: any) => {} }) {

  return (
    <FormGroup
      label={name}
    >
      <ControlGroup vertical={false}>
        <Checkbox />
        { inputs.map((input, index) => <FunctionParameter key={index} value={value[input.name]} {...input} onChange={value => onChange(input.name, value)} />) }
        <Button text="Send" loading={loading} onClick={submit} />
      </ControlGroup>
    </FormGroup>
  )
}

function SendFunction({ name, inputs = [], value = {}, loading = false, submit, onChange = (name: string, value: any) => {} }) {

  return (
    <FormGroup
      label={name}
    >
      <ControlGroup vertical={false}>
        <Checkbox />
        { inputs.map(input => <FunctionParameter key={input.name} value={value[input.name]} {...input} onChange={value => onChange(input.name, value)} />) }
        <Button text="Send" loading={loading} onClick={submit} />
      </ControlGroup>
    </FormGroup>
  )
}

@withRouter
@withApi
@connect(
  state => ({}),
  ({ contractFunctions: { addContractCall } }) => ({
    addContractCall
  })
)
export default class ContractFunctions extends React.Component<any, any> {

  contractObj: ContractApi;

  constructor(props) {
    super(props);

    this.state = {
      contractAddress: null,
      functions: [],
      events: [],
      isReady: false,
      isLoading: false,
      constantFunctions: [],
      payableFunctions: [],
      functionParameters: {},
      functionLoading: {},
      modal: null,
    };
  };

  componentDidMount(): void {
    if (this.props.match.params.id) {
      this.loadContract(this.props.match.params.id);
    }
  }

  getHttpClient() {
    return new HttpApi(this.props.network.fullNodeUrl);
  }

  getTransactionBuilder() {
    return new HttpTransactionBuilder(
      this.getHttpClient(),
      new PrivateKeyTransactionSigner(this.props.wallet.privateKey),
    );
  }

  async loadContract(contractAddress) {

    this.setState({ isLoading: true });

    try {

      const contract = await this.getContract(contractAddress);

      const constantFunctions = [];
      const payableFunctions = [];
      const functions = [];
      const events = contract.abi.getEvents();

      for (let method of contract.abi.getMethods()) {

        if (method.isConstant()) {
          constantFunctions.push(method);
        } else if (!method.isPayable()) {
          functions.push(method);
        } else if (method.isPayable()) {
          payableFunctions.push(method);
        }
      }

      this.props.onContractChanged(contract);

      this.setState({
        constantFunctions,
        functions,
        events,
        payableFunctions,
        isLoading: false,
        isReady: true,
      })
    } catch (e) {
      console.error(e);
      TopToaster.show({
        icon: 'error',
        message: e.toString(),
        intent: Intent.DANGER,
      });
    } finally {
      this.setState({
        isLoading: false,
      });
    }
  }

  async getContract(contractAddress) {
    if (!this.contractObj) {
      this.contractObj = await this.getHttpClient().getContract(contractAddress);
    }
    return this.contractObj;
  }

  setFunctionParameter(funcName, paramName, value) {

    this.setState(prevState => ({
      functionParameters: {
        ...prevState.functionParameters,
        [funcName]: {
          ...(prevState.functionParameters[funcName] || {}),
          [paramName]: value,
        }
      },
    }));
  }

  handleClose = () => {
    this.setState({
      modal: null,
    });
  };

  /**
   * Calls the given method
   */
  async callMethod(contract: ContractApi, funcName: string, args = [], options: any = {}): Promise<MethodCallResult> {

    const methodApi = contract.getMethod(funcName);
    const methodCall = methodApi
      .build()
      .setOwnerAddress(this.props.getTronWeb().defaultAddress.base58);

    if (methodApi.abi.isPayable()) {

      let methodArgs = args.slice();

      console.log("payable", args, methodArgs, options);

      return await this.getTransactionBuilder().callSmartContract(
        methodCall
          .setParameters(methodArgs)
          .setTrxAmount(options.trxAmount || 0)
      );
    }

    return await this.getTransactionBuilder().callSmartContract(
      methodCall.setParameters(args)
    );
  }

  prepareValue = (value) => {
    value = value.toString();

    if (TronWeb.isAddress(value)) {
      return <Address address={value} />
    }

    return value;
  };

  async submitFunction(funcName) {

    const {functionParameters, contractAddress} = this.state;

    try {

      this.setState(prevState => ({
        ...prevState,
        functionLoading: {
          ...prevState.functionLoading,
          [funcName]: true
        }
      }));

      const contract = await this.getContract(contractAddress);
      const contractAbi = contract.abi;

      const methodAbi: MethodAbi = contractAbi.getMethod(funcName);
      const funcParameters = functionParameters[funcName] || {};

      let methodCallResult: MethodCallResult = null;
      let inputParameters = [];

      console.log("submitFunction", funcName, funcParameters);

      if (methodAbi.hasInput()) {
        const args = methodAbi.inputs.map(input => funcParameters[input.name] || null);
        methodCallResult = await this.callMethod(contract, funcName, args, {
          trxAmount: funcParameters["___trx_value"] || 0,
        });
        inputParameters = methodAbi.inputs.map(input => ({ name: input.name, value: funcParameters[input.name] || null }));
      } else {
        methodCallResult = await this.callMethod(contract, funcName, [], {
          trxAmount: funcParameters["___trx_value"] || 0,
        });
      }

      let result = methodCallResult.getResult();

      if (result && result._ethersType === 'BigNumber') {
        result = {
          result,
        };
      } else if (typeof result === 'object') {

        for (let [name, value] of Object.entries(result)) {
          result[name] = this.prepareValue(value);
        }
      } else {
        result = {
          result,
        };
      }

      this.props.addContractCall({
        txId: methodAbi.isConstant() ? null : methodCallResult.getTransactionId(),
        functionName: funcName,
        functionResult: result,
      });

      this.setState({
        modal: (
          <Dialog
            icon="function"
            onClose={this.handleClose}
            title={`${funcName} result`}
            usePortal={true}
            isOpen={true}
            style={{ width: 800 }}
          >
            <div className={Classes.DIALOG_BODY}>
              {
                inputParameters.length > 0 &&
                <Fragment>
                  <h3>Input</h3>
                  <table>
                    {
                      inputParameters.map(({ name, value }) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{value}</td>
                        </tr>
                      ))
                    }
                  </table>
                </Fragment>
              }
              <h3>Output</h3>
              {
                !methodAbi.isConstant() ?
                  <TransactionDetails hash={methodCallResult.getTransactionId()}/> :
                  <Fragment>
                    <table>
                      {
                        Object.entries(result).map(([name, value]) => (
                          <tr key={name}>
                            <td>{name}</td>
                            <td>{value}</td>
                          </tr>
                        ))
                      }
                    </table>
                  </Fragment>
              }
            </div>
          </Dialog>
        )
      })
    } catch (e) {
      console.error(e);
    } finally {
      this.setState(prevState => ({
        ...prevState,
        functionLoading: {
          ...prevState.functionLoading,
          [funcName]: false
        }
      }));
    }
  }

  render() {

    const {
      functions,
      payableFunctions,
      constantFunctions,
      modal,
      functionLoading,
      functionParameters,
      isLoading,
      isReady,
      contractAddress
    } = this.state;

    if (!isReady) {
      return (
        <NonIdealState
          icon="function"
          title="Contract Functions"
          description="Input a contract address"
          action={
            <ControlGroup>
              <AddressInput
                onChange={value => this.setState({ contractAddress: value })}
                onValidAddress={(address) => this.loadContract(address)}
              />
              <Button
                text="Load"
                rightIcon="caret-right"
                loading={isLoading}
                disabled={!isAddress(contractAddress)}
                onClick={() => this.loadContract(contractAddress)}
              />
            </ControlGroup>
          }
        />
      )
    }

    return (
      <Fragment>
        <div className="form-next" style={{ padding: 10 }}>
          {modal}
          { constantFunctions.map(func => <ConstantFunction key={func.name} {...func} loading={functionLoading[func.name] || false} submit={() => this.submitFunction(func.name)} value={functionParameters[func.name] || {}} onChange={(paramName, value) => this.setFunctionParameter(func.name, paramName, value)} />) }
          { payableFunctions.map(func => <PayableFunction key={func.name} {...func} loading={functionLoading[func.name] || false} submit={() => this.submitFunction(func.name)} value={functionParameters[func.name] || {}} onChange={(paramName, value) => this.setFunctionParameter(func.name, paramName, value)} />) }
          { functions.map(func => <SendFunction key={func.name} {...func} loading={functionLoading[func.name] || false} submit={() => this.submitFunction(func.name)} value={functionParameters[func.name] || {}} onChange={(paramName, value) => this.setFunctionParameter(func.name, paramName, value)} />) }
        </div>
      </Fragment>
    )
  }

}
