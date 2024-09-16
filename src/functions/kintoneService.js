const { exec } = require('child_process');

function backupKintoneData(context, config, backupDir, callback) {
    const { appId, username, password, domain } = config.kintone;
    const kintoneCommand = `kintone-cli export --app-id ${appId} --username ${username} --password ${password} --domain ${domain} --attachment --dest ${backupDir}`;

    exec(kintoneCommand, (error, stdout, stderr) => {
        if (error) {
            context.log.error(`Error executing Kintone CLI: ${error.message}`);
            callback(error);
            return;
        }
        if (stderr) {
            context.log.error(`Kintone CLI stderr: ${stderr}`);
            callback(new Error(stderr));
            return;
        }
        context.log(`Backup successful: ${stdout}`);
        callback(null);
    });
}

module.exports = { backupKintoneData };
