const { cmdArguments } = require('../cli/arguments');
const { usage } = require('../cli/usage');
const { check, help, print, update, overview, version} = require('../../uucloud-k8s');

const COMMANDS = {
  COMMAND_HELP: 'help',
  COMMAND_CHECK: 'check',
  COMMAND_PRINT: 'print',
  COMMAND_UPDATE: 'update',
  COMMAND_OVERVIEW: 'overview',
  COMMAND_VERSION: 'version'
};

const actions = {
  showHelp: {
    condition: () => handleCondition(cmdArguments.command === COMMANDS.COMMAND_HELP || cmdArguments.help || Object.keys(cmdArguments).length === 0),
    action: async () => await help(usage)
  },
  runCheck: {
    condition: () => handleCondition(cmdArguments.command === COMMANDS.COMMAND_CHECK),
    action: async () => await check(cmdArguments)
  },
  runPrint: {
    condition: () => handleCondition(cmdArguments.command === COMMANDS.COMMAND_PRINT),
    action: async () => await print(cmdArguments)
  },
  runUpdate: {
    condition: () => handleCondition(cmdArguments.command === COMMANDS.COMMAND_UPDATE),
    action: async () => await update(cmdArguments)
  },
  runOverview: {
    condition: () => handleCondition(cmdArguments.command === COMMANDS.COMMAND_OVERVIEW),
    action: async () => await overview(cmdArguments)
  },
  showVersion: {
    condition: () => handleCondition(cmdArguments.command === COMMANDS.COMMAND_VERSION),
    action: async () => await version(cmdArguments)
  }
};

const handleCondition = (condition) => {
  if (_isKnownAction()) {
    return condition;
  }
};

const _isKnownAction = () => !cmdArguments._unknown;

module.exports = {
  actions,
  COMMANDS
};
