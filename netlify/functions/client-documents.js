const { ObjectId } = require('mongodb');
const { getMongoDb } = require('./_utils/mongo');
const { jsonResponse } = require('./_utils/response');

const MAX_UPLOAD_BYTES = Number.parseInt(process.env.MAX_UPLOAD_BYTES || '10485760', 10);

const buildDownloadUrl = (id) => `/api/client-documents?id=${id}`;

const parsePayload = (body) => {
    try {
        return JSON.parse(body || '{}');
    } catch {
        return null;
    }
};

const sanitizeFileName = (fileName) => (fileName || 'document.pdf').replace(/"/g, '');

const getCollection = async () => {
    const db = await getMongoDb();
    const collectionName = process.env.MONGODB_FILES_COLLECTION || 'fileUploads';
    return db.collection(collectionName);
};

exports.handler = async (event) => {
    let collection;
    try {
        collection = await getCollection();
    } catch (error) {
        console.error('Mongo connection failed:', error);
        return jsonResponse(500, { message: 'Database connection failed.' });
    }

    if (event.httpMethod === 'POST') {
        const payload = parsePayload(event.body);
        if (!payload) {
            return jsonResponse(400, { message: 'Invalid JSON body.' });
        }

        const fileName = (payload.fileName || '').trim();
        const testRef = (payload.testRef || '').trim();
        const contentType = (payload.contentType || 'application/pdf').trim();
        const data = payload.data || '';

        if (!fileName || !data) {
            return jsonResponse(400, { message: 'fileName and data are required.' });
        }

        const sizeBytes = Buffer.byteLength(data, 'base64');
        if (sizeBytes > MAX_UPLOAD_BYTES) {
            return jsonResponse(413, { message: 'File exceeds upload size limit.' });
        }

        const doc = {
            docType: 'document',
            fileName,
            testRef: testRef || null,
            contentType,
            data,
            sizeBytes,
            uploadedAt: new Date(),
        };

        try {
            const result = await collection.insertOne(doc);
            const id = result.insertedId.toString();

            return jsonResponse(201, {
                id,
                fileName,
                testRef: testRef || null,
                downloadUrl: buildDownloadUrl(id),
            });
        } catch (error) {
            console.error('Document upload failed:', error);
            return jsonResponse(500, { message: 'Unable to store document.' });
        }
    }

    if (event.httpMethod === 'GET') {
        const params = event.queryStringParameters || {};
        const id = params.id;
        const testRef = params.testRef;

        if (id || testRef) {
            try {
                if (id && !ObjectId.isValid(id)) {
                    return jsonResponse(400, { message: 'Invalid document id.' });
                }

                const query = id
                    ? { _id: new ObjectId(id), docType: 'document' }
                    : { testRef, docType: 'document' };
                const doc = await collection.findOne(query, {
                    sort: { uploadedAt: -1 },
                });

                if (!doc || !doc.data) {
                    return jsonResponse(404, { message: 'Document not found.' });
                }

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': doc.contentType || 'application/pdf',
                        'Content-Disposition': `attachment; filename="${sanitizeFileName(doc.fileName)}"`,
                        'Cache-Control': 'no-store',
                    },
                    body: doc.data,
                    isBase64Encoded: true,
                };
            } catch (error) {
                console.error('Document fetch failed:', error);
                return jsonResponse(500, { message: 'Unable to fetch document.' });
            }
        }

        try {
            const docs = await collection
                .find({ docType: 'document' })
                .project({ data: 0 })
                .sort({ uploadedAt: -1 })
                .toArray();

            const normalized = docs.map((doc) => ({
                id: doc._id?.toString?.() || doc._id,
                testRef: doc.testRef || null,
                fileName: doc.fileName,
                contentType: doc.contentType,
                sizeBytes: doc.sizeBytes,
                uploadedAt: doc.uploadedAt,
                downloadUrl: buildDownloadUrl(doc._id?.toString?.() || doc._id),
            }));

            return jsonResponse(200, normalized);
        } catch (error) {
            console.error('Document list failed:', error);
            return jsonResponse(500, { message: 'Unable to list documents.' });
        }
    }

    return jsonResponse(405, { message: 'Method Not Allowed' }, { Allow: 'GET, POST' });
};
