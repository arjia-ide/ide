import React, {useState} from "react";
import {FormGroup, TextArea} from "@blueprintjs/core";
import {Try} from "../../utils/error";
import TronWeb from "tronweb";
import {Intent} from "@blueprintjs/core/lib/esm/common/intent";


export function Utf8Func() {

  const [base58, setBase58] = useState("");
  const [toValue, setTo] = useState("");

  return (
    <div className="container py-3">
      <h2>UTF8 Encoder / Decoder</h2>
      <p>
        Simply paste the text in the plain or ascii field and the value will be converted
      </p>
      <div className="row mt-3">
        <div className="col-sm-6">
          <FormGroup
            label="UTF8 encoded text"
          >
            <TextArea
              large={true}
              fill={true}
              style={styles.inputTextArea}
              intent={Intent.PRIMARY}
              onChange={ev => {
                setBase58(ev.target.value);
                setTo(Try(() => TronWeb.toUtf8(ev.target.value), ""));
              }}
              value={base58}
            />
          </FormGroup>
        </div>
        <div className="col-sm-6">
          <FormGroup
            label="UTF8 decoded text"
          >
            <TextArea
              large={true}
              style={styles.inputTextArea}
              fill={true}
              intent={Intent.PRIMARY}
              placeholder=""
              value={toValue}
              onChange={ev => {
                setBase58(Try(() => TronWeb.fromUtf8(ev.target.value), ""));
                setTo(ev.target.value);
              }}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
}


Utf8Func.category = "Converters";
Utf8Func.title = "UTF8";


const styles = {
  inputTextArea: {
    height: 300,
  },
};
