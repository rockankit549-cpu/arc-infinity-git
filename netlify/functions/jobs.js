const { buildCollectionHandler } = require('./_utils/collection-handler');

const collectionName = process.env.MONGODB_JOBS_COLLECTION || 'jobRecords';

exports.handler = buildCollectionHandler({ collectionName });
