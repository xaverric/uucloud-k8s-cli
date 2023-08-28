const {callCliCommand} = require("../cmd/cmd-exec-module.js");
const {readContextConfiguration} = require("../configuration/configuration-reader-module");
const {CONSOLE_LOG} = require("../../logger/logger");
const path = require("path");
const os = require("os");
const {createDefaultFolderIfNotExist} = require("../io/file-write-helper");

const LOGS_PATH = path.join(os.homedir(), '.uucloud-k8s', 'logs');

const storeLogsForDeployment = async (cmdArgs, deploymentName, timestamp) => {
    const folder = path.join(LOGS_PATH, cmdArgs.environment, `${timestamp}`);
    createDefaultFolderIfNotExist(folder);

    CONSOLE_LOG.info(`Extracting log files for deployment/${deploymentName} into ${folder}`);
    let contextSettings = await readContextConfiguration(cmdArgs);
    await callCliCommand(`kubectl config use-context ${contextSettings.context}`);
    await callCliCommand(`kubectl logs -n ${contextSettings.nameSpace} deployment/${deploymentName} --all-containers --ignore-errors --tail=-1 > ${path.resolve(folder, `${deploymentName}_log.txt`)}`);
};

module.exports = {
    storeLogsForDeployment
}