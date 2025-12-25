const { buildCollectionHandler } = require('./_utils/collection-handler');

const collectionName = process.env.MONGODB_TESTS_COLLECTION || 'testRecords';

exports.handler = buildCollectionHandler({ collectionName });
