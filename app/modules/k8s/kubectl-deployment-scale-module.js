const {CONSOLE_LOG} = require("../../logger/logger");
const {readContextConfiguration} = require("../configuration/configuration-reader-module");
const {callCliCommand} = require("../cmd/cmd-exec-module");

const SCALE_DOWN = "down";
const SCALE_UP = "up";

const scaleUuAppUp = async (subAppEvaluation, subAppConfiguration, cmdArgs) => {
    CONSOLE_LOG.info(`Scaling deployment for ${subAppEvaluation.deploymentName} up to replicas count ${subAppConfiguration.count}`);
    let contextSettings = await readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    await callCliCommand(`kubectl scale --replicas=${subAppConfiguration.count} deployment ${subAppEvaluation.deploymentName} -n ${contextSettings.nameSpace}`);
    return SCALE_UP;
}

const scaleUuAppDown = async (subAppEvaluation, subAppConfiguration, cmdArgs) => {
    CONSOLE_LOG.info(`Scaling deployment for ${subAppEvaluation.deploymentName} down to replicas count 0`);
    let contextSettings = await readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    await callCliCommand(`kubectl scale --replicas=0 deployment ${subAppEvaluation.deploymentName} -n ${contextSettings.nameSpace}`);
    return SCALE_DOWN;
}

module.exports = {
    scaleUuAppUp,
    scaleUuAppDown,
    SCALE_DOWN,
    SCALE_UP
}