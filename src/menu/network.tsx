import React, { useCallback } from "react";
import { Button, Intent, Menu, MenuDivider, MenuItem, Popover, Position } from "@blueprintjs/core";
import { useNetwork } from "../hooks/useNetwork";
import { useDispatch } from "react-redux";

export default function NetworkMenu() {

  const dispatch = useDispatch<any>();

  const changeNetwork = useCallback((networkId) => {
    dispatch.network.setActiveNetwork(networkId);
    dispatch.wallet.reloadWallet();
  }, []);

  const { networks, network } = useNetwork();

  return (
    <Popover content={
      <Menu>
        <MenuItem text={`Full:  ${network.fullNodeUrl}`}/>
        <MenuItem text={`Solidity: ${network.solidityNodeUrl}`}/>
        <MenuItem text={`Events: ${network.eventServerUrl}`}/>
        <MenuDivider/>
        {
          Object.values(networks).map((n: any) => (
            <MenuItem
              icon="globe-network"
              key={n.id}
              text={n.name}
              onClick={() => changeNetwork(n.id)}/>
          ))
        }
      </Menu>
    }
             position={Position.BOTTOM_RIGHT}>
      <Button icon="globe-network"
              rightIcon="caret-down"
              text={network.name}
              className="mr-2"
              intent={network.name === 'Shasta' ? Intent.SUCCESS : Intent.PRIMARY}/>
    </Popover>
  );
}
