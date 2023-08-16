const fs = require("fs");
const path = require("path");

/**
 * Read js file from given file path location and parse its content to the object
 *
 * @param {string} filePath
 * @returns
 */

const loadFile = filePath => {
    let file = require(filePath);
    if (typeof file === "function") {
        let loadedFile = file();
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
const readEnvironmentConfiguration = (cmdArgs, environment = undefined) => {
    resolveEnvironmentValue(cmdArgs);
    let filePath = path.resolve(`${cmdArgs.config}/${environment || cmdArgs.environment}.js`);
    return loadFile(filePath);
};

/**
 * Read all environments defined within the cmdArgs.
 *
 * @param cmdArgs
 * @returns {*}
 */
const readEnvironmentsConfiguration = cmdArgs => {
    return cmdArgs.environment.reduce((acc, env) => {
        acc[env] = readEnvironmentConfiguration(cmdArgs, env);
        return acc;
    }, {});
}

const readContextConfiguration = (cmdArgs, environment = undefined) => {
    let filePath = path.resolve(`${cmdArgs.config}/contexts.js`);
    let contexts = loadFile(filePath);
    let environmentDetails = contexts.find(context => context.environment === cmdArgs.environment || context.environment === environment);
    return environmentDetails
};

const readNodeSizeConfiguration = cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/nodesizes.js`);
    return loadFile(filePath);
}

const readBookkitConfiguration = cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/bookkit-config.js`);
    return loadFile(filePath);
}

const readEmailNotificationConfiguration = cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/email-config.js`);
    return loadFile(filePath);
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