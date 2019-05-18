import React from "react";
import {ReactReduxContext} from "react-redux";


export function withSelectors(func): any {

  // console.log("withSelectors", InnerComponent);

  return (InnerComponent) => {

    const wrappedComponent = class extends React.Component<any, any> {
      private selection: any;

      render() {

        return (
          <ReactReduxContext.Consumer>
            {
              ({ store }) => {
                if (!this.selection) {
                  this.selection = store.select(func);
                }

                let selectors = {};

                if (this.selection) {
                  // const selection = this.context.store.select(func);
                  selectors = this.selection(store.getState());
                }

                return (
                  <InnerComponent
                    {...selectors}
                    {...this.props}
                  />
                )
              }
            }
          </ReactReduxContext.Consumer>

        );
      }
    };

    return wrappedComponent;
  }
}
