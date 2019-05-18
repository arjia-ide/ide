import React from "react";
import {Card, Hotkey} from "@blueprintjs/core";


export default function Home() {
  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-md-6">
          <Card>
            <h1>Arjia. A TRON Development Environment</h1>
            <p>
              "Arjia City. Isn't it spectacular? Built on top of the nexus of every stream of code in the entire
              system."{' '}
              - <a href="https://tron.fandom.com/wiki/Quorra">Quorra</a> to {' '}
              <a href="https://tron.fandom.com/wiki/Anon">Anon</a>
            </p>
            <br/>
            <p>
              <small>Created by <a href="https://github.com/rovak">Rovak</a></small>
            </p>
          </Card>
        </div>
        <div className="col-md-6">
          <Card>
            <h1>Features</h1>
            <p>
              <ul className="bp3-list">
                <li>Solidity Editor, Linter, Compiler and Deployment</li>
                <li>Smart Contract Event Viewer</li>
                <li>Smart Contract Functions</li>
                <li>Transaction Viewer</li>
              </ul>
            </p>
          </Card>
          <Card className="mt-4">
            <h1>Shortcuts</h1>
            <p>
              <Hotkey
                global={true}
                combo="shift + ?"
                label="Show Global Shortuts"
                preventDefault={true}
              />
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
