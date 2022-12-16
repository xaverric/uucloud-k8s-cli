const {CONSOLE_LOG, LOG} = require("../../logger/logger");
const {guessKeysWithoutSpecificKeys, guessKeys} = require("./helper/print-helper-module");
const {printJiraTable} = require("./helper/jira-table-printer");

const isNotEmpty = value => {
    return !!value;
}

const printMessages = (key, messages, logger) => {
    messages.forEach(message => {
        logger.debug(`${message.subApp} - ${message[key]}`);
    });
    if (messages.length === 0) {
        logger.debug("Nothing to report...")
    }
}

const printLineContent = (array, cmdArgs, logger) => {
    guessKeysWithoutSpecificKeys(array, "subApp").forEach(key => {
        logger.debug(`------- Evaluating ${key} for ${cmdArgs.environment.toUpperCase()} -------`);
        let messages = array.filter(subApp => isNotEmpty(subApp[key]));
        printMessages(key, messages, logger);
    });
}

const printVerbose = (array, cmdArgs) => {
    CONSOLE_LOG.debug(`------------------------------ ${cmdArgs.environment.toUpperCase()} ------------------------------`)
    if (cmdArgs.table) {
        CONSOLE_LOG.debug(`------- Evaluating ${guessKeys(array)} for ${cmdArgs.environment.toUpperCase()} -------`);
        console.table(array);
    }
    printLineContent(array, cmdArgs, cmdArgs.table ? LOG : CONSOLE_LOG);
}

const printNoVerboseStatus = (array, cmdArgs) => {
    CONSOLE_LOG.debug(`------------------------------ ${cmdArgs.environment.toUpperCase()} Deployment Status ------------------------------`)
    const DESC = {
        DEPLOYMENT: "App properly deployed",
        NODE_SELECTOR: "App deployed on the expected dedicated HW for the given environment",
        NODE_SIZE: "App HW resources defined as expected - RAM/CPU reservation",
        CONTAINER_STATUS: "App instance running as expected",
        VOLUME: "App has access to the defined storage"
    }

    let result = guessKeysWithoutSpecificKeys(array, "subApp").map(key => {
        let problems = array.map(item => item[key]).filter(item => item.includes("NOK")).length;
        return {
            CHECK_TYPE: key,
            DESCRIPTION: DESC[key],
            RESULT: problems > 0 ? `NOK - ${problems} problems` : "OK"
        }
    });
    if (cmdArgs.table) {
        console.table(result);
    } else {
        console.log(printJiraTable(result));
    }

}

module.exports = {
    printVerbose,
    printNoVerboseStatus
}