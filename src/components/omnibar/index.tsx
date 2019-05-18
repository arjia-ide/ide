import * as React from "react";
import {withRouter} from "react-router";

import {Hotkey, Hotkeys, HotkeysTarget, MenuItem,} from "@blueprintjs/core";
import {ItemRenderer, Omnibar} from "@blueprintjs/select";
import {IAction} from "./action";
import {IActionHandler} from "./actions/actionHandler";
import AddressActions from "./actions/address";
import TransactionActions from "./actions/address";
import {connect} from "react-redux";
import {getOmnibarHooks} from "../../hoc/withOmnibarActions";
import NavigationActions from "./actions/navigator";


const AppOmnibar = Omnibar.ofType<IAction>();

export interface IOmnibarExampleState {
  resetOnSelect: boolean;
  items: IAction[];
}

const renderItem: ItemRenderer<IAction> = (action, { handleClick, modifiers, query }) => {

  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={action.label}
      key={action.name}
      onClick={handleClick}
      text={action.name}
    />
  );
};

@withRouter
@connect(
  state => ({
    isOpen: state.omnibar.isOpen,
  }),
  ({ omnibar }) => ({
    toggleOmnibar: omnibar.toggleOmnibar,
    setOmnibar: omnibar.setOmnibar,
  }),
)
@HotkeysTarget
export default class OmnibarWidget extends React.PureComponent<any, IOmnibarExampleState> {

  public state: IOmnibarExampleState = {
    resetOnSelect: true,
    items: [],
  };

  private readonly actions: IAction[];
  private readonly handlers: IActionHandler[];

  constructor(props) {
    super(props);

    this.handlers = [
      new AddressActions(),
      new TransactionActions(),
      new NavigationActions(),
    ];

    this.actions = [];
  }

  public renderHotkeys() {
    return (
      <Hotkeys>
        <Hotkey
          global={true}
          combo="shift + o"
          label="Show Omnibar"
          onKeyDown={this.handleToggle}
          preventDefault={true}
        />
        <Hotkey
          global
          combo="ctrl + o"
          label="Show Omnibar"
          onKeyDown={this.handleToggle}
          preventDefault={true}
        />
      </Hotkeys>
    );
  }

  onItemList = (query: string, items: IAction[]) => {

    if (query.length === 0) {
      return items;
    }

    for (let handler of this.handlers.concat(getOmnibarHooks())) {
      if (handler.canHandle(query, items)) {
        return handler.onItemsList(query, items);
      }
    }

    for (let handler of this.handlers.concat(getOmnibarHooks())) {
      if (handler.canProvide(query, items)) {
        items = handler.onItemsList(query, items);
      }
    }

    return items;
  };

  public render() {
    return (
      <React.Fragment>
        <AppOmnibar
          {...this.state}
          isOpen={this.props.isOpen}
          items={this.actions}
          itemRenderer={renderItem}
          itemListPredicate={this.onItemList}
          // noResults={<MenuItem disabled={true} text="No results." />}
          onItemSelect={this.handleItemSelect}
          onClose={this.handleClose}
        />
      </React.Fragment>
    );
  }

  private handleClick = (_event: React.MouseEvent<HTMLElement>) => {
    this.props.setOmnibar(true);
  };

  private handleItemSelect = (film: IAction) => {

    const {history} = this.props;

    this.props.setOmnibar(false);

    film.run({
      navigateTo(url) {
        history.push(url);
      }
    });
  };

  private handleClose = () => this.props.setOmnibar(false);

  private handleToggle = () => this.props.toggleOmnibar();
}
