import React, { useEffect, useState } from "react";
import { useStore } from "react-redux";


export function withSelectors(func): any {

  return (InnerComponent) => {

    let selection = null;

    return function Component(props: any) {

      // tslint:disable-next-line:no-emptyconst store: any = useStore();
      const store: any = useStore();

      if (!selection) {
        selection = store.select(func);
      }

      const selectors = !!selection ? selection(store.getState()) : {};

      return (
        <InnerComponent
          {...selectors}
          {...props}
        />
      );
    };
  };
}
