const {guessKeysWithoutSpecificKeys} = require("./print-helper-module");

const printJiraTable = array => {
    let keys = guessKeysWithoutSpecificKeys(array, "subApp");
    const header = `||${keys.join("||")}||\n`;
    const body = array.map(arrayItem => {
        let row = keys.reduce((acc, item) => {
            acc += `${arrayItem[item]}|`;
            return acc;
        }, "");
        return `|${row}`
    }).join("\n");
    return header + body;
}

module.exports = {
    printJiraTable
}