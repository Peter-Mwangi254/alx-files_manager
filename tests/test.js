import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import { promisify } from 'util';
import app from '../server';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

use(chaiHttp);
should();

describe('Testing the clients for MongoDB and Redis', () => {
  describe('Redis Client', () => {
    before(async () => {
      await redisClient.client.flushall('ASYNC');
    });

    after(async () => {
      await redisClient.client.flushall('ASYNC');
    });

    it('shows that connection is alive', async () => {
      expect(redisClient.isAlive()).to.equal(true);
    });

    it('returns key as null because it does not exist', async () => {
      expect(await redisClient.get('myKey')).to.equal(null);
    });

    it('set key can be called without issue', async () => {
      expect(await redisClient.set('myKey', 12, 1)).to.equal(undefined);
    });

    it('returns key with null because it expired', async () => {
      const sleep = promisify(setTimeout);
      await sleep(1100);
      expect(await redisClient.get('myKey')).to.equal(null);
    });
  });

  describe('db Client', () => {
    before(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });
    after(async () => {
      await dbClient.usersCollection.deleteMany({});
      await dbClient.filesCollection.deleteMany({});
    });

    it('shows that connection is alive', () => {
      expect(dbClient.isAlive()).to.equal(true);
    });

    it('shows number of user documents', async () => {
      await dbClient.usersCollection.deleteMany({});
      expect(await dbClient.nbUsers()).to.equal(0);

      await dbClient.usersCollection.insertOne({ name: 'Larry' });
      await dbClient.usersCollection.insertOne({ name: 'Karla' });
      expect(await dbClient.nbUsers()).to.equal(2);
    });

    it('shows number of file documents', async () => {
      await dbClient.filesCollection.deleteMany({});
      expect(await dbClient.nbFiles()).to.equal(0);

      await dbClient.filesCollection.insertOne({ name: 'FileOne' });
      await dbClient.filesCollection.insertOne({ name: 'FileTwo' });
      expect(await dbClient.nbFiles()).to.equal(2);
    });
  });
});

describe('Testing the API endpoints', () => {
  // Helper function to generate a new user and get the auth token
  async function createUserAndGetToken() {
    const res = await chai.request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    return res.body.token;
  }

  describe('GET /status', () => {
    it('should return status ok', (done) => {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.eql({ redis: true, db: true });
          done();
        });
    });
  });

  describe('GET /stats', () => {
    it('should return stats', (done) => {
      chai.request(app)
        .get('/stats')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys(['users', 'files']);
          done();
        });
    });
  });

  describe('POST /users', () => {
    it('should create a new user', (done) => {
      chai.request(app)
        .post('/users')
        .send({ email: 'user@example.com', password: 'password' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.keys(['id', 'email']);
          done();
        });
    });
  });

  describe('GET /connect', () => {
    it('should log in a user', async () => {
      const token = await createUserAndGetToken();
      expect(token).to.be.a('string');
    });
  });

  describe('GET /disconnect', () => {
    it('should log out a user', async () => {
      const token = await createUserAndGetToken();
      const res = await chai.request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res).to.have.status(204);
    });
  });

  describe('GET /users/me', () => {
    it('should return user info', async () => {
      const token = await createUserAndGetToken();
      const res = await chai.request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.keys(['id', 'email']);
    });
  });

  describe('POST /files', () => {
    it('should create a new file', async () => {
      const token = await createUserAndGetToken();
      const res = await chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .send({ name: 'testFile', type: 'file', parentId: 0 });
      expect(res).to.have.status(201);
      expect(res.body).to.have.keys(['id', 'userId', 'name', 'type', 'isPublic', 'parentId']);
    });
  });

  describe('GET /files/:id', () => {
    it('should get a file by id', async () => {
      const token = await createUserAndGetToken();
      const resFile = await chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .send({ name: 'testFile', type: 'file', parentId: 0 });
      const fileId = resFile.body.id;
      const res = await chai.request(app)
        .get(`/files/${fileId}`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body).to.have.keys(['id', 'userId', 'name', 'type', 'isPublic', 'parentId']);
    });
  });

  describe('GET /files', () => {
    it('should get a list of files with pagination', async () => {
      const token = await createUserAndGetToken();
      const res = await chai.request(app)
        .get('/files')
        .set('X-Token', token)
        .query({ page: 0 });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
    });
  });

  describe('PUT /files/:id/publish', () => {
    it('should publish a file', async () => {
      const token = await createUserAndGetToken();
      const resFile = await chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .send({ name: 'testFile', type: 'file', parentId: 0 });
      const fileId = resFile.body.id;
      const res = await chai.request(app)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body.isPublic).to.equal(true);
    });
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should unpublish a file', async () => {
      const token = await createUserAndGetToken();
      const resFile = await chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .send({ name: 'testFile', type: 'file', parentId: 0 });
      const fileId = resFile.body.id;
      const res = await chai.request(app)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.body.isPublic).to.equal(false);
    });
  });

  describe('GET /files/:id/data', () => {
    it('should get the data of a file', async () => {
      const token = await createUserAndGetToken();
      const resFile = await chai.request(app)
        .post('/files')
        .set('X-Token', token)
        .send({ name: 'testFile', type: 'file', parentId: 0, localPath: '/tmp/files_manager/testFile' });
      const fileId = resFile.body.id;
      const res = await chai.request(app)
        .get(`/files/${fileId}/data`)
        .set('X-Token', token);
      expect(res).to.have.status(200);
      expect(res.text).to.equal('Hello Webstack!');
    });
  });
});

