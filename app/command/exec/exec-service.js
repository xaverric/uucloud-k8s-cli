const {getPodsMetadata} = require("../../modules/k8s/kubectl-pod-details-module");
const {execCmd} = require("../../modules/k8s/kubectl-exec-module");
const {readEnvironmentConfiguration, readContextConfiguration} = require("../../modules/configuration/configuration-reader-module");
const {callCliCommand} = require("../../modules/cmd/cmd-exec-module");
const {evaluatePodMetadata} = require("../../modules/evalution-module");

const execDateTime = async (cmdArgs) => {
    let environmentConfiguration = await readEnvironmentConfiguration(cmdArgs);
    let pods = await getPodsMetadata(cmdArgs);
    let evaluationResult = await evaluatePodMetadata(pods, environmentConfiguration, cmdArgs);

    let contextSettings = await readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);

    const commands = evaluationResult.map(async subApp => {
        const timestamp = await execCmd(cmdArgs,contextSettings, subApp.podName, "date +%s")
        const time = new Date(timestamp*1000);
        return {
            subApp: subApp.subApp,
            time
        }
    })

    return await Promise.all(commands);
}

module.exports = {
    execDateTime
}