
export function activeFileCode(state: any) {

  const activeProject = state.ide.projects[state.ide.activeProject];
  const activeFile = state.ide.activeFile;
  const currentFile = activeProject.files[activeFile];

  if (currentFile) {
    return currentFile.contents;
  }

  return null;
}

export function activeFileExtension(state: any) {
  return ((state.ide.projects[state.ide.activeProject] || { files: {} }).files[state.ide.activeFile] || {}).name;
}
