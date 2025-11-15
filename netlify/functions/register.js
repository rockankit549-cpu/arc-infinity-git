const bcrypt = require('bcryptjs');
const { getClient } = require('./_utils/db');
const { jsonResponse } = require('./_utils/response');

const SALT_ROUNDS = 12;

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
        const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
        if (existing.length) {
            return jsonResponse(409, { message: 'Email already registered.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const inserted = await sql`
            INSERT INTO users (email, password_hash)
            VALUES (${email}, ${passwordHash})
            RETURNING id, email, created_at
        `;

        const user = inserted[0];
        return jsonResponse(201, { user });
    } catch (error) {
        console.error('Registration error:', error);
        return jsonResponse(500, { message: 'Registration failed.' });
    }
};
