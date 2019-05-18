import copy from "copy-to-clipboard";
import {TopToaster} from "./toast";
import {Intent} from "@blueprintjs/core";


export function copyWithConfirmation(contents: string, text: string, options = {}) {
  copy(contents);

  TopToaster.show({
    message: text,
    intent: Intent.SUCCESS,
    icon: 'duplicate',
    ...options
  });
}
