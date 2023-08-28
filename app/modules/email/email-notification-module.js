const nodemailer = require("nodemailer");
const {CONSOLE_LOG} = require("../../logger/logger");
const {gatherProblemsFromEvaluationResult} = require("../evalution-module");
const {readEmailNotificationConfiguration} = require("../configuration/configuration-reader-module");
const {buildEmailHtmlContent} = require("./template/email-html-content-builder");

const sendEmailNotification = async (evaluationResult, cmdArgs) => {
    const problems = gatherProblemsFromEvaluationResult(evaluationResult);
    _shouldNotify(problems, cmdArgs) && await _processEmailNotifications(problems, cmdArgs);
}

const _shouldNotify = (problems, cmdArgs) => {
    return cmdArgs.problemReportToEmail && problems.length > 0;
}

const _processEmailNotifications = async (problems, cmdArgs) => {
    const emailConfiguration = await readEmailNotificationConfiguration(cmdArgs);
    const emailContent = buildEmailHtmlContent({problems, environment: cmdArgs.environment.toUpperCase()});
    let transporter = nodemailer.createTransport(emailConfiguration.transportsConfiguration);
    await _sendEmailForRecipients(emailConfiguration, emailContent, transporter, cmdArgs);
}

const _sendEmailForRecipients = async (emailConfiguration, emailContent, transporter, cmdArgs) => {
    for (const recipient of emailConfiguration.recipients) {
        CONSOLE_LOG.info(`Sending email notification to recipient: ${recipient} (${cmdArgs.environment.toUpperCase()})`);
        let info = await transporter.sendMail({
            from: '"uucloud-k8s-cli notification 👀" <noreply@uucloud-k8s-cli.com>',
            to: recipient,
            subject: `Problems in ${cmdArgs.environment.toUpperCase()} environment`,
            html: emailContent
        });
        CONSOLE_LOG.info(`Email sent to ${recipient} - ID: ${info.messageId}`);
    }
}

module.exports = {
    sendEmailNotification
}