import React from "react";
import {Button, Card, IconName, MaybeElement, Popover, Tag} from "@blueprintjs/core";
import copy from 'copy-to-clipboard';

interface TxHashProps {
  hash: string;
  icon?: IconName | MaybeElement;
}

export default class TxHash extends React.Component<TxHashProps, any> {

  constructor(props) {
    super(props);

    this.state = {};
  }

  copy = () => {
    copy(this.props.hash);
  }

  buildPopup = () => {

    const { hash } = this.props;

    return (
      <Card>
        <p>
          <a href={`https://tronscan.org/#/transaction/${hash}`} target="_blank">{hash}</a>
          <Button
            icon="duplicate"
            onClick={this.copy}
            minimal={true}
            small={true}
          />
        </p>
        <p>{hash}</p>
      </Card>
    );
  }


  render() {

    const { hash, icon = null, ...tagProps } = this.props;

    return (
      <Popover content={this.buildPopup()}>
          <Tag
            icon={icon}
            interactive={true}
            {...tagProps}
          >
            {hash}
          </Tag>
      </Popover>

    );
  }
}
