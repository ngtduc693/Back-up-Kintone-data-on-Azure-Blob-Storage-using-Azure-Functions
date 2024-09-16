const path = require('path');
const { exec } = require('child_process');

function backupKintoneData(context, config, backupFileName, callback) {
    const cliKintoneLibPath = path.join(__dirname, '..', 'lib', 'cli-kintone.exe');
    const { appId, apiToken, domain } = config.kintone;
    const kintoneCommand = `${cliKintoneLibPath} record export --app ${appId} --api-token ${apiToken} --base-url ${domain} > ${backupFileName}`;

    exec(kintoneCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`Error executing Kintone CLI: ${error.message}`);
            callback(error);
            return;
        }
        if (stderr) {
            console.log(`Kintone CLI stderr: ${stderr}`);
            callback(new Error(stderr));
            return;
        }
        console.log(`Backup successful: ${stdout}`);
        callback(null);
    });
}

module.exports = { backupKintoneData };
