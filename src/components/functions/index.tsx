import React from "react";
import {Menu, MenuDivider, MenuItem} from "@blueprintjs/core";
import * as Funcs from "./funcs";
import {groupBy} from "lodash";
import {Switch, Route, withRouter} from "react-router";

@withRouter
export default class FunctionsWidget extends React.Component<any, any> {

  private functions: any[];

  constructor(props) {
    super(props);

    this.functions = [];

    for (const [name, cmp] of Object.entries(Funcs)) {
      this.functions.push({
        category: cmp.category,
        name: cmp.title || name,
        cmp,
      });
    }
  }

  renderMenu() {
    const categories = Object.entries(groupBy(this.functions, func => func.category)).map(([category, items]) => {
      return {
        name: category,
        items,
      };
    });

    return categories.map(category => (
      <React.Fragment>
        <MenuDivider title={category.name} />
        {
          category.items.map(item => (
            <MenuItem
              text={item.name}
              onClick={() => this.props.history.push(`/functions/${item.category}/${item.name}`.toLowerCase())}
            />
          ))
        }
      </React.Fragment>
    ));
  }

  render() {

    return (
      <div className="d-flex flex-row flex-1">
        <Menu style={{ borderRight: '1px solid #EEE' }}>
          {this.renderMenu()}
        </Menu>
        <div className="flex-1">
          <Switch>
            {
              this.functions.map(func => (
                <Route
                  path={`/functions/${func.category}/${func.name}`.toLowerCase()}
                  component={func.cmp}
                />
              ))
            }
          </Switch>
        </div>
      </div>
    );
  }

}
