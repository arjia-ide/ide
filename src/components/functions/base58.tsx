import React, {useState} from "react";
import {FormGroup, TextArea} from "@blueprintjs/core";
import {Try} from "../../utils/error";
import TronWeb from "tronweb";
import {Intent} from "@blueprintjs/core/lib/esm/common/intent";


export function Base58Func() {

  const [base58, setBase58] = useState("");
  const [hex, setHex] = useState("");

  console.log("base", base58, hex);

  return (
    <div className="container py-3">
      <h2>Base58 Encoder / Decoder</h2>
      <p>
        Simply paste the address in the hex or base58 field and the value will be converted
      </p>
      <div className="row mt-3">
        <div className="col-sm-6">
          <FormGroup
            label="Base58 Encoded Address"
            helperText="Example: TV9QitxEJ3pdiAUAfJ2QuPxLKp9qTTR3og"
          >
            <TextArea
              large={true}
              fill={true}
              style={styles.inputTextArea}
              intent={Intent.PRIMARY}
              onChange={ev => {
                console.log("ev", ev);
                setBase58(ev.target.value);
                setHex(Try(() => TronWeb.address.toHex(ev.target.value), ""));
              }}
              value={base58}
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup
            label="Hex Encoded Address"
            helperText="Example: 41D25855804E4E65DE904FAF3AC74B0BDFC53FAC76"
          >
            <TextArea
              large={true}
              style={styles.inputTextArea}
              fill={true}
              intent={Intent.PRIMARY}
              placeholder=""
              value={hex}
              onChange={ev => {
                setBase58(Try(() => TronWeb.address.fromHex(ev.target.value), ""));
                setHex(ev.target.value);
              }}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}


Base58Func.category = "Converters";
Base58Func.title = "Base58";


const styles = {
  inputTextArea: {
    height: 300,
  },
};
