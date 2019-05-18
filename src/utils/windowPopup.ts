import React from "react";
import ReactDOM from "react-dom";

function copyStyles(sourceDoc, targetDoc) {
  sourceDoc.querySelectorAll("style").forEach((styleSheet: any) => {
    if (styleSheet.innerText) { // for <style> elements
      const newStyleEl = sourceDoc.createElement('style');

      newStyleEl.appendChild(sourceDoc.createTextNode(styleSheet.innerText));

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) { // for <link> elements loading CSS from a URL
      const newLinkEl = sourceDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}

export default class WindowPopup extends React.PureComponent<any, any> {

  private containerEl: HTMLDivElement;
  private externalWindow: any;

  constructor(props) {
    super(props);
    // STEP 1: create a container <div>
    this.containerEl = document.createElement('div');
    this.externalWindow = null;
  }

  render() {
    // STEP 2: append props.children to the container <div> that isn't mounted anywhere yet
    return ReactDOM.createPortal(this.props.children, this.containerEl);
  }

  componentDidMount() {
    // STEP 3: open a new browser window and store a reference to it
    this.externalWindow = window.open('', '', 'width=600,height=400,left=200,top=200');
    this.externalWindow.addEventListener('beforeunload', () => {
      this.props.onClose();
    });

    // STEP 4: append the container <div> (that has props.children appended to it) to the body of the new window
    this.externalWindow.document.body.appendChild(this.containerEl);

    this.externalWindow.document.title = this.props.title;

    this.externalWindow.addEventListener('load', () => {
      copyStyles(document, this.externalWindow.document);
    });

  }

  componentWillUnmount() {
    // STEP 5: This will fire when this.state.showWindowPortal in the parent component becomes false
    // So we tidy up by closing the window
    this.externalWindow.close();
  }
}
