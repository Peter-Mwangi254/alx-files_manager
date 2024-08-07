const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
const dbClient = require('../utils/db');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.findFileById(fileId);
  if (!file || file.userId.toString() !== userId) {
    throw new Error('File not found');
  }

  const widths = [500, 250, 100];
  const options = { responseType: 'base64' };

  for (const width of widths) {
    const thumbnail = await imageThumbnail(file.localPath, { ...options, width });
    const thumbnailPath = `${file.localPath}_${width}`;
    await fs.promises.writeFile(thumbnailPath, Buffer.from(thumbnail, 'base64'));
  }
});
