import React from "react";
import {connect} from "react-redux";
import {activeWalletSelector} from "../redux/config.selectors";

export function withWallet(InnerComponent) {

  const wrappedComponent = class extends React.Component<any, any> {

    state = {
      extensionAddress: null,
    };

    reloadWallet = () => {
      if (this.props.wallet) {
        this.props.reloadWallet(this.props.wallet.address);
      }
    };

    render() {

      return (
        <React.Fragment>
          <InnerComponent
            {...this.props}
            wallet={this.props.wallet}
            wallets={this.props.wallets}
            setActiveWallet={this.props.setActiveWallet}
            addWallet={this.props.addWallet}
            reloadWallet={this.reloadWallet}
          />
        </React.Fragment>

      );
    }
  };

  return connect(
    state => {
      return ({
        wallet: activeWalletSelector(state),
        wallets: state.config.wallets,
      })
    },
    ({ config: { setActiveWallet, addWallet, }, wallet: { reloadWallet } }) => ({
      setActiveWallet,
      addWallet,
      reloadWallet,
    }),
    null,
    { pure: false },
  )(wrappedComponent);
}
