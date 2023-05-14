const fs = require("fs");
const path = require("path");

/**
 * Read JSON file from given file path location and parse its content to the object
 *  
 * @param {string} filePath 
 * @returns 
 */
const readJsonFile = filePath => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
        throw new Error(`Error occurred during loading file ${filePath}. Err: ${err}`);
    }
    return data;
};

/**
 * Read first defined environment file only.
 *
 * @param cmdArgs
 * @param environment
 * @returns {*}
 */
const readEnvironmentConfiguration = (cmdArgs, environment = undefined) => {
    resolveEnvironmentValue(cmdArgs);
    let filePath = path.resolve(`${cmdArgs.config}/${environment || cmdArgs.environment}.json`);
    return readJsonFile(filePath);
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
    let filePath = path.resolve(`${cmdArgs.config}/contexts.json`);
    let contexts = readJsonFile(filePath);
    let environmentDetails = contexts.find(context => context.environment === cmdArgs.environment || context.environment === environment);
    return environmentDetails
};

const readNodeSizeConfiguration = cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/nodesizes.json`);
    return readJsonFile(filePath);
}

const readBookkitConfiguration = cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/bookkit-config.json`);
    return readJsonFile(filePath);
}

const readEmailNotificationConfiguration = cmdArgs => {
    let filePath = path.resolve(`${cmdArgs.config}/email-config.json`);
    return readJsonFile(filePath);
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