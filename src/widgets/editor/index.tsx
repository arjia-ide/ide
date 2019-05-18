import React, {Fragment} from "react";
import {code as ExampleCode} from "./exampleCode";
import {
  Button,
  Classes,
  ControlGroup,
  Dialog,
  Divider,
  FormGroup,
  InputGroup,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  NumericInput,
  Popover,
  Spinner,
  Switch
} from "@blueprintjs/core";
import TronWeb from "tronweb";
import {connect} from "react-redux";
import {filter, flatMap, trim} from "lodash";
import * as BrowserSolc from "../../utils/solc";
import TransactionDetails from "../../components/transactionDetails";
import WidgetBase from "../widgetBase";
import FileBrowser from "./fileBrowser";
import Editor from "./editor";
import GithubImporter from "../../services/githubImporter";
import {newId} from "../../utils/common";
import queryString from 'query-string';
import {withRouter} from "react-router";
import {TopToaster} from "../../utils/toast";
import {withDialogs} from "../../hoc/withDialogs";
import {withApi} from "../../hoc/withApi";
import PublishGist from "../../components/github/publishGist";
import Deployment from "./deployment";
import {trolcSolcVersion, tronSolcUrl} from "./compiler/tronSolc";
import Structure from "./structure";
import {withOmnibarActions} from "../../hoc/withOmnibarActions";
import {IActionHandler} from "../../components/omnibar/actions/actionHandler";
import {IAction} from "../../components/omnibar/action";

const PANEL_CODE = 1;
const PANEL_FILES = 2;
const PANEL_DEPLOYMENT = 3;
const PANEL_STRUCTURE = 4;

@withApi
@withDialogs
@withRouter
@connect(
  state => ({
    projects: state.ide.projects,
    activeProject: state.ide.projects[state.ide.activeProject],
    files: state.ide.projects[state.ide.activeProject].files,
    activeFile: state.ide.activeFile,
    panelVisibility: state.ide.panels,
  }),
  ({ ide }) => ({
    updateFile: ide.updateFile,
    addFile: ide.addFile,
    changeProjectName: ide.changeProjectName,
    addProject: ide.addProject,
    setActiveProject: ide.setActiveProject,
    deleteProject: ide.deleteProject,
    setLatestContract: ide.setLatestContract,
    setCompileOutput: ide.setCompileOutput,
    setPanelVisibility: ide.setPanelVisibility,
  }),
  null,
  { pure: false },
)
@withOmnibarActions
export default class SolidityCode extends React.Component<any, any> {

  constructor(props) {
    super(props);

    this.state = {
      code: ExampleCode,
      output: null,
      selectedContract: null,
      loadingDeploy: false,
      loadingCompile: false,
      deployOptions: {
        originEnergyLimit: 10000000,
        feeLimit: 1000000000,
        userFeePercentage: 0,
      },
      node: {},
      panels: {
        structure: false,
        deployment: false,
      },
      solidityVersion: trolcSolcVersion,
      soljsonReleases: {},
    };

    // @ts-ignore
    this.state.node = this.buildPanels(this.state.panels);
  };

  getOmnibarActions({ addFile }): IActionHandler {
    return {
      canHandle: (query: string, items: IAction[]) => false,
      canProvide: (query: string, items: IAction[]) => true,
      onItemsList: (query: string, items: IAction[]) => {
        return [
          {
            name: 'Add File',
            run: () => {
              addFile({
                file: {
                  contents: '',
                  name: 'file.sol'
                }
              });
            }
          }
        ];
      }
    };
  };

  componentDidMount() {
    // @ts-ignore
    BrowserSolc.getVersions((soljsonSources, soljsonReleases) => {

      for (let versionNumber of Object.keys(soljsonReleases)) {
        soljsonReleases[versionNumber] = `https://ethereum.github.io/solc-bin/bin/${soljsonReleases[versionNumber]}`;
      }

      soljsonReleases[trolcSolcVersion] = tronSolcUrl;

      this.setState({ soljsonReleases, });
    });

    const { gist } = queryString.parse(this.props.location.search);

    if (gist) {
      this.importGistUrl(gist);
    }
  }

  getTronWeb() {
    return this.props.getTronWeb();
  }

  loadVersion = (version) => {
    return new Promise(resolve => {
      // @ts-ignore
      BrowserSolc.loadScriptVersion(version, resolve);
    });
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

  compile = async () => {

    const {solidityVersion, soljsonReleases} = this.state;
    const {files} = this.props;

    let sources = {};


    function findImports(path) {
      if (sources[path]) {
        return sources[path];
      }

      return {error: `File ${path} not found`};
    }

    try {

      this.setState({loadingCompile: true});


      let fileList: any = Object.values(files);

      for (let file of fileList) {
        if (file.name.endsWith(".sol")) {
          sources[file.name] = {
            content: file.contents,
          };
        }
      }

      const solc: any = await this.loadVersion(soljsonReleases[solidityVersion]);

      console.log("SOLC", solc);

      const input = {
        language: 'Solidity',
        sources,
        settings: {
          outputSelection: {
            '*': {
              '*': ['*']
            }
          }
        }
      };

      const output = JSON.parse(solc.compile(JSON.stringify(input), findImports));

      const errors = filter(output.errors, error => error.severity === 'error');

      if (errors && errors.length > 0) {
        TopToaster.show({
          icon: 'error',
          message: errors.map(error => error.formattedMessage).join('\n'),
          intent: Intent.DANGER,
        });

      } else {
        TopToaster.show({
          icon: 'saved',
          message: 'Compilation finished',
          intent: Intent.SUCCESS,
        });

        this.setState({ output });
        this.props.setCompileOutput(output);
      }

    } catch (e) {
      console.error(e);
      TopToaster.show({
        icon: 'error',
        message: e.toString(),
        intent: Intent.DANGER,
      });
    } finally {
      this.setState({
        loadingCompile: false
      });
    }
  };

  deployContract = async () => {

    const {output, selectedContract} = this.state;

    this.setState({
      loadingDeploy: true,
    });

    this.renderLoadingDeployment();

    const [file, contractName] = selectedContract.split(";");

    try {
      const contract = output.contracts[file][contractName];

      const tronWeb = this.getTronWeb();

      const tx = await tronWeb.transactionBuilder.createSmartContract({
        abi: contract.abi,
        bytecode: '0x' + contract.evm.bytecode.object,
        name: selectedContract,
        originEnergyLimit: 10000000,
        feeLimit: 1000000000,
        userFeePercentage: 100,
        ...this.state.deployOptions,
      }, tronWeb.defaultAddress.hex);

      const signedTx = await tronWeb.trx.sign(tx);
      await tronWeb.trx.sendRawTransaction(signedTx);

      const transactionInfo = await tronWeb.trx.getTransaction(signedTx.txID);

      this.renderDeploymentSuccess(
        TronWeb.address.fromHex(transactionInfo.contract_address),
        signedTx.txID
      );

      this.props.setLatestContract(transactionInfo.contract_address);

      this.setState({
        latestDeployedContract: transactionInfo.contract_address,
      });

    } catch (e) {

      TopToaster.show({
        icon: 'error',
        message: e,
        intent: Intent.DANGER,
      });
      this.handleClose();
    } finally {
      this.setState({loadingDeploy: false});
    }
  };

  handleClose = () => {
    this.setState({
      modal: null,
      events: [],
    });
  };


  setDeployOption = (options) => {
    this.setState(prevState => ({
      deployOptions: {
        ...prevState.deployOptions,
        ...options,
      }
    }));
  };

  renderLoadingDeployment = () => {
    this.setState({
      modal: (
        <Dialog
          icon="function"
          onClose={this.handleClose}
          title={`Deploy Contract`}
          usePortal={true}
          isOpen={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <h2 style={{textAlign: 'center'}}>Deploying contract...</h2>
            <Spinner/>
          </div>
        </Dialog>
      )
    })
  };

  renderDeploymentSuccess = (contractAddress, txId) => {
    this.setState({
      modal: (
        <Dialog
          icon="function"
          onClose={this.handleClose}
          title={`Deploy Transaction Result`}
          usePortal={true}
          isOpen={true}
          style={{width: 700}}
        >
          <div className={Classes.DIALOG_BODY}>
            <TransactionDetails hash={txId}/>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text="Close"
                      intent={Intent.NONE}
                      onClick={this.handleClose}/>
            </div>
          </div>
        </Dialog>
      )
    })

  };

  renderDeploymentPopup = () => {
    const {deployOptions} = this.state;

    this.setState({
      modal: (
        <Dialog
          icon="function"
          onClose={this.handleClose}
          title={`Deploy Contract`}
          usePortal={true}
          isOpen={true}
        >
          <div className={Classes.DIALOG_BODY}>
            <FormGroup
              label="Name"
            >
              <InputGroup placeholder="Contract Name"
                          defaultValue={deployOptions.name}
                          onChange={ev => this.setDeployOption({name: ev.target.value})}/>
            </FormGroup>
            <FormGroup
              helperText="0 - 1.000.000.000"
              label="Fee limit"
              labelInfo="(required)"
            >
              <NumericInput placeholder="10000"
                            value={deployOptions.feeLimit}
                            onValueChange={value => this.setDeployOption({feeLimit: value})}/>
            </FormGroup>
            <FormGroup
              label="Energy Limit"
              labelInfo="(required)"
            >
              <NumericInput placeholder="10000"
                            value={deployOptions.originEnergyLimit}
                            onValueChange={value => this.setDeployOption({originEnergyLimit: value})}/>
            </FormGroup>
            <FormGroup
              label="Fee Percentage"
              helperText="0 - 100"
              labelInfo="(required)"
            >

              <NumericInput placeholder="100"
                            value={deployOptions.userFeePercentage}
                            onValueChange={value => this.setDeployOption({userFeePercentage: value})}/>
              {/*<Slider max={100}*/}
              {/*min={0}*/}
              {/*initialValue={this.state.deployOptions.userFeePercentage}*/}
              {/*labelStepSize={20}*/}
              {/*onChange={value => this.setDeployOption({ userFeePercentage: value })}*/}
              {/*/>*/}
            </FormGroup>

          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button text="Cancel"
                      intent={Intent.NONE}
                      onClick={this.handleClose}/>
              <Button text="Deploy Contract"
                      intent={Intent.PRIMARY}
                      icon="cloud-upload"
                      onClick={this.deployContract}/>
            </div>
          </div>
        </Dialog>
      )
    })
  };

  renderDeployBar() {
    const {output, loadingDeploy} = this.state;
    return (
      <Fragment>
        <Divider/>
        <div className="bp3-select">
          <select
            disabled={!output}
            onChange={ev => {
            this.setState({selectedContract: ev.target.value});
          }}>
            <option>Select contract</option>
            {
              output && flatMap(Object.entries(output.contracts), ([name, contract]) =>
                Object.keys(contract).map(filename => <option key={`${name};${filename}`}
                                                              value={`${name};${filename}`}>{name} - {filename}</option>)
              )
            }
          </select>
        </div>
        <Button text="Deploy"
                icon="cloud-upload"
                disabled={!output}
                onClick={this.renderDeploymentPopup}
                loading={loadingDeploy}/>
      </Fragment>
    );
  }

  renderWidget = (id) => {


    switch (id) {
      case PANEL_CODE:
        return {
          title: 'Code',
          cmp: <Editor codeState={this.state} />
        };

      case PANEL_FILES:
        return {
          title: 'Files',
          cmp: <FileBrowser/>,
        };

      case PANEL_DEPLOYMENT:
        return {
          title: 'Deployment',
          cmp: <Deployment />,
        };

      case PANEL_STRUCTURE:
        return {
          title: 'Structure',
          cmp: <Structure />,
          widgetBodyProps: {},
        };
    }
  };

  changeProjectName = async () => {
    const {activeProject} = this.props;

    const newName = await this.props.prompt("Change project name", activeProject.name);

    this.props.changeProjectName({
      id: activeProject.id,
      name: newName,
    });
  };

  createProject = async () => {

    const { prompt, addProject, setActiveProject } = this.props;

    const id = newId();

    const newName = await prompt("Project name");

    addProject({
      name: trim(newName) || 'New Project',
      id,
      files: {
        newFile: {
          id: 'newFile',
          name: 'file.sol',
          contents: '',
        }
      }
    });

    setActiveProject(id);
  };

  importGistUrl = async (url) => {

    try {
      const importer = new GithubImporter();

      this.setState({
        modal: (
          <Dialog
            isOpen={true}
            title="Importing Gist"
          >
            <div className={Classes.DIALOG_BODY}>
              <Spinner/>
            </div>
          </Dialog>
        ),
      });

      const project = await importer.importGist(url);

      this.props.addProject(project);
      this.props.setActiveProject(project.id);

    } catch (e) {
        TopToaster.show({
          message: `Failed to import Github Gist: ${e.toString()}`,
          intent: Intent.DANGER,
        });
    } finally {
      this.handleClose();
    }

  };

  importGist = async () => {
    const gistUrl = await this.props.prompt("Gist URL");
    await this.importGistUrl(gistUrl);
  };


  deleteProject = async (project) => {

    if (await this.props.confirmDelete({
      confirmText: 'Delete Project',
      body: (
        <p>
          Are you sure you want to delete <b>{project.name}</b>?
        </p>
      )
    })) {
      this.props.deleteProject(project.id);
    }
  };

  publishToGithub = (project: any) => {

    let gist = {
      public: false,
      description: "Arjia: " + project.name,
      files: {}
    };

    for (let file of Object.values(project.files)) {
      // @ts-ignore
      gist.files[file.name] = {
        // @ts-ignore
        content: file.contents,
      };
    }

    this.setState({
      modal: (
        <PublishGist
          gist={gist}
          onClose={this.handleClose}
        />
      )
    });
  };


  renderProjectPopup() {

    const {projects, activeProject} = this.props;

    return (
      <Menu>
        <MenuItem icon="folder-new" text="New">
          <MenuItem icon="new-object" text="Empty project" onClick={this.createProject} />
        </MenuItem>
        <MenuItem icon="folder-open" text="Open">
          <MenuItem icon="git-push" text="Open Github Gist" onClick={this.importGist} />
          <MenuDivider/>
          {
            Object.values(projects).map((project: any) => (
              <MenuItem key={project.id}
                        text={project.name}
                        onClick={() => this.props.setActiveProject(project.id)} />
            ))
          }
        </MenuItem>
        <MenuItem icon="new-text-box"
                   text="Rename"
                   onClick={this.changeProjectName} />
        <MenuItem icon="trash"
                   text="Delete"
                   intent={Intent.DANGER}
                   onClick={() => this.deleteProject(activeProject)} />
        <MenuDivider/>

        <MenuItem icon="publish-function"
                  text="Publish Gist"
                  onClick={() => this.publishToGithub(activeProject)} />
      </Menu>
    )
  };

  renderMenu() {
    const {soljsonReleases, loadingCompile, solidityVersion, panels} = this.state;
    const {activeProject} = this.props;

    return (
      <Fragment>
        <Popover content={this.renderProjectPopup()} autoFocus={false}>
          <Button text={<span><b>Project</b> {activeProject.name}</span>}
                  rightIcon="chevron-down"
                  minimal={true}
          />
        </Popover>

        <ControlGroup fill={true} className="bp3-align-right">
          <Popover
            autoFocus={false}
            content={
            <div className="p-3">
              <h3 className="m-0 mb-3">Panels</h3>
              <Switch label="Structure"
                      large={true}
                      checked={panels.structure}
                      onChange={(ev: any) => this.updatePanels({ structure: ev.target.checked })} />
              <Switch label="Deployment"
                      large={true}
                      checked={panels.deployment}
                      onChange={(ev: any) => this.updatePanels({ deployment: ev.target.checked })} />
            </div>
          }>
            <Button text="Options"
                    icon="more"
                    minimal={true}
            />
          </Popover>
          <div className="bp3-select">
            <select
              value={solidityVersion}
              onChange={ev => { this.setState({solidityVersion: ev.target.value}) }}>
              {
                // @ts-ignore
                Object.keys(soljsonReleases).map((release) => (
                  // @ts-ignore
                  <option key={release} value={release}>{release}</option>
                ))
              }
            </select>
          </div>
          <Button icon="build" text="Compile" onClick={this.compile} loading={loadingCompile}/>
          {this.renderDeployBar()}
        </ControlGroup>
      </Fragment>
    );
  }

  updatePanels(updatePanels = {}) {

    let { panels } = this.state;

    panels = {
      ...panels,
      ...updatePanels,
    };

    this.setState({
      node: this.buildPanels(panels),
      panels,
    });
  }

  buildPanels(panels) {

    let codePanel: any = {
      splitPercentage: 80,
      direction: 'column',
      first: PANEL_CODE,
      second: PANEL_DEPLOYMENT,
    };

    let structurePanel: any = {
      splitPercentage: 80,
      direction: 'row',
      second: PANEL_STRUCTURE,
      first: null,
    };

    if (!panels.deployment) {
      codePanel = PANEL_CODE;
    }

    structurePanel.first = codePanel;

    if (!panels.structure) {
      structurePanel = codePanel;
    }

    return {
      direction: 'row',
      first: PANEL_FILES,
      splitPercentage: 20,
      second: structurePanel,
    };
  }

  render() {

    const {modal} = this.state;

    return (
      <Fragment>
        {modal}
        <WidgetBase
          title="Code"
          renderWidget={this.renderWidget}
          menu={this.renderMenu()}
          widgetBodyProps={{
            style: { overflow: 'hidden' }
          }}
          onChange={node => this.setState({ node })}
          node={this.state.node}
        />
      </Fragment>
    )
  }
}
