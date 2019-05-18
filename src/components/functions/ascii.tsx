import React, {useState} from "react";
import {FormGroup, TextArea} from "@blueprintjs/core";
import {Try} from "../../utils/error";
import TronWeb from "tronweb";
import {Intent} from "@blueprintjs/core/lib/esm/common/intent";


export function AsciiFunc() {

  const [ascii, setAscii] = useState("");
  const [toValue, setTo] = useState("");

  return (
    <div className="container py-3">
      <h2>ASCII Encoder / Decoder</h2>
      <p>
        Simply paste the text in the plain or ascii field and the value will be converted
      </p>
      <div className="row mt-3">
        <div className="col-sm-6">
          <FormGroup
            label="ASCII encoded Address"
          >
            <TextArea
              large={true}
              fill={true}
              style={styles.inputTextArea}
              intent={Intent.PRIMARY}
              onChange={ev => {
                setAscii(ev.target.value);
                setTo(Try(() => TronWeb.toAscii(ev.target.value), ""));
              }}
              value={ascii}
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup
            label="Plain Text"
          >
            <TextArea
              large={true}
              style={styles.inputTextArea}
              fill={true}
              intent={Intent.PRIMARY}
              placeholder=""
              value={toValue}
              onChange={ev => {
                setAscii(Try(() => TronWeb.fromAscii(ev.target.value), ""));
                setTo(ev.target.value);
              }}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  )
}


AsciiFunc.category = "Converters";
AsciiFunc.title = "ASCII";


const styles = {
  inputTextArea: {
    height: 300,
  },
};
