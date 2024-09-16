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
            const backupDir = `${config.backup.backupPath}/backup-${new Date().toISOString()}.zip`;

            await new Promise((resolve, reject) => {
                backupKintoneData(context, config, backupDir, (error) => {
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

