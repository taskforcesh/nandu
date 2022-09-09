// Source: https://stackoverflow.com/questions/10265798/determine-project-root-from-a-running-node-js-application
function getPkgJsonDir() {
  const { dirname } = require("path");
  const { constants, accessSync } = require("fs");

  for (let path of module.paths) {
    try {
      let prospectivePkgJsonDir = dirname(path);
      accessSync(path, constants.F_OK);
      return prospectivePkgJsonDir;
    } catch (e) {}
  }
}

module.exports.distDir = `${getPkgJsonDir()}/dist`;
