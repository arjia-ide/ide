import React, {Fragment} from "react";
import {Button, ControlGroup, InputGroup, NonIdealState} from "@blueprintjs/core";
import {ContractEventStream} from "@trx/core/dist/blockchain/contract/contractEventStream";
import {Cell, Column, Table} from "@blueprintjs/table";
import {bufferTime, map} from "rxjs/operators";
import {filter} from "lodash";
import HttpApi from "@trx/core/dist/clients/http";
import {extractSmartContractInputs, filterContractType} from "@trx/core/dist/clients/http/utils";
import AddressInput from "../../components/utils/addressInput";
import {isAddress} from "@trx/core/dist/utils/utils";
import {withNetwork} from "../../hoc/withNetwork";
import {withRouter} from "react-router-dom";


const cellRenderer = (data, headerName) => (rowIndex) => {

  if (!data[rowIndex] || !data[rowIndex] || typeof data[rowIndex][headerName] === 'undefined') {
    return <Cell>&nbsp;</Cell>;
  }

  return <Cell>{data[rowIndex][headerName]}</Cell>;
};

@withRouter
@withNetwork
export default class ContractEvents extends React.Component<any, any> {

  private expressionEvaluator: any;

  constructor(props) {
    super(props);

    this.state = {
      events: [],
      rawEvents: [],
      headers: [],
      contractAddress: null,
      loaded: false,
      isLoading: false,
      filter: null,
      expression: '',
      methodNames: {},
      filterEvent: null,
    };
  }

  componentDidMount(): void {
    if (this.props.match.params.id) {
      this.setAddress(this.props.match.params.id);
    }
  }

  setAddress = async (address) => {

    this.setState({ isLoading: true });

    const tronGrid = new HttpApi(this.props.network.fullNodeUrl);

    switch (await tronGrid.getAccountType(address)) {
      case 2:
        new ContractEventStream(address, this.props.network.fullNodeUrl)
          .listenToEvents()
          .pipe(
            map(row => ({ ...row.result, name: row.name })),
            bufferTime(3000),
          )
          .subscribe(this.buildEventSubscriber());

        const contract = await tronGrid.getContractAbi(address);

        this.setState({
          contractAddress: address,
          loaded: true,
          isLoading: false,
          methodNames: contract.getEvents().reduce((m, { name }) => ({
            ...m,
            [name]: name
          }), {}),
          filterEvent: contract.getEvents().map(x => x.name)[0],
        });
        break;

      case 1:
        tronGrid
          .findTransactionsFromAddress(address)
          .pipe(
            filterContractType('TriggerSmartContract'),
            extractSmartContractInputs(),
            map(row => {
              return {
                ...row.params,
                name: `${row._contract.name} - ${row.name}`
              };
            }),
            bufferTime(3000),
          )
          .subscribe(this.buildEventSubscriber());

        this.setState({
          contractAddress: address,
          isLoading: false,
          loaded: true,
        });
        break;
    }
  }

  buildEventSubscriber() {
    return events => {
      if (events.length === 0) {
        return;
      }

      const methodNames = {};

      for (const ev of events) {
        methodNames[ev.name] = ev.name;
      }

      this.setState(prevState => ({
        rawEvents: [...events, ...prevState.rawEvents].slice(0, 1000),
        // events: [...(filter(events, this.isValidRow) || []), prevState.events],
        headers: prevState.headers.length > 0 ? prevState.headers : Object.keys(events[0]),
        methodNames: {
          ...prevState.methodNames,
          ...methodNames,
        }
      }));
    };
  }

  refreshRows = () => {

    const {expression, rawEvents, filterEvent} = this.state;

    let filteredEvents = rawEvents;

    if (filterEvent) {
      filteredEvents = filter(filteredEvents, event => event.name === filterEvent);
    }

    if (expression) {
      try {
        this.expressionEvaluator = new Function('row', `
         with (row) {
          return !!(${expression});
         }
        `);
        filteredEvents = filter(filteredEvents, e => this.expressionEvaluator(e));
      } catch (e) {
        console.error("INVALID EXPRESSION", e);
      }
    }

    if (filteredEvents.length === 0 || !filteredEvents[0]) {
      this.setState({
        events: [],
        headers: [],
      });
    } else {
      this.setState({
        events: filteredEvents,
        headers: Object.keys(filteredEvents[0]),
      });
    }
  }

  getFilteredRows = (rows) => {

    const {expression, filterEvent} = this.state;


    if (filterEvent) {
      rows = filter(rows, event => event.name === filterEvent);
    }

    if (expression) {
      try {
        this.expressionEvaluator = new Function('row', `
         with (row) {
          return !!(${expression});
         }
        `);
        rows = filter(rows, e => this.expressionEvaluator(e));
      } catch (e) {
        console.error("INVALID EXPRESSION", e);
      }
    }

    return rows;
  }

  isValidRow = (ev) => {

    if (this.expressionEvaluator && !this.expressionEvaluator(ev)) {
      return false;
    }

    if (this.state.filterEvent && this.state.filterEvent !== ev.name) {
      return false;
    }

    return true;
  }

  renderTable() {

    const {events, rawEvents, headers} = this.state;

    const rows = this.getFilteredRows(rawEvents);

    return (
      <Table
        numRows={rows.length}
        // loadingOptions={[TableLoadingOption.CELLS, TableLoadingOption.COLUMN_HEADERS, TableLoadingOption.ROW_HEADERS]}
      >
        {
          headers.map(header => <Column name={header} cellRenderer={cellRenderer(rows, header)}/>)
        }
      </Table>
    );
  }

  onSearchKeyDown = (ev) => {
    if (ev.keyCode === 13) {
      this.refreshRows();
    }
  }

  render() {

    const { methodNames, contractAddress, loaded, isLoading } = this.state;

    if (!loaded) {
      return (
        <NonIdealState
          icon="th-list"
          title="Contract Events"
          description="Input a wallet or contract address"
          action={
            <ControlGroup>
              <AddressInput
                onChange={value => this.setState({ contractAddress: value })}
                onValidAddress={address => this.setAddress(address)}
              />
              <Button
                text="Load"
                rightIcon="caret-right"
                loading={isLoading}
                disabled={!isAddress(contractAddress)}
                onClick={() => this.setAddress(contractAddress)}/>
            </ControlGroup>
          }
        />
      );
    }

    return (
      <Fragment>
        <nav className="bp3-navbar">
          <div className="bp3-navbar-group bp3-align-right">

            <ControlGroup fill={true}>
              {
                Object.entries(methodNames).length > 0 &&
                  <div className="bp3-select">
                    <select onChange={ev => { this.setState({ filterEvent: ev.target.value }, () => this.refreshRows()); } }>
                      {
                        Object.values(methodNames).map((method: string) => <option value={method}>{method}</option>)
                      }
                    </select>
                  </div>
              }
              <InputGroup placeholder="Find events.."
                          value={this.state.expression}
                          onKeyDown={this.onSearchKeyDown}
                          onChange={ev => this.setState({ expression: ev.target.value })}
                          style={{ width: 300 }} />
              <Button icon="filter" onClick={this.refreshRows} />
            </ControlGroup>
          </div>
        </nav>
        <div style={{ height: 'calc(100% - 50px)' }}>
          {this.renderTable()}
        </div>
      </Fragment>
    );
  }

}
