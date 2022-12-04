const {readBookkitConfiguration} = require("../configuration/configuration-reader-module");
const login = require("../client/authorize-module");
const {guessKeysWithSpecificKeys, guessKeysWithoutSpecificKeys} = require("./helper/print-helper-module");
const {updateSection} = require("./helper/bookkit-helper-module");

const ERROR_COLOR_SCHEME = {
    colorSchema: "red",
    bgStyle: "filled"
};

const uu5StringTemplate = (rows, columns, header) => {
    return `<uu5string/>
        <UU5.Bricks.Lsi>
            <UU5.Bricks.Lsi.Item language="en">
                <UU5.Bricks.Section contentEditable level="3" header="${header.toUpperCase()}" colorSchema=null>
                    <UuContentKit.Bricks.BlockDefault>
                        <UU5.RichText.Block uu5string="Last update on ${new Date()}"/>
                    </UuContentKit.Bricks.BlockDefault>
                    <Uu5TilesBricks.Table 
                        data='<uu5json/>${JSON.stringify(rows)}' 
                        columns='<uu5json/>${JSON.stringify(columns)}'
                    />
                </UU5.Bricks.Section>
            </UU5.Bricks.Lsi.Item>
        </UU5.Bricks.Lsi>`;
}

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
                style: item[header].includes("NOK") ? ERROR_COLOR_SCHEME : {}
            }
        });
    return uu5StringTemplate(rows, columns, header);
}

const generateUu5StringProblemReport = (messages, header) => {
    let problems = messages
        .map(item => {
            return {
                subApp: item.subApp,
                problems: Object.values(item).filter(item => item.includes("NOK")).join(" - ")
            }
        }).
        filter(item => !!item.problems);
    let columns = [{header: "subApp"}, {header: "Problem"}];
    let rows = problems.map(item => {
        return {
            value: Object.values(item),
            style: ERROR_COLOR_SCHEME
        }
    });
    return uu5StringTemplate(rows, columns, header);
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

    if (envBookkitConfig.problemReport && cmdArgs.problemReport) {
        await updateSection(bookkitConfig.uri, envBookkitConfig.problemReport.page, envBookkitConfig.problemReport.section, generateUu5StringProblemReport(evaluationResult, cmdArgs.environment), token);
    }
}

module.exports = {printToBookkit};