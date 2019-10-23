import * as React from "react";
import {Classes} from '@blueprintjs/core';
import classNames from 'classnames';

import {Mosaic, MosaicNode, MosaicWindow, MosaicZeroState} from 'react-mosaic-component';
import {MosaicBranch} from "react-mosaic-component/src/types";

const NumberMosaic = Mosaic.ofType<number>();
const NumberMosaicWindow = MosaicWindow.ofType<number>();

export const THEMES = {
  ['Blueprint']: 'mosaic-blueprint-theme',
  ['Blueprint Dark']: classNames('mosaic-blueprint-theme', Classes.DARK),
  ['None']: '',
};

type Theme = keyof typeof THEMES;

export default class WidgetBase extends React.Component<any, any> {

  count: 0;

  state = {
    node: {}
  };

  constructor(props) {
    super(props);

    this.state = {
      node: props.node,
    };
  }

  renderTile = (count: number, path: MosaicBranch[]) => {

    const { title, cmp, widgetBodyProps = this.props.widgetBodyProps } = this.props.renderWidget(count);

    return (
      <NumberMosaicWindow
        // additionalControls={this.renderMoreButtons()}
        title={title}
        createNode={this.createNode}
        path={path}
        toolbarControls={<span/>}
      >
        <div className="widget-body" {...(widgetBodyProps || {})}>
          {cmp}
        </div>
      </NumberMosaicWindow>
    );
  }

  render() {

    const node = !!this.props.onChange ? this.props.node : this.state.node;

    return (
      <React.Fragment>
        <nav className="bp3-navbar">
          {this.props.menu}
        </nav>
        <NumberMosaic
          resize={{
            minimumPaneSizePercentage: 10,
          }}
          renderTile={this.renderTile}
          zeroStateView={<MosaicZeroState createNode={this.createNode} />}
          value={node}
          onChange={this.onChange}
          initialValue={null}
          className={THEMES.Blueprint}
        />
      </React.Fragment>
    );
  }

  private createNode: () => number = () => {
    return ++this.count;
  }

  private onChange = (currentNode: MosaicNode<number> | null) => {
    if (this.props.onChange) {
      this.props.onChange(currentNode);
    } else {
      this.setState({
        node: currentNode,
      });
    }
  }


}
