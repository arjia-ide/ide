import xhr from "axios";
import {newId} from "../utils/common";
import {last} from "lodash";

export default class GithubImporter {


  async importGist(gist): Promise<{ name; files: {}; id: any; gistId?: any }> {

    const gistId = last(gist.split("/"));
    const gistUrl = `https://api.github.com/gists/${gistId}`;

    const { data: { files, description } } = await xhr.get(gistUrl);

    let project = {
      id: newId(),
      name: 'Gist: ' + description,
      files: {},
      gistId,
    };

    for (let filename of Object.keys(files)) {

      const file = files[filename];

      let content = file.content;
      if (file.truncated) {
        content = await xhr.get(file.raw_url).then(x => x.data);
      }

      const id = newId();

      project.files[id] = {
        contents: content,
        name: filename,
        id,
      };
    }

    return project;
  }

}
