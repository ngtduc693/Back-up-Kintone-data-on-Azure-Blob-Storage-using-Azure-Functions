const { app } = require('@azure/functions');
const fs = require('fs');
const { uploadToBlobStorage } = require('../service/blobStorageService');
const { backupKintoneData } = require('../service/kintoneService');

app.timer('backupKintoneTrigger', {
    schedule: '0 0 1 * *',
    handler: async (myTimer, context) => {
        try {
            console.log('Timer function processed request.');

            const config = JSON.parse(fs.readFileSync(`${__dirname}/config.json`, 'utf8'));
            
            const backupDir = `${__dirname}\\${config.backup.backupPath}\\backup-${sanitizeFolderName(new Date().toISOString())}`;

            const backupFile = `${backupDir}\\${config.backup.backupFileName}`

            if (!fs.existsSync(backupDir)) {
                console.log(`Backup directory does not exist. Creating new directory at ${backupDir}...`);
                fs.mkdirSync(backupDir, { recursive: true });
            }

            await new Promise((resolve, reject) => {
                backupKintoneData(context, config, backupFile, (error) => {
                    if (error) {
                        console.log('Error during Kintone backup:', error);
                        reject(new Error('Kintone backup failed.'));
                    } else {
                        console.log('Kintone backup successful.');
                        resolve();
                    }
                });
            });

            await uploadToBlobStorage(context, backupDir, config);
            console.log('Backup successfully uploaded to Azure Blob Storage.');

        } catch (error) {
            console.log('An error occurred:', error.message);
            console.log(error.stack);
        }
    }
});
const sanitizeFolderName = (name) => {
    return name
        .replace(/[\/\\:*?"<>|]/g, '-')
        .replace(/[\s]+/g, '-')
        .toLowerCase();
};
