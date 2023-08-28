const {guessKeysWithoutSpecificKeys} = require("./helper/print-helper-module");
const {readBookkitConfiguration} = require("../configuration/configuration-reader-module");
const login = require("../client/authorize-module");
const {updateSection} = require("./helper/bookkit-helper-module");
const {uu5StringTableTemplate} = require("./template/table-template");

const ERROR_COLOR_SCHEME = {
    colorSchema: "red",
    bgStyle: "filled"
};

const OK_COLOR_SCHEME = {
    colorSchema: "teal",
    bgStyle: "filled"
};

const generateUu5StringForOverview = (overview, columnType) => {
    let header = guessKeysWithoutSpecificKeys(overview[columnType]).map((col, index) => {
        let obj = {};
        obj.header = col.replace(`_${columnType}`, "");
        if (index === 0) {
            obj.minWidth = "l"
        } else {
            obj.textAlignnent = "center"
            obj.minWidth = "xs"
            obj.maxWidth = "s"
        }
        return obj;
    });

    const rows = overview[columnType].map(item => {
        return Object.values(item).map(itemValue => {
            return {
                value: itemValue || '0',
                style: itemValue === 0 ? ERROR_COLOR_SCHEME : itemValue >= 1 ? OK_COLOR_SCHEME : {}
            }
        })
    });

    return uu5StringTableTemplate(rows, header, columnType)
}

const printOverviewToBookkit = async (overview, cmdArgs) => {
    let bookkitConfig = await readBookkitConfiguration(cmdArgs);
    let token = await login(bookkitConfig.oidcHost, bookkitConfig.accessCode1, bookkitConfig.accessCode2);
    let overviewConfig = bookkitConfig.overview;

    await updateSection(bookkitConfig.uri, overviewConfig.page, overviewConfig.sections["DEPLOYMENT"], generateUu5StringForOverview(overview, "count"), token);
    await updateSection(bookkitConfig.uri, overviewConfig.page, overviewConfig.sections["NODE_SIZE"], generateUu5StringForOverview(overview, "nodesize"), token);
    await updateSection(bookkitConfig.uri, overviewConfig.page, overviewConfig.sections["SUM"], generateUu5StringForOverview(overview, "sum"), token);
}

module.exports = {
    printOverviewToBookkit
}