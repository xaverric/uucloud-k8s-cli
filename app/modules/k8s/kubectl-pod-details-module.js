const {callCliCommand} = require("../cmd/cmd-exec-module.js");
const {readContextConfiguration} = require("../configuration/configuration-reader-module");
const {CONSOLE_LOG} = require("../../logger/logger");

const getPodsMetadata = async cmdArgs => {
    let contextSettings = readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    let podDetails = await callCliCommand(`kubectl get pods -n ${contextSettings.nameSpace} -o jsonpath='{.items[*]}'`);
    return getArrayFromLineContent(podDetails).map(getPodDetail);
};

const getPods = async cmdArgs => {
    let contextSettings = readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    return await callCliCommand(`kubectl get pods -n ${contextSettings.nameSpace} --sort-by=.metadata.creationTimestamp`);
};

const getArrayFromLineContent = (lines) => {
    let result = lines.toString().replace(/} {/g, "}||||{");
    if (process.platform === "win32") {
        result = result
            .slice(1)
            .slice(0, -1)
    }
    return result.split("||||");
};

const getPodDetail = line => {
    let result = "";
    try {
        result = JSON.parse(line); 
    } catch (e) {
        CONSOLE_LOG.error(`Something went wrong when loading pod metadata: ${e}`);
        CONSOLE_LOG.info(`Line: ${line}`);
    }
    return result;
};

module.exports = {
    getPodsMetadata,
    getPods
}