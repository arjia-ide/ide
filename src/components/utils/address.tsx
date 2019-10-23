import React from "react";
import {AnchorButton, Button, ButtonGroup, Card, Popover, Tag} from "@blueprintjs/core";
import {addressFromHex, addressToHex} from "@trx/core/dist/utils/address";
import {connect} from 'react-redux';
import {Try} from "../../utils/error";
import {withApi} from "../../hoc/withApi";
import {copyWithConfirmation} from "../../utils/clipboard";


// @ts-ignore
@withApi
class Address extends React.Component<any, any> {

  getEventUrl = () => {
    return this.props.network.fullNodeUrl;
  }

  buildPopup = () => {

    const {
      address,
      icon = null,
      favoriteAddresses,
      deleteFavoriteAddress,
      addFavoriteAddress
    } = this.props;

    const base58Address = Try(() => addressFromHex(address));

    return (
      <Card>
        <p>
          <a href={`https://tronscan.org/#/address/${base58Address}`} target="_blank">{base58Address}</a>
          <Button icon="duplicate" onClick={() => copyWithConfirmation(address, `${address} copied`)} minimal={true} small={true} />
        </p>
        <p>Hex: {address && Try(() => addressToHex(address))}</p>
        <ButtonGroup style={{ minWidth: 200 }}>
          <AnchorButton
            icon="function"
            href={`https://tronsmartcontract.space/#/interact/${base58Address}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Functions
          </AnchorButton>
          <AnchorButton
            icon="timeline-events"
            href={`${this.getEventUrl()}/event/contract/${base58Address}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            Events
          </AnchorButton>
          <Button
            icon="star"
            active={!!favoriteAddresses[base58Address]}
            onClick={() => !!favoriteAddresses[base58Address] ? deleteFavoriteAddress(base58Address) : addFavoriteAddress(base58Address)}/>
        </ButtonGroup>
      </Card>
    );
  }


  render() {

    const { address, icon = null, ...tagProps } = this.props;

    return (
      <Popover content={this.buildPopup()}>
          <Tag
            icon={icon}
            interactive={true}
            {...tagProps}
          >
            {addressFromHex(address)}
          </Tag>
      </Popover>

    );
  }
}

export default connect(
  (state: any) => ({
    favoriteAddresses: state.favorites.addresses,
  }),
  ({ favorites: { addFavoriteAddress, deleteFavoriteAddress } }: any) => ({
    addFavoriteAddress,
    deleteFavoriteAddress
  })
)(Address);
