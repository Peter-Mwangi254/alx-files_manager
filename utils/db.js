import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

/**
 * Class for interacting with the MongoDB database
 */
class DBClient {
  constructor() {
    // Establish a connection to the MongoDB instance
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        // Connection successful, set up database and collections
        this.db = client.db(DB_DATABASE);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        // Connection failed, log error and set db to false
        console.log(err.message);
        this.db = false;
      }
    });
  }

  /**
   * Checks if the MongoDB connection is active
   * @return {boolean} true if connected, false if not
   */
  isAlive() {
    return Boolean(this.db);
  }

  /**
   * Retrieves the number of documents in the 'users' collection
   * @return {number} count of user documents
   */
  async nbUsers() {
    // Use the countDocuments method to get the number of user documents
    const numberOfUsers = this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  /**
   * Retrieves the number of documents in the 'files' collection
   * @return {number} count of file documents
   */
  async nbFiles() {
    // Use the countDocuments method to get the number of file documents
    const numberOfFiles = this.filesCollection.countDocuments();
    return numberOfFiles;
  }
  
  async findUserByEmail(email) {
    return this.db.collection('users').findOne({email});
  }

  async createUser(userData) {
    return this.db.collection('users').insertOne(userData);
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
