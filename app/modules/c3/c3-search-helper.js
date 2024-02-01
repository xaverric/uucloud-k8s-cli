const subAppNameExtractor = deployment =>
    deployment?.spec?.template?.metadata?.annotations?.APP_PACK_URL_PATH ||
    deployment?.metadata?.labels?.["workload.cloud.uu/spp-0"] ||
    deployment?.metadata?.labels?.["app.kubernetes.io/name"];

const deploymentNameExtractor = deployment =>
    deployment?.metadata?.labels?.["workload.cloud.uu/spp-0"] ||
    deployment?.metadata?.labels?.["app.kubernetes.io/name"];

/**
 * Try to find subApp name by APP_PACK_URL_PATH first.
 * If the app name is not registered under this name, use the name of the first container in the given pod.
 *
 * @param pod
 * @param subApp
 * @returns {boolean}
 */
const subAppSelectorFunction = (pod, subApp) =>
    pod?.metadata?.annotations?.APP_PACK_URL_PATH === subApp ||
    pod?.spec?.containers[0]?.name === subApp ||
    pod?.metadata?.labels?.["workload.cloud.uu/spp-0"] === subApp ||
    pod?.metadata?.labels?.["app.kubernetes.io/name"] === subApp;

const getSubApp = (pods, subApp) => {
    return pods.find(pod => subAppSelectorFunction(pod, subApp));
};

const getSubAppCount = (pods, subApp) => {
    return pods.filter(pod => subAppSelectorFunction(pod, subApp)).length;
};

const getSubAppNodeSelectors = (pods, subApp) => {
    return getSubApp(pods, subApp)?.spec?.affinity?.nodeAffinity?.requiredDuringSchedulingIgnoredDuringExecution?.nodeSelectorTerms[0]?.matchExpressions;
};

module.exports = {
    subAppNameExtractor,
    deploymentNameExtractor,
    subAppSelectorFunction,
    getSubApp,
    getSubAppCount,
    getSubAppNodeSelectors
}
