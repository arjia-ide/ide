import React from "react";
import {Button, Classes, Dialog, InputGroup, Intent} from "@blueprintjs/core";

export default class Prompt extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };
  }

  onKeyDown = (ev) => {
    if (ev.keyCode === 13) {
      this.props.onConfirm(this.state.value);
    }
  }

  render() {
    return (
      <Dialog
        title={this.props.title}
        isOpen={true}
      >
        <div className={Classes.DIALOG_BODY}>
          <InputGroup value={this.state.value}
                      onKeyDown={this.onKeyDown}
                      onChange={ev => this.setState({ value: ev.target.value })}
                      autoFocus={true}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button intent={Intent.NONE} text="Cancel" onClick={this.props.onCancel} />
            <Button intent={Intent.SUCCESS} text="Confirm" onClick={() => this.props.onConfirm(this.state.value)} />
          </div>
        </div>
      </Dialog>
    );
  }
}
