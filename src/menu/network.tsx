import React from "react";
import {Button, Intent, Menu, MenuDivider, MenuItem, Popover, Position} from "@blueprintjs/core";
import {withWallet} from "../hoc/withWallet";
import {withNetwork} from "../hoc/withNetwork";

@withNetwork
@withWallet
export default class NetworkMenu extends React.Component<any, any> {

  changeNetwork = (networkId) => {
    this.props.setActiveNetwork(networkId);
    this.props.reloadWallet();
  };

  render() {

    const { network } = this.props;

    return (
      <Popover content={
        <Menu>
          <MenuItem text={`Full:  ${network.fullNodeUrl}`}/>
          <MenuItem text={`Solidity: ${network.solidityNodeUrl}`}/>
          <MenuItem text={`Events: ${network.eventServerUrl}`}/>
          <MenuDivider/>
          {
            Object.values(this.props.networks).map((network: any) => (
              <MenuItem
                icon="globe-network"
                key={network.id}
                text={network.name}
                onClick={() => this.changeNetwork(network.id)} />
            ))
          }
        </Menu>
      }
               position={Position.BOTTOM_RIGHT}>
        <Button icon="globe-network"
                rightIcon="caret-down"
                text={this.props.network.name}
                className="mr-2"
                intent={this.props.network.name === 'Shasta' ? Intent.SUCCESS : Intent.PRIMARY} />
      </Popover>
    );
  }
}
