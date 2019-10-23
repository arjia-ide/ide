import React from "react";
import * as AstParser from "./parser/parser";
import {Icon, Intent, ITreeNode, Tree} from "@blueprintjs/core";
import {withApi} from "../../hoc/withApi";
import {connect} from "react-redux";
import {debounce, last} from "lodash";
import {activeFileCode, activeFileExtension} from "../../redux/ide.selectors";

@withApi
// @ts-ignore
@connect(
  (state: any) => ({
    projects: state.ide.projects,
    activeProject: state.ide.projects[state.ide.activeProject],
    files: state.ide.projects[state.ide.activeProject].files,
    activeFile: state.ide.activeFile,
    activeFileName: activeFileExtension(state),
    activeFileCode: activeFileCode(state),
  }),
  ({ ide }: any) => ({
    updateFile: ide.updateFile,
    addFile: ide.addFile
  }),
)
export default class Structure extends React.Component<any, any> {

  state = {
    nodes: []
  };

  id = 1;

  reload = debounce(() => {
    this.load();
  }, 300);

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.reload();
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeFileCode !== prevProps.activeFileCode) {
     this.reload();
    }
  }

  load = async () => {


    const extension = "." + last(this.props.activeFileName.split('.'));
    if (extension !== ".sol") {
      this.setState({
        nodes: []
      });
      return;
    }

    const parser = await import('solidity-parser-antlr');

    try {


      const ast = parser.parse(this.props.activeFileCode, {
        loc: true,
      });

      const astParser = new AstParser.AstParser();
      const parseResult = astParser.parseAst(ast);

      const nodes = this.buildNode(parseResult);


      this.setState({
        nodes,
      });
    } catch (e) {
      console.error(e);
    }
  }

  check = (item) => {
    if (item.childNodes && item.childNodes.length === 0) {
      delete item.childNodes;
    }

    return item;
  }

  buildNode = (node) => {

    if (node instanceof AstParser.Source) {
      return [
        this.check({
          id: this.id++,
          icon: "code",
          isExpanded: true,
          label: "Source",
          childNodes: node.contracts.map(this.buildNode),
        })
      ];
    } else if (node instanceof AstParser.Contract) {
      return this.check({
        id: this.id++,
        icon: "code-block",
        isExpanded: true,
        label: node.name,
        childNodes: node.events.concat(node.functions).map(this.buildNode),
      });
    } else if (node instanceof AstParser.Function) {
      return this.check({
        id: this.id++,
        icon: "function",
        isExpanded: true,
        label: node.name,
        childNodes: node.emits.map(this.buildNode),
        secondaryLabel: (
          <span>
            {
              node.stateMutability === 'view' &&
                <Icon icon="eye-open" className="ml-1" iconSize={12} />
            }
            {
              node.visibility === 'internal' &&
              <Icon icon="lock" className="ml-1" intent={Intent.WARNING} iconSize={12} />
            }
            {
              node.visibility === 'public' &&
                <Icon className="ml-1" icon="unlock" intent={Intent.SUCCESS} iconSize={12} />
            }
            {
              node.visibility === 'external' &&
                <Icon className="ml-1" icon="send-to" intent={Intent.SUCCESS} iconSize={12} />
            }
          </span>
        )
      });
    } else if (node instanceof AstParser.Emit) {
      return this.check({
        id: this.id++,
        icon: "cell-tower",
        label: node.name,
      });
    } else if (node instanceof AstParser.Event) {
      return this.check({
        id: this.id++,
        icon: "cell-tower",
        label: node.name,
      });
    }
  }

  render() {
    return (
      <Tree
        contents={this.state.nodes}
        onNodeClick={this.handleNodeClick}
        onNodeCollapse={this.handleNodeCollapse}
        onNodeExpand={this.handleNodeExpand}
        // className={Classes.ELEVATION_0}
      />
    );
  }

  private handleNodeClick = (nodeData: ITreeNode, nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, n => (n.isSelected = false));
    }
    nodeData.isSelected = true; // originallySelected == null ? true : !originallySelected;

    // this.props.setActiveFile(nodeData.id);
    this.setState(this.state);
  }

  private forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes, callback);
    }
  }

  private handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    this.setState(this.state);
  }

  private handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    this.setState(this.state);
  }

}
