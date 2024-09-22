const {
    readEnvironmentConfiguration,
    readNodeSizeConfiguration
} = require("../../modules/configuration/configuration-reader-module");
const {getPodsMetadata} = require("../../modules/k8s/kubectl-pod-details-module");
const {evaluateDeploymentMetadata, evaluatePodMetadata} = require("../../modules/evalution-module");
const {getDeploymentMetadata} = require("../../modules/k8s/kubectl-deployment-details-module");
const {
    subAppNameExtractor,
    deploymentNameExtractor,
    subAppSelectorFunction
} = require("../../modules/c3/c3-search-helper");
const {SCALE_UP} = require("../../modules/k8s/kubectl-deployment-scale-module");
const {CONSOLE_LOG} = require("../../logger/logger");

/**
 * scale given uuApps from the configuration down or up, with the provided scale function
 *
 * @param cmdArgs
 * @param scaleFnc
 * @returns {Promise<void>}
 */
const scale = async (cmdArgs, scaleFnc) => {
    let environmentConfiguration = await readEnvironmentConfiguration(cmdArgs);

    let pods = await getPodsMetadata(cmdArgs);
    let evaluationResult = await evaluateDeploymentMetadata(pods, environmentConfiguration, cmdArgs);
    let deployments = await getDeploymentMetadata(cmdArgs);
    let nodeSizeConfiguration = await readNodeSizeConfiguration(cmdArgs);

    let subApps = evaluationResult
        .map(subApp => {
            const foundDeployment = deployments.find(deployment => subAppNameExtractor(deployment) === subApp.subApp)
            return {
                ...subApp,
                deploymentName: deploymentNameExtractor(foundDeployment),
                ...environmentConfiguration[subApp.subApp]
            }
        })
        .sort((a, b) => sortFnc(a, b, cmdArgs, nodeSizeConfiguration));

    for (const subAppEvaluation of subApps) {
        const subAppConfiguration = environmentConfiguration[subAppEvaluation.subApp];
        const operation = await scaleFnc(subAppEvaluation, subAppConfiguration, cmdArgs);
        const time = 0;
        await waitForUuAppStart(cmdArgs, subAppEvaluation.subApp, operation, time);
    }
}

const waitForUuAppStart = async (cmdArgs, subApp, operation, time) => {
    let pods = await getPodsMetadata(cmdArgs);
    let pod = pods.find(pod => subAppSelectorFunction(pod, subApp));
    if (operation === SCALE_UP) {
        CONSOLE_LOG.info(`Waiting for ${subApp} to start... ${time}s`);
        if (pod?.status?.conditions.find(condition => condition.type === "Initialized")?.status === "True") {
            return;
        } else {
            await delay(5000);
            await waitForUuAppStart(cmdArgs, subApp, operation, time + 5);
        }
    }
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Function to convert memory values to bytes
function parseMemory(memory) {
    if (Array.isArray(memory)) {
        memory = memory[0];
    }
    const multipliers = {"Ki": 1024, "Mi": 1024 ** 2, "Gi": 1024 ** 3};
    const value = parseFloat(memory);
    const unit = memory.slice(-2);
    if (isNaN(value) || !multipliers.hasOwnProperty(unit)) {
        return 0;
    }
    return Math.floor(value * multipliers[unit]);
}

// Function to get RAM usage from the nodeSizes object
function getRAMUsage(nodeSizes, nodeSize) {
    const size = nodeSizes[nodeSize];
    if (size) {
        return parseMemory(size.memory);
    }
    return 0; // Return 0 if nodeSize not found in the nodeSizes object
}

function getCpuUsage(nodeSizes, nodeSize) {
    const size = nodeSizes[nodeSize];
    if (size) {
        return parseInt(size.cpu);
    }
    return 0; // Return 0 if nodeSize not found in the nodeSizes object
}

function sortFnc(a, b, cmdArgs, nodeSizeConfiguration) {
    // Compare by priority first
    const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
    if (priorityA !== priorityB) {
        return priorityA - priorityB;
    }

    // If priorities are equal, compare by memory
    const ramComparison = getRAMUsage(nodeSizeConfiguration, b.nodeSize) - getRAMUsage(nodeSizeConfiguration, a.nodeSize);
    if (ramComparison !== 0) {
        return ramComparison; // Sort by memory first
    }
    // If memory is equal, then sort by CPU
    return getCpuUsage(nodeSizeConfiguration, b.nodeSize) - getCpuUsage(nodeSizeConfiguration, a.nodeSize);
}

module.exports = {
    scale
}