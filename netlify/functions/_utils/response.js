const defaultHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
};

const jsonResponse = (statusCode, payload, headers = {}) => ({
    statusCode,
    headers: {
        ...defaultHeaders,
        ...headers,
    },
    body: JSON.stringify(payload),
});

module.exports = {
    jsonResponse,
};
