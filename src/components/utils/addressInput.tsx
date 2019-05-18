import React from "react";
import {ItemRenderer, Suggest} from "@blueprintjs/select";
import {MenuItem} from "@blueprintjs/core";
import {connect} from 'react-redux';
import {isAddress} from "@trx/core/dist/utils/utils"


interface Address {
  address: string;
}

interface AddressInputProps {
  onValidAddress?: (string) => void;
  onChange?: (string) => void;
  favoriteAddresses?: { [key: string]: any }
}

const AddressSuggestion = Suggest.ofType<Address>();

const renderItem: ItemRenderer<Address> = (address, { handleClick, modifiers, query }) => {
  if (!modifiers.matchesPredicate) {
    return null;
  }

  return (
    <MenuItem
      active={modifiers.active}
      disabled={modifiers.disabled}
      label={'Contract'}
      key={address.address}
      onClick={handleClick}
      text={address.address}
    />
  );
};


@connect(
  state => ({
    favoriteAddresses: state.favorites.addresses,
  }),
)
export default class AddressInput extends React.Component<AddressInputProps, any> {

  state: any = {
    query: '',
  };

  constructor(props) {
    super(props);

  };

  componentDidMount() {

  }

  onItemSelect = (address) => {
    this.onValueChange(address.address);
  };

  onValueChange = (address) => {
    const { onChange } = this.props;

    onChange && onChange(address);

    this.setState({ query: address, });

    if (isAddress(address)) {
      this.onValidAddress(address);
    }
  };

  onValidAddress = (address) => {
    const { onValidAddress } = this.props;

    onValidAddress && onValidAddress(address);
  };

  render() {

    const {query} = this.state;

    return (
      <div>
        <AddressSuggestion
          items={Object.values(this.props.favoriteAddresses)}
          query={query}
          onQueryChange={ev => this.onValueChange(ev)}
          itemRenderer={renderItem}
          onItemSelect={this.onItemSelect}
          noResults={null}
          inputValueRenderer={address => address.address}
          popoverProps={{ minimal: true}}
        />
      </div>
    )
  }

}
