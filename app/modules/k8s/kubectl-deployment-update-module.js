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

const updateDeployment = async (subAppEvaluation, subAppConfiguration, cmdArgs) => {
    CONSOLE_LOG.info(`Updating deployment for ${subAppEvaluation.deploymentName}...`)
    let contextSettings = readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    await callCliCommand(`kubectl patch deployment ${subAppEvaluation.deploymentName} -n ${contextSettings.nameSpace} --type json -p=${composeNodeSelectorsPatchArray(subAppConfiguration)}`);
}

module.exports = {
    updateDeployment
}