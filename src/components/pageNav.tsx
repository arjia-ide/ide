import React from "react";
import {Button, Classes, Menu, MenuItem, OverflowList, Popover, Position} from '@blueprintjs/core';
import {withRouter} from "react-router";

class PageNav extends React.Component<any, any> {

  private renderOverflow = (items) => {
    const position =  Position.BOTTOM_RIGHT;
    return (
      <li>
        <Popover position={position}>
          <span className={Classes.BREADCRUMBS_COLLAPSED} />
          <Menu>{items.map(this.renderOverflowBreadcrumb)}</Menu>
        </Popover>
      </li>
    );
  };

  private renderOverflowBreadcrumb = (props, index: number) => {
    const isClickable = props.href != null || props.onClick != null;
    return <MenuItem disabled={!isClickable} {...props} text={props.text} key={index} />;
  };

  private renderBreadcrumbItem = ({ name, type, id, icon, url }) => {
    return (
      <Button text={name} minimal={true} icon={icon || 'code'} onClick={() => this.props.history.push('/' + url)} />
    );
  };

  private renderBreadcrumbWrapper = (props, index: number) => {
    return (
      <li key={index}>
        {this.renderBreadcrumbItem(props)}
      </li>
    );
  };


  render() {
    return (
      <nav className="bp3-navbar">
        <div className="bp3-navbar-group bp3-align-left">
          <OverflowList
            className="bp3-list-unstyled"
            visibleItemRenderer={this.renderBreadcrumbWrapper}
            overflowRenderer={this.renderOverflow}
            items={this.props.tabs} />
        </div>
      </nav>
    );
  }

}

export default withRouter(PageNav);
