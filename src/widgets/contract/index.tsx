import React, {Fragment} from "react";
import {ControlGroup} from "@blueprintjs/core";
import {connect} from "react-redux";
import WidgetBase from "../widgetBase";
import ContractFunctions from "./contractFunctions";
import ContractFunctionsLog from "./contractFunctionsLog";

@connect(
  state => ({
    projects: state.ide.projects,
    activeProject: state.ide.projects[state.ide.activeProject],
    files: state.ide.projects[state.ide.activeProject].files,
    activeFile: state.ide.activeFile,
    contractCalls: state.contractFunctions.contractCalls,
  }),
  ({ ide, contractFunctions: { addContractCall } }) => ({
    updateFile: ide.updateFile,
    addFile: ide.addFile,
    addContractCall,
  }),
  null,
  { pure: false },
)
export default class ContractWidget extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
    };
  };

  componentDidMount() {

  }

  handleClose = () => {
    this.setState({
      modal: null,
      events: [],
    });
  };

  setContract = (contract) => {
    console.log(contract);
  };

  renderWidget = (id) => {
    switch (id) {
      case 1:
        return {
          title: 'Functions',
          cmp: (
            <ContractFunctions
              onContractChanged={this.setContract}
            />
          ),
        };
      case 2: {
        return {
          title: 'Log',
          cmp: (
            <ContractFunctionsLog
            />
          )
        }
      }
    }
  };


  renderMenu() {

    return (
      <Fragment>
        <ControlGroup fill={true} className="bp3-align-right">
          Name:
        </ControlGroup>
      </Fragment>
    );
  }

  render() {

    const {modal} = this.state;

    return (
      <Fragment>
        {modal}
        <WidgetBase
          title="Smart Contract"
          renderWidget={id => this.renderWidget(id)}
          // menu={this.renderMenu()}
          menu={null}
          node={{
            direction: 'row',
            first: 1,
            second: 2,
            splitPercentage: 80,
          }}
        />
      </Fragment>
    )
  }
}
