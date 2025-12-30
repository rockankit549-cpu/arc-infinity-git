const { buildCollectionHandler } = require('./_utils/collection-handler');

const collectionName = 'clientData';

exports.handler = buildCollectionHandler({
    collectionName,
    findQuery: { docType: { $ne: 'document' } },
});
