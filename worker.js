const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const dbClient = require('../utils/db');

const fileQueue = new Bull('fileQueue');
const userQueue = new Bull('userQueue');

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

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) throw new Error('Missing userId');

  const user = await dbClient.findUserById(userId);
  if (!user) throw new Error('User not found');

  console.log(`Welcome ${user.email}!`);
});
