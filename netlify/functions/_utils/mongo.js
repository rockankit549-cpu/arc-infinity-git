const { MongoClient } = require('mongodb');

let cachedClient;
let cachedClientPromise;

const getMongoDb = async () => {
    const uri = process.env.MongoDB_URI ;
    if (!uri) {
        throw new Error('MONGODB_URI is not defined.');
    }

    if (!cachedClient) {
        cachedClient = new MongoClient(uri, { maxPoolSize: 5 });
    }

    if (!cachedClientPromise) {
        cachedClientPromise = cachedClient.connect();
    }

    await cachedClientPromise;

    const dbName = process.env.MongoDB_URI || 'WebReporting';
    return cachedClient.db(dbName);
};

module.exports = {
    getMongoDb,
};
