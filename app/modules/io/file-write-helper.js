const fs = require("fs");
const path = require("path");
const os = require("os");
const {subAppNameExtractor} = require("../c3/c3-search-helper");

const DEPLOYMENT_BACKUP_PATH = path.join(os.homedir(), '.uucloud-k8s', 'deployments_backup');

const storeDeployments = (deployments, postfix = "") => {
    createDefaultFolderIfNotExist(DEPLOYMENT_BACKUP_PATH);
    const executionTime = Date.now();
    deployments.forEach(deployment => {
        let name = subAppNameExtractor(deployment);
        fs.writeFileSync(path.join(DEPLOYMENT_BACKUP_PATH, `${name}${postfix}${executionTime}.json`), JSON.stringify(deployment, null, 4), "utf-8");
    })
}

const createDefaultFolderIfNotExist = (path) => {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
}

module.exports = {
    storeDeployments,
    createDefaultFolderIfNotExist
}