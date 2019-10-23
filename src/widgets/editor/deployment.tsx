import React from "react";
import {Cell, Column, SelectionModes, Table} from "@blueprintjs/table";
import {Button, Checkbox, Classes, ControlGroup, Dialog, InputGroup, NumericInput, Spinner} from "@blueprintjs/core";
import {connect} from "react-redux";
import {filter, flatMap} from "lodash";
import ContractDeployer from "../../services/contractDeployer";
import {withApi} from "../../hoc/withApi";
import copy from 'copy-to-clipboard';

const cellRenderer = (data, headerName, onRowEdit, { isDeploying }) => (rowIndex) => {

  if (headerName === 'deploy') {
    return (
      <Cell
        style={{ padding: 5, textAlign: 'center' }} >
        <Checkbox
          checked={data[rowIndex][headerName]}
          onChange={(ev: any) => onRowEdit(rowIndex, { [headerName]: ev.target.checked })}
        >
        </Checkbox>
      </Cell>
    );
  }

  if (headerName === 'feePercentage') {
    return (
      <Cell style={{ padding: 0  }}>
        <NumericInput
          value={data[rowIndex][headerName]}
          onChange={value => onRowEdit(rowIndex, { [headerName]: value })}
          fill={true}
          buttonPosition={null}
          min={0}
          max={100} />
      </Cell>
    );
  }

  if (headerName === 'deployName') {
    return (
      <Cell style={{ padding: 0  }}>
        <InputGroup
          round={false}
          value={data[rowIndex][headerName]}
          onChange={ev => onRowEdit(rowIndex, { [headerName]: ev.target.value })}
        />
      </Cell>
    );
  }

  if (headerName === 'address') {
    return (
      <Cell loading={isDeploying} style={{ lineHeight: '30px' }}>
        {
          data[rowIndex].address &&
          <Button icon="duplicate" className="ml-1" onClick={() => copy(data[rowIndex].address)} minimal={true} small={true} />
        }
        {data[rowIndex].address || 'Waiting for deployment...'}
      </Cell>
    );
  }

  if (!data[rowIndex] || !data[rowIndex] || typeof data[rowIndex][headerName] === 'undefined') {
    return <Cell>&nbsp;</Cell>;
  }

  return <Cell style={{ lineHeight: '30px' }}>{data[rowIndex][headerName]}</Cell>;
};


@withApi
// @ts-ignore
@connect(
  (state: any) => ({
    output: state.ide.compileOutput,
  }),
  ({ ide }: any) => ({
    setDeployedContracts: ide.setDeployedContracts,
  }),
)
export default class Deployment extends React.Component<any, any> {

  state = {
    modal: null,
    values: {},
    isDeploying: false,
  };

  buildContracts = () => {

    const { output } = this.props;
    const { values } = this.state;

    if (!output) {
      return [];
    }

    return flatMap(Object.entries(output.contracts), ([name, contract]) =>
        filter(Object.keys(contract), contractName => !!contract[contractName].evm.assembly)
          .map(filename => ({
            filename,
            contract: `${name} - ${filename}`,
            id: `${name};${filename}`,
            deploy: false,
            deployName: filename,
            address: '',
            feePercentage: 0,
          }))
      ).map((row, index) => ({
        ...row,
        ...(values[index] || {}),
      }));
  }


  handleClose = () => {
    this.setState({
      modal: null,
      events: [],
    });
  }

  renderLoadingDeployment = () => {
    this.setState({
      modal: (
        <Dialog
          icon="function"
          onClose={this.handleClose}
          title={`Deploy Contract`}
          usePortal={true}
          isOpen={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <h2 style={{textAlign: 'center'}}>Deploying contract...</h2>
            <Spinner/>
          </div>
        </Dialog>
      )
    });
  }

  hasContractsToDeploy = () => {
    return filter(this.buildContracts(), contract => !!contract.deploy).length > 0;
  }

  deployContracts = async () => {

    this.setState({ isDeploying: true });

    try {

      const deployer = new ContractDeployer(this.props.getTronWeb());
      const output = this.props.output;

      let index = 0;
      for (const contractConfig of this.buildContracts()) {
        if (contractConfig.deploy) {
          const [file, contractName] = contractConfig.id.split(";");
          const contract = output.contracts[file][contractName];

          const deployResult = await deployer.deployContract(contract, {
            name: contractConfig.deployName,
            userFeePercentage: contractConfig.feePercentage,
          });

          this.onRowEdit(index, {
            deployed: true,
            address: deployResult.contractAddress,
          });
        }

        index++;
      }

      this.props.setDeployedContracts(this.buildContracts().map(contract => ({
        name: contract.deployName,
        address: contract.address,
      })));

    } finally {
      this.setState({ isDeploying: false });
    }
  }

  onRowEdit = (index, obj) => {

    this.setState(prevState => ({
      values: {
        ...prevState.values,
        [index]: {
          ...(prevState.values[index] || {}),
          ...obj,
        }
      }
    }));
  }

  render() {

    const contracts = this.buildContracts();

    const headers = [
      'contract',
      'deployName',
      'feePercentage',
      'deploy',
      'address',
    ];

    const names = {
      contract:       'Contract',
      deploy:         'Deploy',
      deployName:     'Name',
      address:        'Address',
      feePercentage:  'Fee',
    };

    const rowHeight = 30;

    return (
      <React.Fragment>
        {this.state.modal}
        <nav className="bp3-navbar">
          <div className="bp3-navbar-group bp3-align-right">

            <ControlGroup fill={true}>
              <Button text="Deploy Contracts"
                      icon="cloud-upload"
                      loading={this.state.isDeploying}
                      disabled={!this.hasContractsToDeploy()}
                      onClick={this.deployContracts}/>
            </ControlGroup>
          </div>
        </nav>
        <Table
          defaultRowHeight={rowHeight}
          defaultColumnWidth={200}
          enableMultipleSelection={false}
          enableFocusedCell={false}
          columnWidths={[
            200,
            200,
            80,
            100,
            285,
          ]}
          numRows={contracts.length}
          selectionModes={SelectionModes.NONE}
        >
          {
            headers.map(header =>
              <Column
                key={header}
                name={names[header]}
                cellRenderer={cellRenderer(contracts, header, this.onRowEdit, this.state)}/>)
          }
        </Table>
      </React.Fragment>
    );
  }
}
