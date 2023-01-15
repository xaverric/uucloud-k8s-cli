const {readNodeSizeConfiguration} = require("./configuration/configuration-reader-module");
const {getSubApp, getSubAppCount, getSubAppNodeSelectors, subAppSelectorFunction} = require("./c3/c3-search-helper");

const deepEqual = (x, y) => {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
      (Object.keys(x).length === Object.keys(y).length) && Object.keys(x).reduce((isEqual, key) => {return isEqual && deepEqual(x[key], y[key]);}, true) :
      (x === y);
};

const evaluateDeployment = (pods, subApp, subAppConfig) => {
    let result = [];
    let status = getSubApp(pods, subApp)?.status?.phase;
    let found = getSubAppCount(pods, subApp);

    if(found === 0 || found !== subAppConfig.count || status !== "Running") {
        result.push(`Status (Expected/Current): Running/${status}, Count (Expected/Current): ${subAppConfig.count}/${found} - NOK`);
    } else {
        result.push(`Status: ${status}, Count: ${subAppConfig.count} - OK`);
    }
    return result.join(" ");
};

const evaluateNodeSelector = (pods, subApp, subAppConfig) => {
    let result = [];
    subAppConfig.nodeSelectors?.forEach(expectedSelector => {
        let foundSelector = getSubAppNodeSelectors(pods, subApp)?.find(podSelector => expectedSelector.key === podSelector.key);
        if (!foundSelector || !deepEqual(expectedSelector, foundSelector)) {
            result.push(`Node selector ${expectedSelector.key}=${expectedSelector.values[0]} missing - NOK`);
        } else {
            result.push(`Node selector ${expectedSelector.key}=${expectedSelector.values[0]} - OK`);
        }
    });
    return result.join(" ");
};

/**
 * Return UU_CLOUD_APP_VERSION first in case the attribute exists. Otherwise, return the whole image name.
 * @param pods
 * @param subApp
 * @returns {*|string}
 */
const evaluateVersion = (pods, subApp) => {
    let uuAppVersion = getSubApp(pods, subApp)?.metadata?.annotations?.UU_CLOUD_APP_VERSION;
    let image = getSubApp(pods, subApp)?.spec?.containers[0]?.image;
    if (!uuAppVersion && !image) {
        return "NOK - Version missing"
    }
    return uuAppVersion ? uuAppVersion : image;
};

const evaluateRts = (pods, subApp) => {
    return getSubApp(pods, subApp)?.metadata?.annotations?.UU_CLOUD_RUNTIME_STACK_CODE ?? "NOK - RTS missing";
};

const evaluateDeploymentUri = (pods, subApp) => {
    return getSubApp(pods, subApp)?.metadata?.annotations?.UU_CLOUD_APP_DEPLOYMENT_URI ?? "NOK - Deployment URI missing";
};

const evaluateNodeSize = (pods, subApp, subAppConfig, nodeSizes) => {
    let result = [];
    let subAppCpu = evaluateCpu(pods, subApp);
    let subAppMemory = evaluateMemory(pods, subApp);
    let foundNodeSizeKey = Object.keys(nodeSizes).find(nodeSizeName =>
        isNodeSizeValueEqual(nodeSizes[nodeSizeName], "memory", subAppMemory) &&
        isNodeSizeValueEqual(nodeSizes[nodeSizeName], "cpu", subAppCpu)
    );
    let foundNodeSize = nodeSizes[foundNodeSizeKey];
    if (foundNodeSizeKey !== subAppConfig.nodeSize) {
        result.push(`NodeSize (Expected/Found): ${subAppConfig.nodeSize}/${foundNodeSizeKey}, CPU (Expected/Current): ${foundNodeSize?.cpu}/${subAppCpu}, RAM: ${foundNodeSize?.memory}/${subAppMemory} - NOK`)
    } else {
        result.push(`${foundNodeSizeKey} - OK`);
    }
    return result.join(" ");
};

const isNodeSizeValueEqual = (nodesize, valueName, currentSubAppValue) => {
    if (Array.isArray(nodesize?.[valueName])) {
        return nodesize?.[valueName].some(value => value === currentSubAppValue)
    }
    return nodesize?.[valueName] === currentSubAppValue;
}

const evaluateCpu = (pods, subApp) => {
    return getSubApp(pods, subApp)?.spec?.containers[0]?.resources?.requests?.cpu ?? "NOK - CPU missing";
};

const evaluateMemory = (pods, subApp) => {
    return getSubApp(pods, subApp)?.spec?.containers[0]?.resources?.requests?.memory ?? "NOK - RAM missing";
};

const evaluateContainerStatus = (pods, subApp) => {
    const status = getSubApp(pods, subApp)?.status;
    const containerStatus = status?.containerStatuses[0];
    if (!containerStatus) {
        return "NOK - Container missing"
    }
    return `${status?.phase} [${status?.startTime}] - Restarts: ${containerStatus?.restartCount} - ${containerStatus?.restartCount > 0 ? "NOK" : "OK"}`;
};

const evaluateVolume = (pods, subApp, subAppConfig) => {
    const result = [];
    subAppConfig.volumes?.forEach(expectedVolume => {
        let volumeMount = getSubApp(pods, subApp)?.spec?.containers[0]?.volumeMounts.find(volumeMount => volumeMount.name === expectedVolume.name && volumeMount.mountPath === expectedVolume.mountPath);
        let foundVolume = getSubApp(pods, subApp)?.spec?.volumes?.find(volume => volume.name === expectedVolume.name);
        if (!foundVolume || !volumeMount) {
            result.push(`Volume ${expectedVolume.name}:${expectedVolume.mountPath} missing - NOK`);
        } else {
            result.push(`Volume ${expectedVolume.name}:${expectedVolume.mountPath} - OK`);
        }
    });
    return result.join(" ");
};

const evaluatePodMetadata = (pods, environmentConfiguration, cmdArgs) => {
    const EVALUATE_KEY_DEPLOYMENT = "DEPLOYMENT";
    const EVALUATE_KEY_NODE_SELECTOR = "NODE_SELECTOR";
    const EVALUATE_KEY_VERSION = "VERSION";
    const EVALUATE_KEY_RTS = "RUNTIME_STACK";
    const EVALUATE_KEY_DEPLOYMENT_URI = "UUAPP_DEPLOYMENT_URI";
    const EVALUATE_KEY_NODE_SIZE = "NODE_SIZE";
    const EVALUATE_KEY_MEMORY = "MEMORY";
    const EVALUATE_KEY_CPU = "CPU";
    const EVALUATE_CONTAINER_STATUS = "CONTAINER_STATUS";
    const EVALUATE_KEY_VOLUME = "VOLUME";

    const result = [];
    Object.keys(environmentConfiguration).forEach(subApp => {
        let subAppConfig = environmentConfiguration[subApp];
        if(subAppConfig.required) {
            let evaluateSubApp = {subApp};
            if (cmdArgs.deployment) {
                evaluateSubApp[EVALUATE_KEY_DEPLOYMENT] = evaluateDeployment(pods, subApp, subAppConfig);
                evaluateSubApp[EVALUATE_KEY_NODE_SELECTOR] = evaluateNodeSelector(pods, subApp, subAppConfig);
            }
            if (cmdArgs.version) {
                evaluateSubApp[EVALUATE_KEY_VERSION] = evaluateVersion(pods, subApp);
            }
            if (cmdArgs.rts) {
                evaluateSubApp[EVALUATE_KEY_RTS] = evaluateRts(pods, subApp);
            }
            if (cmdArgs.uri) {
                evaluateSubApp[EVALUATE_KEY_DEPLOYMENT_URI] = evaluateDeploymentUri(pods, subApp);
            }
            if (cmdArgs.nodesize) {
                let nodesizes = readNodeSizeConfiguration(cmdArgs);
                evaluateSubApp[EVALUATE_KEY_NODE_SIZE] = evaluateNodeSize(pods, subApp, subAppConfig, nodesizes);
            }
            if (cmdArgs.cpu) {
                evaluateSubApp[EVALUATE_KEY_CPU] = evaluateCpu(pods, subApp);
            }
            if (cmdArgs.memory) {
                evaluateSubApp[EVALUATE_KEY_MEMORY] = evaluateMemory(pods, subApp);
            }
            if (cmdArgs.status) {
                evaluateSubApp[EVALUATE_CONTAINER_STATUS] = evaluateContainerStatus(pods, subApp);
            }
            if (cmdArgs.volume) {
                evaluateSubApp[EVALUATE_KEY_VOLUME] = evaluateVolume(pods, subApp, subAppConfig);
            }
            result.push(evaluateSubApp);
        }
    });
    return result;
}

const evaluateExtraPods = (pods, environmentConfiguration) => {
    return pods
        .filter(pod => !Object.keys(environmentConfiguration).some(subApp => subAppSelectorFunction(pod, subApp)))
        .map(pod => pod?.metadata?.annotations?.APP_PACK_URL_PATH)
}

const gatherProblemsFromEvaluationResult = evaluationResult => {
    return evaluationResult
        .flatMap(item => Object.values(item)
            .map(problem => {
                return {
                    subApp: item.subApp,
                    problem
                }
            }))
        .filter(item => item.problem.includes("NOK"));
}


module.exports = {
    evaluatePodMetadata,
    evaluateExtraPods,
    gatherProblemsFromEvaluationResult
};