const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');

async function uploadToBlobStorage(context, backupFolderPath, backupFolderName, backupFileName, config) {
    try {
        const connectionString = config.azure.storageConnectionString;
        const containerName = config.azure.containerName;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const blobName = backupFolderName;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const fileStream = fs.createReadStream(`${backupFolderPath}\\${backupFileName}`);
        await blockBlobClient.uploadStream(fileStream, fileStream.length);

        console.log(`Backup uploaded to Blob Storage: ${blobName}`);
    } catch (error) {
        console.log('Error uploading to Blob Storage:', error.message);
        throw new Error('Failed to upload backup to Azure Blob Storage.');
    }
}

module.exports = { uploadToBlobStorage };
