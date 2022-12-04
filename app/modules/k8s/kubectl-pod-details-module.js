const {callCliCommand} = require("../cmd/cmd-exec-module.js");
const {readContextConfiguration} = require("../configuration/configuration-reader-module");

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
    return lines.toString()
        .replace(/} {/g, "};{")
        .slice(1)
        .slice(0, -1)
        .split(";");
};

const getPodDetail = line => {
    let result = "";
    try {
        result = JSON.parse(line); 
    } catch (e) {
        // ignore error and return empty line for given pod
    }
    return result;
};

module.exports = {
    getPodsMetadata,
    getPods
}