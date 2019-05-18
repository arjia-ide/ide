import React from "react";
import {connect} from "react-redux";
import {activeNetworkSelector} from "../redux/config.selectors";

export function withNetwork(InnerComponent) {

  const wrappedComponent = class extends React.Component<any, any> {

    render() {

      return (
        <React.Fragment>
          <InnerComponent
            {...this.props}
            network={this.props.network}
            networks={this.props.networks}
            setActiveNetwork={this.props.setActiveNetwork}
          />
        </React.Fragment>

      );
    }
  };

  return connect(
    state => ({
      network: activeNetworkSelector(state),
      activeNetwork: state.config.activeNetwork,
      networks: state.config.networks,
    }),
    ({ config: { setActiveNetwork } }) => ({
      setActiveNetwork
    }),
    null,
    { pure: false },
  )(wrappedComponent);
}
