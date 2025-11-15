const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getClient } = require('./_utils/db');
const { jsonResponse } = require('./_utils/response');
const {
    TOKEN_TTL_SECONDS,
    buildSessionCookie,
    ensureJwtSecret,
} = require('./_utils/auth');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, { message: 'Method Not Allowed' }, { Allow: 'POST' });
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return jsonResponse(400, { message: 'Invalid JSON body.' });
    }

    const email = (payload.email || '').trim().toLowerCase();
    const password = payload.password || '';

    if (!email || !password) {
        return jsonResponse(400, { message: 'Email and password are required.' });
    }

    const sql = getClient();

    try {
        const matches = await sql`
            SELECT id, email, password_hash
            FROM users
            WHERE email = ${email}
            LIMIT 1
        `;

        if (!matches.length) {
            return jsonResponse(401, { message: 'Invalid credentials.' });
        }

        const user = matches[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return jsonResponse(401, { message: 'Invalid credentials.' });
        }

        const tokenPayload = { sub: user.id, email: user.email };
        const token = jwt.sign(tokenPayload, ensureJwtSecret(), {
            expiresIn: TOKEN_TTL_SECONDS,
        });

        const headers = {
            'Set-Cookie': buildSessionCookie(token),
        };

        return jsonResponse(200, { token, expiresIn: TOKEN_TTL_SECONDS }, headers);
    } catch (error) {
        console.error('Login error:', error);
        return jsonResponse(500, { message: 'Authentication failed.' });
    }
};
