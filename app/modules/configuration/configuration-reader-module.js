const path = require("path");

/**
 * Read js file from given file path location and parse its content to the object
 *
 * @param {string} filePath
 * @returns
 */

const loadFile = async filePath => {
    let file = require(filePath);
    if (typeof file === "function") {
        let loadedFile = await file();
        return loadedFile;
    }
    return file;
}

/**
 * Read first defined environment file only.
 *
 * @param cmdArgs
 * @param environment
 * @returns {*}
 */
const readEnvironmentConfiguration = async (cmdArgs, environment = undefined) => {
    resolveEnvironmentValue(cmdArgs);
    let filePath = path.resolve(`${cmdArgs.config}/${environment || cmdArgs.environment}.js`);
    return await loadFile(filePath);
};

/**
 * Read all environments defined within the cmdArgs.
 *
 * @param cmdArgs
 * @returns {*}
 */
const readEnvironmentsConfiguration = async cmdArgs => {
    const result = {};
    for (const environment of cmdArgs.environment) {
        result[environment] = await readEnvironmentConfiguration(cmdArgs, environment);
    }
    return result;
}

const readContextConfiguration = async (cmdArgs, environment = undefined) => {
    let filePath = path.resolve(`${cmdArgs.config}/contexts.js`);
    let contexts = await loadFile(filePath);
    return contexts.find(context => context.environment === cmdArgs.environment || context.environment === environment);
};

const readNodeSizeConfiguration = async cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/nodesizes.js`);
    return await loadFile(filePath);
}

const readBookkitConfiguration = async cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/bookkit-config.js`);
    return await loadFile(filePath);
}

const readEmailNotificationConfiguration = async cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/email-config.js`);
    return await loadFile(filePath);
}

const resolveEnvironmentValue = (cmdArgs) => {
    cmdArgs.environment = cmdArgs.environment.length === 1 ? cmdArgs.environment[0] : cmdArgs.environment;
}

module.exports = {
    readEnvironmentConfiguration,
    readEnvironmentsConfiguration,
    readContextConfiguration,
    readNodeSizeConfiguration,
    readBookkitConfiguration,
    readEmailNotificationConfiguration
}