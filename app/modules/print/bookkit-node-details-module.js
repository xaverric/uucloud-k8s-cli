const {guessKeys} = require("./helper/print-helper-module");
const {readBookkitConfiguration} = require("../configuration/configuration-reader-module");
const login = require("../client/authorize-module");
const {updateSection} = require("./helper/bookkit-helper-module");
const {uu5StringTableTemplate} = require("./template/table-template");

const ERROR_COLOR_SCHEME = {
    colorSchema: "red",
    bgStyle: "filled"
};

const generateUu5StringForNodes = (metadata) => {
    metadata = metadata
        .map(item => {
            return {
                kind: item.kind,
                name: item.metadata.name,
                ip: item.status.addresses.find(addr => addr.type === "InternalIP")?.address,
                allocatableCpu: item.status.allocatable.cpu,
                allocatableMemory: item.status.allocatable.memory,
                cpu: item.status.capacity.cpu,
                memory: item.status.capacity.memory
            }
        });
    let header = guessKeys(metadata).map(item => {
        return {
            header: item
        }
    })

    const rows = metadata
        .map(item => {
            return Object.values(item).map(itemValue => {
                return {
                    value: itemValue || '',
                    style: itemValue === '' ? ERROR_COLOR_SCHEME : {}
                }
            })
        });

    return uu5StringTableTemplate(rows, header, "Nodes")
}

const printNodesToBookkit = async (metadata, cmdArgs) => {
    let bookkitConfig = await readBookkitConfiguration(cmdArgs);
    let token = await login(bookkitConfig.oidcHost, bookkitConfig.accessCode1, bookkitConfig.accessCode2);
    let envBookkitConfig = bookkitConfig.environment[cmdArgs.environment];

    await updateSection(bookkitConfig.uri, envBookkitConfig.nodes.page, envBookkitConfig.nodes.code, generateUu5StringForNodes(metadata), token);
}

module.exports = {
    printNodesToBookkit
}