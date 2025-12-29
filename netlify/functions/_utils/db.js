const { neon } = require('@netlify/neon');

let cachedClient;

const getClient = () => {
    const connectionString = process.env.MongoDB_URI;
    if (!connectionString) {
        throw new Error('NETLIFY_DATABASE_URL is not defined.');
    }

    if (!cachedClient) {
        cachedClient = neon(connectionString);
    }

    return cachedClient;
};

module.exports = {
    getClient,
};
