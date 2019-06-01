import * as React from "react";
import {connect} from "react-redux";
import {Button, ControlGroup, InputGroup, Intent, Navbar, NonIdealState, Spinner} from "@blueprintjs/core";
import {find, last} from "lodash";
import {withApi} from "../../hoc/withApi";
import {withSelectors} from "../../hoc/withSelectors";
import {TopToaster} from "../../utils/toast";

const CodeEditorAsync = React.lazy(() => import('./codeEditor'));

@withApi
@withSelectors(models => ({
  activeFileExtension: models.ide.activeFileExtension,
  activeFileCode: models.ide.activeFileCode,
}))
@connect(
  state => {
    return ({
      projects: state.ide.projects,
      activeProject: state.ide.projects[state.ide.activeProject],
      files: state.ide.projects[state.ide.activeProject].files,
      activeFile: state.ide.activeFile,
      latestDeployedContract: state.ide.latestContract,

      deployedContracts: state.ide.deployedContracts,
    })
  },
  ({ ide, omnibar }) => ({
    updateFile: ide.updateFile,
    addFile: ide.addFile,
    toggleOmnibar: omnibar.toggleOmnibar,
    setOmnibar: omnibar.setOmnibar,
  })
)
export default class Editor extends React.Component<any, any> {

  private monaco: any;
  private editor: any;

  public state = {
    language: 'sol',
    codeRunning: false,
    modal: null,
  };

  getEditorRange = (contents, start, end) => {

    const lines = contents.split("\n");
    let row = 0;

    let startPos = {
      row: 0,
      col: 0,
    };

    let endPos = {
      row: 0,
      col: 0,
    };

    for (let cursor = 0; ; lines.length > 0) {
      const line = lines.shift();
      if (start < cursor + line.length && cursor < start) {
        startPos = {row, col: (start - cursor)};
      }

      if (end < cursor + line.length && cursor < end) {
        endPos = {row, col: (end - cursor)};
        break;
      }

      cursor += line.length;
      row++;
    }

    return {
      startPos,
      endPos
    };
  };

  componentDidUpdate(prevProps: Readonly<any>): void {

    const {activeFileExtension} = this.props;

    if (activeFileExtension && prevProps.activeFileExtension) {
      if (activeFileExtension !== prevProps.activeFileExtension) {
        this.setState({
          language: this.getLanguage(activeFileExtension),
        });
      }
    }
  }

  getCurrentFile() {
    const {activeProject, activeFile} = this.props;
    return activeProject.files[activeFile];
  }

  getCurrentFileType() {

    const currentFile = this.getCurrentFile();
    if (!currentFile) {
      return 'sol';
    }

    return last(currentFile.name.split('.'));
  }


  editorDidMount = (editor, monaco) => {

    const { setOmnibar } = this.props;

    this.monaco = monaco;
    this.editor = editor;

    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_O, function(ev) {
      setOmnibar(true);
      ev.preventDefault();
    });
    editor.focus();
  };

  onChange = (newValue, e) => {
    const {activeProject, activeFile, updateFile} = this.props;

    updateFile({
      project: activeProject.id,
      file: activeFile,
      data: {
        contents: newValue
      }
    });
  };

  verify = async () => {

    const linter = await import('solhint/lib/index');

    const report = linter.processStr(this.getCode(), {
      'extends': 'default',
      rules: {
        'indent': false,
        'payable-fallback': false,
      },
    });

    const markers = report.messages.map(err => ({
      startLineNumber: err.line,
      endLineNumber: err.line,
      startColumn: err.column,
      endColumn: err.column,
      message: `${err.message} (${err.ruleId})`,
      severity: 3,
      source: 'linter',
    }));

    this.monaco.editor.setModelMarkers(this.editor.getModel(), 'solhint', markers);
  };

  getLanguage = (filename) => {
    if (!this.monaco || !filename) {
      return null;
    }

    const extension = "." + last(filename.split('.'));

    const language = find(this.monaco.languages.getLanguages(), l => l.extensions.indexOf(extension) !== -1);

    if (language) {
      return language.id;
    }

    return 'sol';
  };

  runJavascript = async () => {

    const {latestDeployedContract, deployedContracts} = this.props;

    this.setState({codeRunning: true});

    try {

      const messages = [];
      const log = (message) => messages.push(message);
      const tronWeb = this.props.getTronWeb();

      let contracts = {};

      for (let contract of deployedContracts) {
        contracts[contract.name] = contract.address;
      }

      await eval(`
        (async function() {
          const CONTRACT_ADDRESS = '${latestDeployedContract}'
          ${this.getCode()}
        })();
      `);

      if (messages.length > 0) {
        TopToaster.show({
          message: messages.join('\n'),
          intent: Intent.SUCCESS,
        });
      }

    } catch (e) {
      console.error(e);
      TopToaster.show({
        message: 'Error while running code: \n' + e.toString(),
        intent: Intent.DANGER,
        icon: 'error',
      });
    } finally {
      this.setState({codeRunning: false});
    }
  };

  getCode = () => {
    return this.getCurrentFile().contents;
  };

  renderFileTypeBar() {

    const {codeRunning} = this.state;

    switch (this.getCurrentFileType()) {
      case 'sol':
        return (
          <ControlGroup className="bp3-align-right">
            <Button text="Verify" icon="saved" onClick={this.verify} />
          </ControlGroup>
        );
      case 'js':
        return (
          <ControlGroup className="bp3-align-right">
            <Button text="Run" icon="play" onClick={this.runJavascript} loading={codeRunning} />
          </ControlGroup>
        );
    }

    return null;
  }

  public render() {

    const {activeProject} = this.props;
    const {language, modal} = this.state;

    const currentFile = this.getCurrentFile();

    return (
      <React.Fragment>
        {modal}
        <Navbar>
          <ControlGroup fill={true} className="bp3-align-left">
            {
              currentFile &&
                <InputGroup placeholder="Filename"
                  value={currentFile.name}
                  onChange={ev => this.props.updateFile({
                    project: activeProject.id,
                    file: currentFile.id,
                    data: { name: ev.target.value, },
                  })}
                />
            }
          </ControlGroup>
          {this.renderFileTypeBar()}
        </Navbar>
        {
          currentFile ?
            <React.Suspense
              fallback={
                <div className="mt-5 text-center">
                  <Spinner />
                </div>
              }>
              <CodeEditorAsync
                width="100%"
                height="calc(100% - 50px)"
                language={language}
                // theme="?vs-dark"
                value={this.props.activeFileCode}
                options={{
                  selectOnLineNumbers: true,
                  automaticLayout: true,
                  autoIndent: true,
                  fontSize: "12px",
                }}
                onChange={this.onChange}
                editorDidMount={this.editorDidMount}
              />
            </React.Suspense>:
            <NonIdealState
              icon="code"
              title="Please select a file"
              description="Select file to get started"
              action={
                <ControlGroup>
                  <Button
                    text="Create new file"
                    rightIcon="document-open"
                    onClick={() => this.props.addFile({
                      file: {
                        name: 'code.sol'
                      }
                    })}
                  />
                </ControlGroup>
              }
            />
        }
      </React.Fragment>
    );
  }
}

