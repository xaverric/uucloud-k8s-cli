const {callCliCommand} = require("../cmd/cmd-exec-module.js");
const {readContextConfiguration} = require("../configuration/configuration-reader-module");

const getNodesMetadata = async cmdArgs => {
    let contextSettings = await readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    let nodes = await callCliCommand(`kubectl get nodes -n ${contextSettings.nameSpace} -o json`);
    return JSON.parse(nodes);
};


module.exports = {
    getNodesMetadata
}