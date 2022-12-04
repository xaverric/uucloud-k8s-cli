const {CONSOLE_LOG, LOG} = require("../../logger/logger");
const {guessKeysWithoutSpecificKeys, guessKeys} = require("./helper/print-helper-module");

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
    CONSOLE_LOG.debug(`------------------------------ ${cmdArgs.environment.toUpperCase()} ------------------------------`)
    let result = guessKeysWithoutSpecificKeys(array, "subApp").map(key => {
        let problems = array.map(item => item[key]).filter(item => item.includes("NOK")).length;
        return {
            CHECK_TYPE: key,
            RESULT: problems > 0 ? `NOK - ${problems} problems` : "OK"
        }
    });
    console.table(result);
}

module.exports = {
    printVerbose,
    printNoVerboseStatus
}