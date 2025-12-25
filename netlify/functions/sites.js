const { buildCollectionHandler } = require('./_utils/collection-handler');

const collectionName = process.env.MONGODB_SITES_COLLECTION || 'siteRecords';

exports.handler = buildCollectionHandler({ collectionName });
