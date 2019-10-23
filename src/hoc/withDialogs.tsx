import React from "react";
import Prompt from "../dialogs/prompt";
import {Alert, Classes, Dialog, Intent} from "@blueprintjs/core";

export function withDialogs(InnerComponent): any {

  return class extends React.Component<any, any> {

    state = {
      modal: null,
    };

    constructor(props) {
      super(props);
    }

    handleClose = () => {
      this.setState({
        modal: null,
      });
    }

    prompt = (title, value = "") => {
      return new Promise((resolve, reject) => {
        this.setState({
          modal: (
            <Prompt
              title={title}
              value={value}
              onCancel={() => {
                this.handleClose();
                reject();
              }}
              onConfirm={name => {
                resolve(name);
                this.handleClose();
              }}
            />
          )
        });
      });
    }

    confirmDelete = ({ title = 'Confirm Delete', icon = 'trash', body = '', cancelText = 'Cancel', confirmText = 'Delete' }) => {
      return new Promise((resolve) => {
        this.setState({
          modal: (
            <Alert
              canEscapeKeyCancel={true}
              cancelButtonText={cancelText}
              confirmButtonText={confirmText}
              // @ts-ignore
              icon={icon}
              intent={Intent.DANGER}
              isOpen={true}
              onCancel={() => {
                resolve(false);
                this.handleClose();
              }}
              onConfirm={() => {
                resolve(true);
                this.handleClose();
              }}
            >
              {body}
            </Alert>
          )
        });
      });
    }

    dialog = ({
                icon = '',
                title = '',
                body = null,
                footer = null,
      width = 500
    }) => {
      this.setState({
        modal: (
          <Dialog
            // @ts-ignore
            icon={icon}
            onClose={this.handleClose}
            title={title}
            usePortal={true}
            isOpen={true}
            style={{ width }}
          >
            <div className={Classes.DIALOG_BODY}>
              {body}
            </div>
            {
              footer &&
                <div className={Classes.DIALOG_FOOTER}>
                  <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    {footer}
                  </div>
                </div>
            }
          </Dialog>
        )
      });
    }

    render() {

      return (
        <React.Fragment>
          {this.state.modal}
          <InnerComponent
            prompt={this.prompt}
            confirmDelete={this.confirmDelete}
            showDialog={this.dialog}
            closeDialog={this.handleClose}
            {...this.props}
          />
        </React.Fragment>
      );
    }
  };
}
