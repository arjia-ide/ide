import {
  AnchorButton,
  Button,
  Classes,
  Icon,
  Intent,
  Menu,
  MenuItem,
  Popover,
  PopoverInteractionKind,
  Position
} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import {Link, Route, Switch} from "react-router-dom";
import Index from "./components/functions";
import Widget from "./components/widget";
import ContractWidget from "./widgets/contract";
import TransactionViewer from "./widgets/transactionViewer";
import SolidityCode from "./widgets/editor";
import {withRouter} from "react-router";
import Home from "./components/home";
import OmnibarWidget from "./components/omnibar";
import {withNetwork} from "./hoc/withNetwork";
import {withWallet} from "./hoc/withWallet";
import WalletMenu from "./menu/wallet";
import NetworkMenu from "./menu/network";
import ContractEventsWidget from "./widgets/contractEvents";

export const THEMES = {
  ['Blueprint']: 'mosaic-blueprint-theme',
  ['Blueprint Dark']: classNames('mosaic-blueprint-theme', Classes.DARK),
  ['None']: '',
};

type Theme = keyof typeof THEMES;

export interface State {
  // currentNode: MosaicNode<number> | null;
  currentTheme: Theme;
  currentTab: number;
  tabs: { [key: string]: any };
}

@withRouter
@withNetwork
@withWallet
export default class MainWrap extends React.PureComponent<any, State> {

  state: State = {
    tabs: {
      1: {
        id: 1,
        name: 'Editor',
        url: 'editor',
        icon: 'code',
      },
      2: {
        id: 2,
        name: 'Functions',
        url: 'functions',
        icon: 'function',
      },
      3: {
        id: 3,
        name: 'Contract Functions',
        route: 'contract-functions/:id?',
        url: 'contract-functions',
        icon: 'code-block',
      },
      4: {
        id: 4,
        name: 'Contract Events',
        route: 'contract-events/:id?',
        url: 'contract-events',
        icon: 'code-block',
      },
      5: {
        id: 5,
        name: 'Transaction',
        route: 'transaction/:id?',
        url: 'transaction',
        icon: 'database',
      },
    },
    currentTheme: 'Blueprint',
    currentTab: 1,
  };

  private widgets: { [key: number]: Widget };

  constructor(props) {
    super(props);

    this.widgets = {
      1: new Widget("Code", SolidityCode),
      2: new Widget("Address Encoder/Decoder", Index),
      3: new Widget("Contract", ContractWidget),
      4: new Widget("Contract Events", ContractEventsWidget),
      5: new Widget("Transaction Viewer", TransactionViewer),
    }
  }

  componentDidMount(): void {
    this.props.reloadWallet();
  }


  refresh = () => {
    this.props.reloadWallet();
  };

  private renderNavBar() {

    const {tabs, currentTab} = this.state;
    const { history } = this.props;

    return (
      <nav className="bp3-navbar bp3-dark">
        <div className="bp3-navbar-group bp3-align-left">
          <div className="bp3-navbar-heading">
            <Link to="/">Arjia</Link>
          </div>
          {
            Object.entries(tabs).map(([tabId, tab]) => (
              <Button
                      key={tabId}
                      minimal={true}
                      text={tab.name}
                      icon={tab.icon}
                      intent={history.location.pathname.startsWith("/" + tab.url) ? Intent.PRIMARY : Intent.NONE}
                      onClick={() => history.push(`/${tab.url}`)} />
            ))
          }
          {/*<AnchorButton minimal={true}*/}
          {/*        text="Help"*/}
          {/*        icon="info-sign"*/}
          {/*        href="/documentation" />*/}
          <Popover
            content={
              <Menu className={Classes.ELEVATION_1}>
                <MenuItem icon="git-repo" text="Arjia Bug Tracker" href="https://github.com/Rovak/arjia/issues" target="_blank"  labelElement={<Icon icon="share" />} />
                <MenuItem icon="geosearch" text="Tronscan" href="https://www.tronscan.org" target="_blank"  labelElement={<Icon icon="share" />} />
                <MenuItem icon="code-block" text="SmartContract UI" href="http://tronsmartcontract.space" target="_blank"  labelElement={<Icon icon="share" />} />
                <MenuItem icon="grid" text="TronGrid" href="https://trongrid.io/" target="_blank"  labelElement={<Icon icon="share" />} />
                <MenuItem icon="train" text="TronStation" href="https://tronstation.io/" target="_blank"  labelElement={<Icon icon="share" />} />
              </Menu>
            }
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.BOTTOM}
            minimal={true}>
            <Button icon="link" text="Links" minimal={true} />
          </Popover>
          {/*<button className="bp3-button bp3-minimal bp3-icon-bank-account">Wallet</button>*/}
        </div>
        <div className="bp3-navbar-group bp3-align-right">
          <Button minimal={true} icon="refresh" onClick={this.refresh} />
          {/*<InputGroup placeholder="Search" />*/}
          {/*<button className="bp3-button bp3-minimal bp3-icon-notifications"></button>*/}
          {/*<button className="bp3-button bp3-minimal bp3-icon-cog"></button>*/}

          <WalletMenu />
          <NetworkMenu/>
        </div>
      </nav>
    );
  }

  render() {

    const { tabs } = this.state;

    return (
      <React.Fragment>
        <OmnibarWidget/>
        {this.renderNavBar()}
        <Switch>
          {
            Object.values(tabs).map(tab => (
              <Route
                key={tab.id}
                path={"/" + (tab.route || tab.url)}
                component={this.widgets[tab.id].buildComponent()} />
            ))
          }
          <Route component={Home} />
        </Switch>
      </React.Fragment>
    );
  }
}
