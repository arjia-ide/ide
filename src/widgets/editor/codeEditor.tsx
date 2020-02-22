import React from "react";
import MonacoEditor from "react-monaco-editor";

export default class CodeEditor extends React.Component<any, any> {

  render() {
    return (
      <MonacoEditor {...this.props} />
    );
  }
}
