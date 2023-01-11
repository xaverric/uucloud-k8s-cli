const fs = require("fs");
const path = require("path");
const os = require("os");
const {subAppNameExtractor} = require("../c3/c3-search-helper");

const DEPLOYMENT_BACKUP_PATH = path.join(os.homedir(), '.uucloud-k8s', 'deployments_backup')

const storeDeployments = (deployments, postfix = "") => {
    _createDefaultFolderIfNotExist();
    const executionTime = Date.now();
    deployments.forEach(deployment => {
        let name = subAppNameExtractor(deployment);
        fs.writeFileSync(path.join(DEPLOYMENT_BACKUP_PATH, `${name}${postfix}${executionTime}.json`), JSON.stringify(deployment, null, 4));
    })
}

const _createDefaultFolderIfNotExist = () => {
    if (!fs.existsSync(DEPLOYMENT_BACKUP_PATH)) {
        fs.mkdirSync(DEPLOYMENT_BACKUP_PATH, {recursive: true});
    }
}

module.exports = {
    storeDeployments
}