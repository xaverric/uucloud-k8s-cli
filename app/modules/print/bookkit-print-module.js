const {readBookkitConfiguration} = require("../configuration/configuration-reader-module");
const login = require("../client/authorize-module");
const {guessKeysWithSpecificKeys, guessKeysWithoutSpecificKeys} = require("./helper/print-helper-module");
const {updateSection} = require("./helper/bookkit-helper-module");
const {gatherProblemsFromEvaluationResult} = require("../evalution-module");
const {uu5StringTableTemplate} = require("./template/table-template");

const ERROR_COLOR_SCHEME = {
    colorSchema: "red",
    bgStyle: "filled"
};

const generateUu5StringForKey = (messages, header) => {
    let columns = guessKeysWithSpecificKeys(messages, "subApp", header).map(col => {
        return {header: col}
    });
    let rows = messages
        // make sure only values for defined header will be filled
        .map(message => {
            return {subApp: message.subApp, [header]: message[header]}
        })
        .map(item => {
            return {
                value: Object.values(item),
                style: item[header]?.includes("NOK") ? ERROR_COLOR_SCHEME : {}
            }
        });
    return uu5StringTableTemplate(rows, columns, header);
}

const generateUu5StringProblemReport = (messages, header) => {
    let problems = gatherProblemsFromEvaluationResult(messages);
    let columns = [{header: "subApp"}, {header: "Problem"}];
    let rows = problems.map(item => {
        return {
            value: Object.values(item),
            style: ERROR_COLOR_SCHEME
        }
    });
    return uu5StringTableTemplate(rows, columns, header);
}

const printToBookkit = async (evaluationResult, cmdArgs) => {
    let bookkitConfig = readBookkitConfiguration(cmdArgs);
    let token = await login(bookkitConfig.oidcHost, bookkitConfig.accessCode1, bookkitConfig.accessCode2);
    let envBookkitConfig = bookkitConfig.environment[cmdArgs.environment];

    for (const key of guessKeysWithoutSpecificKeys(evaluationResult, "subApp")) {
        if (envBookkitConfig.sections[key]) {
            await updateSection(bookkitConfig.uri, envBookkitConfig.page, envBookkitConfig.sections[key], generateUu5StringForKey(evaluationResult, key), token);
        }
    }

    if (envBookkitConfig.problemReport && cmdArgs.problemReportToBookkit) {
        await updateSection(bookkitConfig.uri, envBookkitConfig.problemReport.page, envBookkitConfig.problemReport.section, generateUu5StringProblemReport(evaluationResult, cmdArgs.environment), token);
    }
}

module.exports = {printToBookkit};