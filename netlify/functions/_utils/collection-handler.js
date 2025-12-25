const { ObjectId } = require('mongodb');
const { getMongoDb } = require('./mongo');
const { jsonResponse } = require('./response');

const parseBody = (body) => {
    try {
        return JSON.parse(body || '{}');
    } catch {
        return null;
    }
};

const normalizeDoc = (doc) => {
    if (!doc) return doc;
    return {
        ...doc,
        _id: doc._id?.toString?.() || doc._id,
    };
};

const stripId = (doc) => {
    if (!doc || typeof doc !== 'object') return doc;
    const { _id, ...rest } = doc;
    return rest;
};

const buildCollectionHandler = ({ collectionName, findQuery = {} }) => async (event) => {
    let collection;
    try {
        const db = await getMongoDb();
        collection = db.collection(collectionName);
    } catch (error) {
        console.error('Mongo connection failed:', error);
        return jsonResponse(500, { message: 'Database connection failed.' });
    }

    if (event.httpMethod === 'GET') {
        try {
            const docs = await collection.find(findQuery).toArray();
            return jsonResponse(200, docs.map(normalizeDoc));
        } catch (error) {
            console.error('Mongo fetch failed:', error);
            return jsonResponse(500, { message: 'Unable to fetch records.' });
        }
    }

    if (event.httpMethod === 'POST') {
        const payload = parseBody(event.body);
        if (!payload) {
            return jsonResponse(400, { message: 'Invalid JSON body.' });
        }

        try {
            if (Array.isArray(payload)) {
                const docs = payload.map(stripId).filter(Boolean);
                if (!docs.length) {
                    return jsonResponse(400, { message: 'No records to insert.' });
                }
                const result = await collection.insertMany(docs);
                const inserted = docs.map((doc, index) => ({
                    ...doc,
                    _id: result.insertedIds[index].toString(),
                }));
                return jsonResponse(201, inserted);
            }

            const doc = stripId(payload);
            const result = await collection.insertOne(doc);
            return jsonResponse(201, normalizeDoc({ ...doc, _id: result.insertedId }));
        } catch (error) {
            console.error('Mongo insert failed:', error);
            return jsonResponse(500, { message: 'Unable to insert record.' });
        }
    }

    if (event.httpMethod === 'PUT') {
        const payload = parseBody(event.body);
        if (!payload) {
            return jsonResponse(400, { message: 'Invalid JSON body.' });
        }

        const id = payload._id;
        if (!id) {
            return jsonResponse(400, { message: 'Record id is required.' });
        }

        if (!ObjectId.isValid(id)) {
            return jsonResponse(400, { message: 'Invalid record id.' });
        }

        const updateDoc = stripId(payload);

        try {
            const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });
            if (!result.matchedCount) {
                return jsonResponse(404, { message: 'Record not found.' });
            }
            const updated = await collection.findOne({ _id: new ObjectId(id) });
            return jsonResponse(200, normalizeDoc(updated));
        } catch (error) {
            console.error('Mongo update failed:', error);
            return jsonResponse(500, { message: 'Unable to update record.' });
        }
    }

    if (event.httpMethod === 'DELETE') {
        const payload = parseBody(event.body);
        const ids = payload?.ids || (payload?.id ? [payload.id] : []);
        const validIds = ids
            .filter((value) => ObjectId.isValid(value))
            .map((value) => new ObjectId(value));

        if (!validIds.length) {
            return jsonResponse(400, { message: 'No valid ids provided.' });
        }

        try {
            const result = await collection.deleteMany({ _id: { $in: validIds } });
            return jsonResponse(200, { deletedCount: result.deletedCount });
        } catch (error) {
            console.error('Mongo delete failed:', error);
            return jsonResponse(500, { message: 'Unable to delete records.' });
        }
    }

    return jsonResponse(405, { message: 'Method Not Allowed' }, { Allow: 'GET, POST, PUT, DELETE' });
};

module.exports = {
    buildCollectionHandler,
    normalizeDoc,
};
