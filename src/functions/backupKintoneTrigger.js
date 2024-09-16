const { app } = require('@azure/functions');
const fs = require('fs');
const { uploadToBlobStorage } = require('./blobStorageService');
const { backupKintoneData } = require('./kintoneService');

app.timer('backupKintoneTrigger', {
    schedule: '0 0 1 * *',
    handler: async (myTimer, context) => {
        try {
            context.log('Timer function processed request.');

            const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
            const backupDir = `${config.backup.backupPath}/backup-${new Date().toISOString()}.zip`;

            await new Promise((resolve, reject) => {
                backupKintoneData(context, config, backupDir, (error) => {
                    if (error) {
                        context.log('Error during Kintone backup:', error);
                        reject(new Error('Kintone backup failed.'));
                    } else {
                        context.log('Kintone backup successful.');
                        resolve();
                    }
                });
            });

            await uploadToBlobStorage(context, backupDir, config);
            context.log('Backup successfully uploaded to Azure Blob Storage.');

        } catch (error) {
            context.log.error('An error occurred:', error.message);
            context.log.error(error.stack);
        }
    }
});

