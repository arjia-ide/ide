import React from "react";
import {withWallet} from "./withWallet";
import {withNetwork} from "./withNetwork";
import TronWeb from "tronweb";

export function withApi(InnerComponent) {

  const wrappedComponent = class extends React.Component<any, any> {

    getTronWeb = () => {
      const { network, wallet, activeNetwork } = this.props;

      // @ts-ignore
      if (activeNetwork === 'extension' && window.tronWeb) {
        // @ts-ignore
        return window.tronWeb;
      }

      let privateKey = false;

      if (wallet) {
        privateKey = wallet.privateKey;
      }

      return new TronWeb(
        network.fullNodeUrl,
        network.solidityNodeUrl,
        network.eventServerUrl,
        privateKey);
    };

    render() {

      return (
        <React.Fragment>
          <InnerComponent
            getTronWeb={this.getTronWeb}
            {...this.props}
          />
        </React.Fragment>

      );
    }
  };

  return withWallet(withNetwork((wrappedComponent)));
}
