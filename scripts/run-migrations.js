#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { neon } = require('@netlify/neon');

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

const loadMigrations = () => {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        return [];
    }

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));
};

const run = async () => {
    const connectionString = process.env.NETLIFY_DATABASE_URL;
    if (!connectionString) {
        console.error('NETLIFY_DATABASE_URL is not set. Run `netlify env:get NETLIFY_DATABASE_URL` and export it.');
        process.exit(1);
    }

    const sql = neon(connectionString);
    const files = loadMigrations();
    if (!files.length) {
        console.log('No migrations to run.');
        return;
    }

    for (const file of files) {
        const filePath = path.join(MIGRATIONS_DIR, file);
        const statements = fs
            .readFileSync(filePath, 'utf8')
            .split(/;\s*(?:\r?\n|$)/);
        console.log(`\nApplying migration ${file}...`);

        for (const statement of statements) {
            if (!statement.trim()) continue;
            await sql.unsafe(statement);
        }

        console.log(`Migration ${file} applied successfully.`);
    }
};

run().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
