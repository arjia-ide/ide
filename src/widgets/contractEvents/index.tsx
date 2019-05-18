import React, {Fragment} from "react";
import {connect} from "react-redux";
import WidgetBase from "../widgetBase";
import ContractEvents from "./contract";

@connect(
  state => ({
    projects: state.ide.projects,
    activeProject: state.ide.projects[state.ide.activeProject],
    files: state.ide.projects[state.ide.activeProject].files,
    activeFile: state.ide.activeFile,
  }),
  ({ ide }) => ({
    updateFile: ide.updateFile,
    addFile: ide.addFile,
  }),
  null,
  { pure: false },
)
export default class ContractEventsWidget extends React.Component<any, any> {

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


  renderWidget = (id) => {
    switch (id) {
      case 1:
        return {
          title: 'Events',
          cmp: <ContractEvents/>,
        };
    }
  };

  render() {

    const {modal} = this.state;

    return (
      <Fragment>
        {modal}
        <WidgetBase
          title="Smart Contract"
          renderWidget={id => this.renderWidget(id)}
          node={1}
        />
      </Fragment>
    )
  }
}
