const { buildCollectionHandler } = require('./_utils/collection-handler');

const collectionName = process.env.MONGODB_CLIENTS_COLLECTION || 'clientData';

exports.handler = buildCollectionHandler({
    collectionName,
    findQuery: { docType: { $ne: 'document' } },
});
