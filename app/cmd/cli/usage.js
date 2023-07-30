const commandLineUsage = require('command-line-usage');
const { cmdArgumentsDefinition } = require('./arguments.js');
const packageJson = require("../../../package.json");

const usageDefinition = [
  {
    header: `uucloud-k8s-cli @${packageJson.version}`,
    content: 'An amazing command line tool allowing you to verify your k8s deployments on on-premise uucloud'
  },
  {
    header: 'Synopsis',
    content: '$uucloud-k8s <command> <command parameters>'
  },
  {
    header: 'Commands',
    content: [
      { name: 'help', summary: 'Display this help.' },
      { name: 'check', summary: 'Performs checks based on given parameters and configuration.' },
      { name: 'print', summary: 'Performs print based on given parameters and configuration. Result is printed into the defined bookkit page.' },
      { name: 'update', summary: 'Performs update of the node selectors based on the configuration right in the k8s cluster.' },
      { name: 'scale', summary: 'Performs update of the node selectors based on the configuration right in the k8s cluster.' },
      { name: 'overview', summary: 'Performs overview of multiple environments at once.' },
      { name: 'version', summary: 'Show tool version.' }
    ]
  },
  {
    header: 'Parameters',
    optionList: cmdArgumentsDefinition
  }
];

const usage = commandLineUsage(usageDefinition);

module.exports = {
  usage
};
