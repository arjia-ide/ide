import "./App.css";
import "@blueprintjs/table/lib/css/table.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./styles/index.scss";
import "react-mosaic-component/react-mosaic-component.css";

import React, {Component} from "react";
import MainWrap from "./mainWrap";
import {IntlProvider} from "react-intl";
import {Provider} from "react-redux";
import {configureStore} from "./store";
import {HashRouter as Router} from "react-router-dom";

class App extends Component {

  constructor(props) {
    super(props);
    this.store = configureStore();
  }

  componentDidMount() {

    let previousAddress = null;
    let previousNode = null;

    setInterval(() => {

      if (window.tronWeb) {
        if (previousAddress !== window.tronWeb.defaultAddress.base58) {
          previousAddress = window.tronWeb.defaultAddress.base58;
          this.store.dispatch({ type: "refresh "});
          this.forceUpdate();
        }

        if (previousNode !== window.tronWeb.fullNode.host) {
          previousNode = window.tronWeb.fullNode.host;
          this.store.dispatch({ type: "refresh "});
          this.forceUpdate();
        }
      }

    }, 300);
  }

  render() {
    return (
      <Provider store={this.store}>
        <IntlProvider locale="en">
          <Router>
            <MainWrap/>
          </Router>
        </IntlProvider>
      </Provider>
    );
  }
}

export default App;
