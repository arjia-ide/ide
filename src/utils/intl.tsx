import React from "react";
import {FormattedNumber} from "react-intl";

export function FormattedTRX(props) {
  return (
    <FormattedNumber {...props}
                     stye="decimal"
                     maximumFractionDigits={6}  />
  );
}
