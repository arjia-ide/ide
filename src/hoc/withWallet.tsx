import React, { ComponentType } from "react";
import { useWallet } from "../hooks/useWallet";

export function withWallet<T extends ComponentType>(InnerComponent: T): T {

  // @ts-ignore
  return function Component(props: any) {

    const walletFuncs: any = useWallet();

    return (
      <React.Fragment>
        <InnerComponent
          {...props}
          {...walletFuncs}
        />
      </React.Fragment>

    ) as any;
  };
}
