import React, {Fragment} from "react";
import {withDialogs} from "../../hoc/withDialogs";
import {Button, FormGroup, InputGroup, Intent, Spinner} from "@blueprintjs/core";
import xhr from "axios";
import {copyWithConfirmation} from "../../utils/clipboard";
import {connect} from "react-redux";

@withDialogs
@connect(
  state => ({
    gitHubToken: state.config.gitHubToken,
  }),
  ({ config: { setGithubToken } }) => ({
    setGithubToken
  }),
)
export default class PublishGist extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      accessToken: props.gitHubToken,
    };
  }

  componentDidMount(): void {
    this.showAccessToken();
  }

  doPublish = async () => {
    this.props.showDialog({
      title: 'Publishing...',
      icon: 'git-push',
      body: (
        <p>
          <Spinner />
        </p>
      )
    });


    const { data } = await xhr.post('https://api.github.com/gists', this.props.gist, {
      headers: { Authorization: "token " + this.state.accessToken }
    });

    this.props.showDialog({
      title: 'Published Successfully!',
      icon: 'git-push',
      width: 600,
      body: (
        <p>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>Click the URL to copy to clipboard</div>
          <Button
            minimal={true}
            text={`Gist URL: ${data.html_url}`}
            icon="duplicate"
            onClick={() => copyWithConfirmation(data.html_url, "Copied Gist URL to clipboard")} />
          <Button
            minimal={true}
            icon="duplicate"
            text={`Arjia URL: http://arjia.city/editor?gist=${data.id}`}
            onClick={() => copyWithConfirmation(`http://arjia.city/editor?gist=${data.id}`, "Copied Arjia Project URL clipboard")} />
        </p>
      ),
      footer: (
        <Button
          text="OK"
          intent={Intent.SUCCESS}
          onClick={this.props.onClose}
        />
      )
    });

    this.props.onSuccess(data);
  };

  setAccessToken = (token) => {
    this.props.setGithubToken(token);
    this.doPublish();
  };

  showAccessToken = () => {

    this.props.showDialog({
      title: 'Publish Gist',
      icon: 'git-push',
      body: (
        <p>
          <FormGroup
            label="Token"
            labelFor="text-input"
            helperText={
              <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">
                Create new personal access token with <b>gist</b> permission
              </a>
            }
          >
            <InputGroup
              id="text-input"
              placeholder="asd434sa..."
              defaultValue={this.state.accessToken}
              onChange={ev => this.setState({ accessToken: ev.target.value })}/>
          </FormGroup>
        </p>
      ),
      footer: (
        <Fragment>
          <Button intent={Intent.NONE} text="Cancel" onClick={this.props.onClose} />
          <Button intent={Intent.SUCCESS}
                  text="Publish"
                  onClick={() => this.setAccessToken(this.state.accessToken)} />
        </Fragment>
      )
    });
  };

  render() {
    return (
      <div>

      </div>
    );
  }
}
