const mongoose = require('mongoose');

// Each test file gets its own throwaway database so tests never touch real data.
//
// By default we spin up mongodb-memory-server (an in-process MongoDB). That
// needs to download a small binary the very first time it runs.
// If that download is blocked (restricted campus Wi-Fi, offline marking, etc.)
// you can point the tests at any real MongoDB instead:
//
//   MONGO_URI_TEST=mongodb://127.0.0.1:27017/shopwave_test npm test
//
let mongod = null;

const connect = async () => {
  let uri = process.env.MONGO_URI_TEST;

  if (!uri) {
    // Required lazily so the package is only needed when it is actually used.
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }

  await mongoose.connect(uri);
};

// Wipe documents between tests, but keep indexes so unique constraints still apply.
const clear = async () => {
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
};

const close = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
};

module.exports = { connect, clear, close };
