import sha1 from 'sha1';

const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');
    const hashedPassword = sha1(password);

    try {
      const existingUser = await dbClient.findUserByEmailAndPassword(email, hashedPassword);
      if (!existingUser) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, existingUser._id.toString(), 86400); // 24 hours in seconds
      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;

    try {
      const userId = await redisClient.get(key);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      await redisClient.del(key);
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
