/* eslint-disable no-undef */

import solc from "solc/wrapper";

function loadScript(name, url, callback) {
  var script = document.getElementById("script-" + name);
  if (script != null) {
    script.parentElement.removeChild(script);
  }

  script = document.createElement("script");
  script.type = "text/javascript";
  script.setAttribute("id", "script-" + name);

  if (script.readyState) {  //IE
    script.onreadystatechange = function() {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {  //Others
    script.onload = function() {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}

export function loadVersion(version, callback) {
  delete window.Module;
  // NOTE: workaround some browsers
  window.Module = undefined;

  const url = "https://ethereum.github.io/solc-bin/bin/" + version;
  loadScript("solc", url, function() {
    const compiler = solc(window.Module);
    callback(compiler);
  });
}

export function loadScriptVersion(url, callback) {
  delete window.Module;
  // NOTE: workaround some browsers
  window.Module = undefined;

  loadScript("solc", url, function() {
    const compiler = solc(window.Module);
    callback(compiler);
  });
}

// Also loads global variables called "soljsonSources" and "soljsonReleases"
export function getVersions(callback) {
  const url = "https://ethereum.github.io/solc-bin/bin/list.js";
  loadScript("solc-list", url, function() {
    callback(soljsonSources, soljsonReleases);
  });
}

// @ts-ignore-end
