import React from "react";
import {connect} from "react-redux";
import {Card, Classes, Dialog} from "@blueprintjs/core";
import TransactionDetails from "../../components/transactionDetails";

// @ts-ignore
@connect(
  (state: any) => ({
    projects: state.ide.projects,
    activeProject: state.ide.projects[state.ide.activeProject],
    files: state.ide.projects[state.ide.activeProject].files,
    activeFile: state.ide.activeFile,
    contractCalls: state.contractFunctions.contractCalls,
  }),
  ({ ide, contractFunctions: { addContractCall } }: any) => ({
    updateFile: ide.updateFile,
    addFile: ide.addFile,
    addContractCall,
  }),
  null,
  { pure: false },
)
export default class ContractFunctionsLog extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      modal: null
    };
  }


  handleClose = () => {
    this.setState({
      modal: null,
    });
  }

  openTransaction = (id) => {
    this.setState({
      modal: (
        <Dialog
          icon="function"
          onClose={this.handleClose}
          title={`Result`}
          usePortal={true}
          isOpen={true}
          style={{ width: 800 }}
        >
          <div className={Classes.DIALOG_BODY}>
            <TransactionDetails hash={id} />
          </div>
        </Dialog>
      )
    });
  }

  render() {
    const { contractCalls } = this.props;

    const { modal } = this.state;

    return (
      <div className="p-2">
        {modal}
        {
          contractCalls.map(contractCall => (
            <Card className="p-3 mb-2">
              {
                contractCall.txId ?
                  <b><a href="javascript:;" onClick={() => this.openTransaction(contractCall.txId)}>{contractCall.functionName}</a></b> :
                  <b>{contractCall.functionName}</b>
              }
              <p className="pt-2 m-0">
                {
                  Object.entries(contractCall.functionResult).map(([name, value]) => (
                    <tr key={name}>
                      <td className="pr-2">{name}</td>
                      <td>{value}</td>
                    </tr>
                  ))
                }

              </p>
            </Card>
          ))
        }
      </div>
    );
  }
}
