import React from "react";
import {MosaicWindow} from "react-mosaic-component";

const NumberMosaicWindow = MosaicWindow.ofType<number>();

export function WidgetWrap({ title, wrap, createNode, children, path }) {
  return (
    <NumberMosaicWindow
      title={title}
      createNode={createNode}
      path={path}
    >
      <div className="widget-body">
        {children}
      </div>
    </NumberMosaicWindow>
  );
}
