import {code} from "../widgets/editor/exampleCode";
import {newId} from "../utils/common";
import {first} from "lodash";
import { createModel } from "@rematch/core";

export interface State {
  projects: { [key: number]: any };
  compileOutput: any;
  activeProject: number;
  activeFile: string;
  latestContract: string;
  deployedContracts: any[];
  panels: { [key: string]: boolean };
}

export const ide = createModel<State>({
  state: {
    projects: {
      1: {
        id: 1,
        name: "Project",
        files: {
          'main.sol': {
            id: 'main.sol',
            name: 'main.sol',
            contents: code,
          },
        }
      }
    },
    compileOutput: null,
    activeProject: 1,
    activeFile: 'main.sol',
    latestContract: '',
    deployedContracts: [],
    panels: {
      structure: false,
      deployment: true,
    },
  },
  reducers: {
    updateFile(state: State, { project, file, data }) {
      return {
        ...state,
        projects: {
          ...state.projects,
          [project]: {
            ...state.projects[project],
            files: {
              ...state.projects[project].files,
              [file]: {
                ...state.projects[project].files[file],
                ...data,
              }
            }
          }
        }
      };
    },
    addFile(state: State, { project = null, file }) {

      const id = newId();

      if (!project) {
        project = state.activeProject;
      }

      return {
        ...state,
        activeFile: id,
        projects: {
          ...state.projects,
          [project]: {
            ...state.projects[project],
            files: {
              ...state.projects[project].files,
              [id]: {
                contents: '',
                ...file,
                id
              }
            }
          }
        }
      };
    },
    removeFile(state: State, { project = null, file }) {

      if (!project) {
        project = state.activeProject;
      }

      const { [file]: remove, ...newFiles } = state.projects[project].files;


      return {
        ...state,
        projects: {
          ...state.projects,
          [project]: {
            ...state.projects[project],
            files: newFiles,
          }
        }
      };
    },
    deleteProject(state: State, id) {
      const { [id]: removedProject, ...newProjects } = state.projects;

      const activeProject = removedProject.id === state.activeProject ?
        first(Object.keys(newProjects)) :
        state.activeProject;

      return {
        ...state,
        projects: newProjects,
        activeProject,
      };
    },
    setActiveFile(state: State, file) {
      return {
        ...state,
        activeFile: file,
      };
    },
    setLatestContract(state: State, contract) {
      return {
        ...state,
        latestContract: contract,
      };
    },
    changeProjectName(state: State, { id, name }) {
      return {
        ...state,
        projects: {
          ...state.projects,
          [id]: {
            ...state.projects[id],
            name,
          }
        }
      };
    },
    setActiveProject(state: State, project) {
      return {
        ...state,
        activeProject: project,
        activeFile: first(Object.keys(state.projects[project].files || {})),
      };
    },
    addProject(state: State, project) {
      return {
        ...state,
        projects: {
          ...state.projects,
          [project.id]: {
            files: {},
            name: 'New Project',
            ...project,
          },
        },
      };
    },
    setCompileOutput(state: State, output) {
      return {
        ...state,
        compileOutput: output,
      };
    },
    setDeployedContracts(state: State, contracts) {
      return {
        ...state,
        deployedContracts: contracts || [],
      };
    },
    setPanelVisibility(state: State, { panel, visible }) {
      return {
        ...state,
        panels: {
          ...state.panels,
          [panel]: visible,
        },
      };
    }
  },
  selectors: (slice, createSelector, hasProps) => ({
    activeFileCode() {
      return (state) => {
        const activeProject = state.ide.projects[state.ide.activeProject];
        const activeFile = state.ide.activeFile;
        const currentFile = activeProject.files[activeFile];

        if (currentFile) {
          return currentFile.contents;
        }

        return '';
      };
    },
    activeFileExtension() {
      return (state) => {
        return ((state.ide.projects[state.ide.activeProject] || { files: {} }).files[state.ide.activeFile] || {}).name;
      };
    },
  })
});
