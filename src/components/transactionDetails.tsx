import React from "react";
import TronWeb from "tronweb";
import TxHash from "./utils/txHash";
import {Card, Intent, Navbar, Spinner, Tab, Tabs, Tag} from "@blueprintjs/core";
import HttpApi from "@trx/core/dist/clients/http";
import Address from "./utils/address";
import {wait} from "../utils/promise";
import {withNetwork} from "../hoc/withNetwork";
import {tu} from "../utils/i18n";
import TransactionInfo from "@trx/core/dist/blockchain/transaction/transactionInfo";
import Transaction from "@trx/core/dist/blockchain/transaction/transaction";
import {FormattedNumber} from "react-intl";
import {isObject} from "lodash";
import {FormattedTRX} from "../utils/intl";
import {Network} from "../redux/config.selectors";

interface TransactionState {
  transactionInfo?: TransactionInfo;
  transaction?: Transaction;
  events: any[];
  isLoading: boolean;
  selectedTab: string;
  pages: any[];
  modal?: any;
  smartContractInput?: any;
}

interface TransactionProps {
  hash: string;
  attempts?: number;
  delay?: number;
  initialDelay?: number;
  network?: Network;
}

// @ts-ignore
@withNetwork
export default class TransactionDetails extends React.Component<TransactionProps, TransactionState> {

  constructor(props) {
    super(props);

    this.state = {
      transactionInfo: null,
      events: [],
      isLoading: false,
      selectedTab: 'contract',
      pages: [],
      smartContractInput: null,
    };
  }

  componentDidMount() {
    const { hash } = this.props;

    if (hash) {
      this.loadTransaction(hash);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.hash !== prevProps.hash) {
      this.setState({
        transaction: null,
        transactionInfo: null,
        events: [],
      });
      this.loadTransaction(this.props.hash);
    }
  }

  reloadTransaction = async (hash) => {
    const httpApi = new HttpApi(this.props.network.fullNodeUrl);

    const [transaction, transactionInfo] = await Promise.all([
      httpApi.findTransactionByHash(hash),
      httpApi.findTransactionInfoByHash(hash)
    ]);

    if (transactionInfo && transaction) {

      const smartContractInput = await httpApi.getSmartContractInputFromTransaction(transaction);

      this.setState({
        transaction,
        transactionInfo,
        smartContractInput,
        events: transactionInfo.getEventLog(),
      });

      return true;
    }

    return false;
  }

  loadTransaction = async (hash) => {

    let {
      attempts = 5,
      delay = 3000,
      initialDelay = 0,
    } = this.props;

    this.setState({ isLoading: true });


    await wait(initialDelay);

    while (attempts-- > 0) {

      try {

        if (this.reloadTransaction(hash)) {
          this.setState({
            isLoading: false,
          });
          await wait(3500);
          await this.reloadTransaction(hash);
          break;
        }

      } catch (e) {
        console.error(e);
      }

      await wait(delay);
    }
  }

  handleClose = () => {
    this.setState({
      modal: null,
      events: [],
    });
  }

  renderEvents() {
    const {events} = this.state;

    return (
      <table className="bp3-html-table" style={{ width: '100%' }}>
        <thead>
        <tr>
          <th>Name</th>
          <th>Parameters</th>
        </tr>
        </thead>
        <tbody>
        {
          events.map((event, index) => (
            <tr key={index}>
              <td>{event.name}</td>
              <td>
                {
                  Object.entries(event.result).map(([key, name]) => (
                    <div>
                      <b>{key}</b>: {TronWeb.isAddress(name) ? <Address address={TronWeb.address.fromHex(name)} /> : name.toString()}
                    </div>
                  ))
                }
              </td>
            </tr>
          ))
        }
        </tbody>
      </table>
    );
  }



  renderValue = value => {
    if (TronWeb.isAddress(value)) {
      return (
        <Address address={value}/>
      );
    }

    if (isObject(value)) {
      return (
        <pre className="bp3-code-block" style={{ maxHeight: 200, overflow: 'scroll' }}>
          <code>
            {JSON.stringify(value, null, 2)}
          </code>
        </pre>
      );
    }

    return value.toString();
  }

  renderPages = () => {
    const {
      transactionInfo,
      transaction,
      events,
      smartContractInput
    } = this.state;

    const pages = [];

    if (transaction) {
      pages.push({
        title: "Contract",
        id: "contract",
        cmp: (
          <table className="bp3-html-table" style={{ width: '100%' }}>
            <tbody>
            <tr>
              <td>Type</td>
              <td>{transaction.getContractType()}</td>
            </tr>
            {
              transaction.getContractType() === 'TriggerSmartContract' &&
                <tr>
                  <td>Call Value (TRX)</td>
                  <td><FormattedTRX value={transaction.getCallValue() / 1000000} /> TRX</td>
                </tr>
            }
            {
              smartContractInput &&
                <React.Fragment>
                  <tr>
                    <td>SmartContract Method</td>
                    <td>{smartContractInput.name}</td>
                  </tr>
                  <tr>
                    <td>SmartContract Input</td>
                    <td>
                      <table className="bp3-html-table bp3-html-table-condensed">
                        {
                          Object.entries(smartContractInput.params).map(([name, value]) => (
                            <tr key={name}>
                              <td>{name}</td>
                              <td>{value}</td>
                            </tr>
                          ))
                        }
                      </table>
                    </td>
                  </tr>
                </React.Fragment>
            }
            {
              Object.entries(transaction.contractData).map(([name, value]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{this.renderValue(value)}</td>
                </tr>
              ))
            }
            </tbody>
          </table>
        ),
      });
    }


    if (events.length > 0) {
      pages.push({
        title: "Events",
        id: "events",
        cmp: this.renderEvents(),
      });
    }

    if (transactionInfo && transactionInfo.receipt) {
      pages.push({
        title: "Receipt",
        id: "receipt",
        cmp: (
          <table className="bp3-html-table" style={{ width: '100%' }}>
            <tbody>
              {
                transactionInfo.receipt.energyUsed &&
                  <tr>
                    <td>Energy Used</td>
                    <td><FormattedNumber value={transactionInfo.receipt.energyUsed} /></td>
                  </tr>
              }
              {
                transactionInfo.receipt.energyUsedTotal &&
                  <tr>
                    <td>Energy Total Used</td>
                    <td><FormattedNumber value={transactionInfo.receipt.energyUsedTotal} /></td>
                  </tr>
              }
              {
                transactionInfo.receipt.energyFee &&
                  <tr>
                    <td>Energy Fee</td>
                    <td><FormattedNumber value={transactionInfo.receipt.energyFee} /></td>
                  </tr>
              }
              {
                transactionInfo.receipt.bandwidthUsed &&
                  <tr>
                    <td>Bandwidth Used</td>
                    <td><FormattedNumber value={transactionInfo.receipt.bandwidthUsed} /></td>
                  </tr>
              }
              {
                transactionInfo.receipt.result &&
                  <tr>
                    <td>Result</td>
                    <td><Tag intent={transactionInfo.receipt.result === 'SUCCESS' ? Intent.SUCCESS : Intent.PRIMARY}>{transactionInfo.receipt.result}</Tag></td>
                  </tr>
              }
            </tbody>
          </table>
        )
      });
    }

    return pages;
  }

  render() {

    const { transactionInfo, transaction, isLoading, events } = this.state;

    const pages = this.renderPages();

    if (isLoading || !transactionInfo) {
      return (
        <div style={{ marginTop: 100 }}>
          <Spinner/>
        </div>
      );
    }

    return (
      <div style={{ height: 'calc(100% - 50px)', overflowY: 'auto' }}>
        <table className="bp3-html-table" style={{ width: '100%' }}>
          <tbody>
          <tr>
            <th>{tu("hash")}</th>
            <td>
              <TxHash hash={transactionInfo.id}/>
            </td>
          </tr>
          <tr>
            <th>{tu("block")}</th>
            <td>{transactionInfo.block}</td>
          </tr>
          <tr>
            <th>{tu("fee")}</th>
            <td><FormattedNumber value={transactionInfo.fee / 1000000} /> TRX</td>
          </tr>
          {
            transactionInfo.result &&
              <tr>
                <th>{tu("result")}</th>
                <td><Tag intent={transactionInfo.result === 'FAILED' ? Intent.DANGER : Intent.PRIMARY}>{transactionInfo.result}</Tag></td>
              </tr>
          }
          {
            transactionInfo.resultMessage &&
              <tr>
                <th>{tu("message")}</th>
                <td>{transactionInfo.resultMessage}</td>
              </tr>
          }
          {
            transactionInfo.receipt &&
              <tr>
                <th>Receipt Result</th>
                <td><Tag intent={transactionInfo.receipt.result === 'SUCCESS' ? Intent.SUCCESS : Intent.PRIMARY}>{transactionInfo.receipt.result}</Tag></td>
              </tr>
          }
          {
            transactionInfo.contractAddress &&
              <tr>
                <th>{tu("contract")}</th>
                <td>
                  <Address address={transactionInfo.contractAddress} />
                </td>
              </tr>
          }
          </tbody>
        </table>
        <Card className="p-0 m-2">
          <Navbar>
            {/* controlled mode & no panels (see h1 below): */}
            <Tabs
              id="tx-tabs"
              large={true}
              // style={{ height: null }}
              onChange={(tabId: string) => this.setState({ selectedTab: tabId })}
            >
              {
                pages.map(page => (
                  <Tab key={page.id} id={page.id} title={page.title} />
                ))
              }
            </Tabs>
          </Navbar>
          <Tabs className="hide-tabs" selectedTabId={this.state.selectedTab} id="tx-tabs">
            {
              pages.map(page => (
                <Tab key={page.id} id={page.id} title={page.title} panel={page.cmp} />
              ))
            }
          </Tabs>
        </Card>
      </div>
    );
  }

}
