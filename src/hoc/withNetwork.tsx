import React, { ComponentType } from "react";
import { connect } from "react-redux";
import { activeNetworkSelector } from "../redux/config.selectors";

export function withNetwork<T extends ComponentType>(InnerComponent: T): T {

  const wrappedComponent = function WrappedComponent(props: any) {

    return (
      <React.Fragment>
        <InnerComponent
          {...props}
          network={props.network}
          networks={props.networks}
          setActiveNetwork={props.setActiveNetwork}
        />
      </React.Fragment>

    );
  };

  return connect(
    (state: any) => ({
      network: activeNetworkSelector(state),
      activeNetwork: state.config.activeNetwork,
      networks: state.config.networks,
    }),
    ({ config: { setActiveNetwork } }: any) => ({
      setActiveNetwork
    }),
    null,
    { pure: false },
  )(wrappedComponent) as any;
}
