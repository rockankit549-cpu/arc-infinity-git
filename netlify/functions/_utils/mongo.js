const { MongoClient } = require('mongodb');

let cachedClient;
let cachedClientPromise;

const getMongoDb = async () => {
    const uri = process.env.MONGODB_URI || process.env.MongoDB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI (or MongoDB_URI) is not defined.');
    }

    if (!cachedClient) {
        cachedClient = new MongoClient(uri, { maxPoolSize: 5 });
    }

    if (!cachedClientPromise) {
        cachedClientPromise = cachedClient.connect();
    }

    await cachedClientPromise;

    const dbName = process.env.MONGODB_DB || process.env.MongoDB_DB;
    return dbName ? cachedClient.db(dbName) : cachedClient.db();
};

module.exports = {
    getMongoDb,
};
