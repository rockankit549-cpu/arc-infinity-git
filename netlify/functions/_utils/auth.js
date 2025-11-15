const jwt = require('jsonwebtoken');

const TOKEN_TTL_SECONDS = parseInt(process.env.JWT_TTL_SECONDS || '3600', 10);
const COOKIE_NAME = 'arc_session';

const ensureJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined.');
    }
    return secret;
};

const buildSessionCookie = (token) => {
    const isLocal = process.env.NETLIFY_DEV === 'true';
    const attributes = [
        `${COOKIE_NAME}=${token}`,
        'HttpOnly',
        'Path=/',
        'SameSite=Strict',
        `Max-Age=${TOKEN_TTL_SECONDS}`,
    ];

    if (!isLocal) {
        attributes.push('Secure');
    }

    return attributes.join('; ');
};

const extractTokenFromEvent = (event) => {
    const headers = event.headers || {};
    const authHeader = headers.authorization || headers.Authorization;

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        return authHeader.slice(7).trim();
    }

    const cookieHeader = headers.cookie || headers.Cookie;
    if (!cookieHeader) return null;

    const tokenCookie = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_NAME}=`));

    if (!tokenCookie) return null;

    return decodeURIComponent(tokenCookie.split('=')[1]);
};

const verifyJwt = (token) => {
    const secret = ensureJwtSecret();
    return jwt.verify(token, secret);
};

module.exports = {
    TOKEN_TTL_SECONDS,
    buildSessionCookie,
    extractTokenFromEvent,
    verifyJwt,
    ensureJwtSecret,
    COOKIE_NAME,
};
