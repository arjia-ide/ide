import React from "react";
import {asyncComponent} from "react-async-component";
import {Spinner} from "@blueprintjs/core";

export const CodeEditorAsync = asyncComponent({
  LoadingComponent: () => (
    <div className="mt-5 text-center">
      <Spinner />
    </div>
  ),
  resolve: () => new Promise(resolve =>
    import('./codeEditor').then(resolve)
  )
});
