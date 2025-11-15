const { jsonResponse } = require('./_utils/response');
const {
    extractTokenFromEvent,
    verifyJwt,
} = require('./_utils/auth');

exports.handler = async (event) => {
    const token = extractTokenFromEvent(event);
    if (!token) {
        return jsonResponse(401, { message: 'Unauthorized.' });
    }

    try {
        const payload = verifyJwt(token);
        return jsonResponse(200, {
            message: 'Access granted.',
            user: {
                id: payload.sub,
                email: payload.email,
            },
        });
    } catch (error) {
        console.error('Protected route error:', error);
        return jsonResponse(401, { message: 'Invalid or expired token.' });
    }
};
