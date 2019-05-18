/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import * as React from "react";
import {connect} from "react-redux";

import {
  Button,
  Classes,
  ControlGroup,
  Intent,
  ITreeNode,
  Position,
  ProgressBar,
  Tooltip,
  Tree
} from "@blueprintjs/core";

export interface ITreeExampleState {
  nodes: ITreeNode[];
  id: number;
}

// use Component so it re-renders everytime: `nodes` are not a primitive type
// and therefore aren't included in shallow prop comparison
@connect(
  state => ({
    projects: state.ide.projects,
    activeProject: state.ide.projects[state.ide.activeProject],
    files: state.ide.projects[state.ide.activeProject].files,
    activeFile: state.ide.activeFile,
  }),
  ({ ide }) => ({
    addFile: ide.addFile,
    removeFile: ide.removeFile,
    setActiveFile: ide.setActiveFile,
  }),
)
export default class FileBrowser extends React.Component<any, ITreeExampleState> {
  public state: ITreeExampleState = {
    nodes: INITIAL_STATE,
    id: 3,
  };


  addFile = () => {

    this.props.addFile({
      file: {
        contents: '',
        name: 'file.sol'
      }
    });
  };

  deleteFile = () => {
    this.props.removeFile({
      file: this.props.activeFile
    });
  };

  static getDerivedStateFromProps(props, state) {
    return {
      ...state,
      nodes: Object.values(props.files).map((file: any)=> ({
        id: file.id,
        label: file.name,
        icon: "document",
        isSelected: props.activeFile === file.id,
        // secondaryLabel: (
        //   {/*<div style={{ width: 100 }}>*/}
        //     {/*<ProgressBar stripes={false} intent={Intent.SUCCESS} animate={false} value={0.5} >*/}
            //
            // </ProgressBar>
          // </div>
        // )
      })),
    };
  }

  private handleNodeClick = (nodeData: ITreeNode, _nodePath: number[], e: React.MouseEvent<HTMLElement>) => {
    if (!e.shiftKey) {
      this.forEachNode(this.state.nodes, n => (n.isSelected = false));
    }
    nodeData.isSelected = true; //originallySelected == null ? true : !originallySelected;

    this.props.setActiveFile(nodeData.id);
    // this.setState(this.state);
  };

  private handleNodeCollapse = (nodeData: ITreeNode) => {
    nodeData.isExpanded = false;
    this.setState(this.state);
  };

  private handleNodeExpand = (nodeData: ITreeNode) => {
    nodeData.isExpanded = true;
    this.setState(this.state);
  };

  private forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void) {
    if (nodes == null) {
      return;
    }

    for (const node of nodes) {
      callback(node);
      this.forEachNode(node.childNodes, callback);
    }
  }

  public render() {
    return (
      <React.Fragment>
        <nav className="bp3-navbar">
          <ControlGroup fill={true}>
            <Button icon="plus" onClick={this.addFile} />
            <Button icon="trash" intent={Intent.DANGER} onClick={this.deleteFile} />
          </ControlGroup>
        </nav>
        <Tree
          contents={this.state.nodes}
          onNodeClick={this.handleNodeClick}
          onNodeCollapse={this.handleNodeCollapse}
          onNodeExpand={this.handleNodeExpand}
          className={Classes.ELEVATION_0}
        />
      </React.Fragment>
    );
  }
}

/* tslint:disable:object-literal-sort-keys so childNodes can come last */
const INITIAL_STATE: ITreeNode[] = [
  {
    id: 1,
    icon: "folder-close",
    isExpanded: true,
    label: (
      <Tooltip content="I'm a folder <3" position={Position.RIGHT}>
        Code
      </Tooltip>
    ),
    childNodes: [
      {
        id: 2,
        icon: "code",
        label: "TRC20.sol",
        secondaryLabel: (
          <ProgressBar stripes={false} intent={Intent.SUCCESS} />
        )
      },
    ],
  },
];
/* tslint:enable:object-literal-sort-keys */
