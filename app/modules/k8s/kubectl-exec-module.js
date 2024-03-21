const {callCliCommand} = require("../cmd/cmd-exec-module.js");

const execCmd = async (cmdArgs, contextSettings, podName, command) => {
    return await callCliCommand(`kubectl exec -n ${contextSettings.nameSpace} ${podName} -- ${command}`);
};

module.exports = {
    execCmd
}