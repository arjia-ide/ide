import React from "react";
import {newId} from "../utils/common";
import {IActionHandler} from "../components/omnibar/actions/actionHandler";


const actions: { [key: string]: IActionHandler } = {};

export function getOmnibarHooks() {
  return Object.values(actions);
}

export function withOmnibarActions(InnerComponent): any {

  const id = newId();

  const wrappedComponent = class extends React.Component<any, any> {

    componentDidMount() {
      actions[id] = InnerComponent.prototype.getOmnibarActions(this.props);
    }

    componentWillUnmount() {
      delete actions[id];
    }

    render() {

      return (
        <React.Fragment>
          <InnerComponent {...this.props} />
        </React.Fragment>
      );
    }
  };

  return wrappedComponent;
}
