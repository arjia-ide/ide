import React, {Fragment} from "react";
import {ControlGroup, InputGroup, NonIdealState, Spinner} from "@blueprintjs/core";
import TransactionDetails from "../../components/transactionDetails";
import queryString from "query-string";
import {withRouter} from "react-router";

@withRouter
export default class TransactionViewer extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      hash: '',
      transaction: null,
      events: [],
      isLoading: false,
    };
  };

  componentDidMount() {

    if (this.props.location.search) {


      const { id } = queryString.parse(this.props.location.search);

      if (id) {
        this.setState({
          hash: id
        });
      }
    } else if (this.props.match.params.id) {
      this.setState({
        hash: this.props.match.params.id
      });
    }
  }


  renderBody() {
    const { isLoading, hash } = this.state;

    if (isLoading) {
      return (
        <div style={{ marginTop: 100 }}>
          <Spinner/>
        </div>
      );
    }

    if (!hash) {
      return (
        <div style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
          <NonIdealState
            icon="search"
            title="Transaction Details"
            description="Input a transaction hash" />
        </div>
      )

    }

    return (
        <div style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
          <TransactionDetails hash={hash} />
        </div>
    )
  }

  render() {

    return (
      <Fragment>
        <nav className="bp3-navbar">
          <ControlGroup fill={true}>
            <InputGroup placeholder="Input Transaction ID"
                        value={this.state.hash}
                        onChange={ev => this.setState({ hash: ev.target.value })}
                        style={{ width: 300 }} />
          </ControlGroup>
        </nav>
        {this.renderBody()}
      </Fragment>
    )
  }

}
