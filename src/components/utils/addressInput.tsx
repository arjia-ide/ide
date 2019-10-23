import React, { useCallback, useState } from "react";
import { ItemRenderer, Suggest } from "@blueprintjs/select";
import { MenuItem } from "@blueprintjs/core";
import { useSelector } from 'react-redux';
import {isAddress} from "@trx/core/dist/utils/utils";

interface Address {
  address: string;
}

interface AddressInputProps {
  onValidAddress?: (x) => void;
  onChange?: (x) => void;
}

const AddressSuggestion = Suggest.ofType<Address>();

const renderItem: ItemRenderer<Address> = (address, { handleClick, modifiers }) => {
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

export default function AddressInput({
  onChange = (address: string) => null,
  onValidAddress = (address: string) => null,
}: AddressInputProps) {

  const [query, setQuery] = useState("");
  const favoriteAddresses = useSelector(({ favorites }) => favorites.addresses);

  const onValueChange = useCallback((address) => {

    onChange(address);
    setQuery(address);

    if (isAddress(address)) {
      onValidAddress(address);
    }
  }, []);


  return (
    <div>
      <AddressSuggestion
        items={Object.values(favoriteAddresses)}
        query={query}
        onQueryChange={onValueChange}
        itemRenderer={renderItem}
        onItemSelect={(address) => onValueChange(address.address)}
        noResults={null}
        inputValueRenderer={address => address.address}
        popoverProps={{ minimal: true }}
      />
    </div>
  );
}
