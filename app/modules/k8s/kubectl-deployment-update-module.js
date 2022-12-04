const {callCliCommand} = require("../cmd/cmd-exec-module");
const {readContextConfiguration} = require("../configuration/configuration-reader-module");
const {CONSOLE_LOG} = require("../../logger/logger");

const nodeSelectorAddPatchTemplate = (value) => `{"op":"add","path":"/spec/template/spec/affinity/nodeAffinity/requiredDuringSchedulingIgnoredDuringExecution/nodeSelectorTerms/0/matchExpressions/-","value":${JSON.stringify(value)}}`

const composeNodeSelectorsPatchArray = (subApp) => {
    let patchArray = subApp?.nodeSelectors?.map(nodeSelector => {
        return nodeSelectorAddPatchTemplate(nodeSelector).replaceAll("\"", "\\\"")
    })
    return `[${patchArray.join(",")}]`;
}

const updateDeployment = async (subApp, cmdArgs) => {
    CONSOLE_LOG.info(`Updating deployment for ${subApp.deploymentName}...`)
    let contextSettings = readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    await callCliCommand(`kubectl patch deployment ${subApp.deploymentName} -n ${contextSettings.nameSpace} --type json -p=${composeNodeSelectorsPatchArray(subApp)}`);
}

module.exports = {
    updateDeployment
}