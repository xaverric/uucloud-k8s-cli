const {readEnvironmentConfiguration} = require("./modules/configuration/configuration-reader-module");
const {evaluatePodMetadata, evaluateExtraPods} = require("./modules/evalution-module");
const {getPodsMetadata} = require("./modules/k8s/kubectl-pod-details-module");
const {printNoVerboseStatus, printVerbose} = require("./modules/print/console-print-module");
const {printToBookkit} = require("./modules/print/bookkit-print-module");
const {CONSOLE_LOG} = require("./logger/logger");
const {getDeploymentMetadata} = require("./modules/k8s/kubectl-deployment-details-module");
const {updateDeployment} = require("./modules/k8s/kubectl-deployment-update-module");
const {storeDeployments} = require("./modules/io/file-write-helper");
const {subAppNameExtractor, deploymentNameExtractor} = require("./modules/c3/c3-search-helper");
const packageJson = require("../package.json");
const {sendEmailNotification} = require("./modules/email/email-notification-module");

const check = async cmdArgs => {
    let environmentConfiguration = readEnvironmentConfiguration(cmdArgs);
    let pods = await getPodsMetadata(cmdArgs);
    let evaluationResult = evaluatePodMetadata(pods, environmentConfiguration, cmdArgs);
    let extraPodsNotInConfiguration = evaluateExtraPods(pods, environmentConfiguration, cmdArgs);

    if (cmdArgs.noverbose) {
        printNoVerboseStatus(evaluationResult, cmdArgs)
    } else {
        printVerbose(evaluationResult, cmdArgs);
    }

    if (extraPodsNotInConfiguration?.length > 0) {
        CONSOLE_LOG.info(`${extraPodsNotInConfiguration.length} extra pod/s found within k8s cluster, which is missing in the configuration.`);
        console.table(extraPodsNotInConfiguration);
    }
    await sendEmailNotification(evaluationResult, cmdArgs);
}

const print = async cmdArgs => {
    let environmentConfiguration = readEnvironmentConfiguration(cmdArgs);
    let pods = await getPodsMetadata(cmdArgs);
    let evaluationResult = evaluatePodMetadata(pods, environmentConfiguration, cmdArgs);

    await printToBookkit(evaluationResult, cmdArgs);
    CONSOLE_LOG.debug(`${cmdArgs.environment.toUpperCase()} environment details stored into the bookkit page.`);

    await sendEmailNotification(evaluationResult, cmdArgs);
}

const update = async cmdArgs => {
    let environmentConfiguration = readEnvironmentConfiguration(cmdArgs);
    let pods = await getPodsMetadata(cmdArgs);
    let evaluationResult = evaluatePodMetadata(pods, environmentConfiguration, cmdArgs);

    let deployments = await getDeploymentMetadata(cmdArgs);

    await storeDeployments(deployments);

    let subApps = evaluationResult
        .filter(subAppResult => subAppResult?.NODE_SELECTOR?.includes("NOK"))
        .map(subApp => {
            const foundDeployment = deployments.find(deployment => subAppNameExtractor(deployment) === subApp.subApp)
            return {
                ...subApp,
                deploymentName: deploymentNameExtractor(foundDeployment)
            }
        });

    for (const subAppEvaluation of subApps) {
        const subAppConfiguration = environmentConfiguration[subAppEvaluation.subApp];
        await updateDeployment(subAppEvaluation, subAppConfiguration, cmdArgs);
    }

    await storeDeployments(deployments, "-updated");
}

const help = usage => {
    CONSOLE_LOG.debug(usage);
}

const version = () => {
    CONSOLE_LOG.debug(packageJson.version);
}

module.exports = {
    check,
    print,
    update,
    help,
    version
}