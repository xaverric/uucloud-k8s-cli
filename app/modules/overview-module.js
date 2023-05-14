const {readNodeSizeConfiguration} = require("./configuration/configuration-reader-module");

const getOverviewResult = (cmdArgs, environments) => {
    const overview = getOverview(environments);
    return {
        count: getFilteredOverviewColumns(overview, "count"),
        nodesize: getFilteredOverviewColumns(overview, "nodesize"),
        sum: getSumOverview(cmdArgs, environments, overview)
    }
}

const getOverview = (environments) => {
    // get unique uuApps names across all environments
    let uuAppsSet = [...new Set(Object.keys(environments).flatMap(env => Object.keys(environments[env])))]

    return uuAppsSet.map(uuApp => {
        return Object.keys(environments).reduce((acc, env) => {
            const envUuApp = environments[env][uuApp];
            acc.uuAppName = uuApp;
            acc[`${env}_count`] = (envUuApp?.required && envUuApp?.count) || 0
            acc[`${env}_nodesize`] = envUuApp?.nodeSize;
            return acc;
        }, {});
    });
}

const getSumOverview = (cmdArgs, environments, overview) => {
    let nodesizes = readNodeSizeConfiguration(cmdArgs);
    return Object.keys(environments).map(environment => {
        return {
            environment,
            cpu: _sumCpuResourcesForEnvironment(overview, environment, nodesizes),
            ram: _sumRamResourcesForEnvironment(overview, environment, nodesizes),
        }
    })
}

const _sumCpuResourcesForEnvironment = (result, environment, nodesizes) => {
    return result.reduce((acc, item) => {
        let uuAppCount = item[`${environment}_count`];
        if (uuAppCount > 0) {
            let cpu = nodesizes[item[`${environment}_nodesize`]].cpu;
            acc += cpu * uuAppCount;
        }

        return acc;
    }, 0);
}

const _sumRamResourcesForEnvironment = (result, environment, nodesizes) => {
    return result.reduce((acc, item) => {
        let uuAppCount = item[`${environment}_count`];
        if (uuAppCount > 0) {
            let uuAppNodesize = item[`${environment}_nodesize`];
            let ram = Array.isArray(nodesizes[uuAppNodesize]?.memory) ? nodesizes[uuAppNodesize]?.memory[0] : nodesizes[uuAppNodesize]?.memory;
            ram = ram.replace("Mi", "");
            if (ram.includes("Gi")) {
                ram = ram.replace("Gi", "")
                ram = parseInt(ram) * 1024;
            }
            acc += parseInt(ram) * uuAppCount;
        }
        return acc;
    }, 0);
}

const getFilteredOverviewColumns = (overview, columnnKey) => {
    return overview.map(item => {
        return Object.keys(item)
            .filter(attr => attr.includes(columnnKey) || attr === "uuAppName")
            .reduce((acc, key) => {
                acc[key] = item[key];
                return acc;
            }, {});
    })
}

module.exports = {
    getOverviewResult
}