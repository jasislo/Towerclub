const { Client } = require('pg');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { username, email, password, first_name, last_name, phone } = JSON.parse(event.body);
        
        // Validate input
        if (!username || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid email format' })
            };
        }

        // Password strength validation
        if (password.length < 8) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Password must be at least 8 characters long' })
            };
        }

        await client.connect();
        
        // Check if user already exists
        const existingUser = await client.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: 'User already exists' })
            };
        }

        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const result = await client.query(
            'INSERT INTO users (username, email, password_hash, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, first_name, last_name',
            [username, email, passwordHash, first_name, last_name, phone]
        );

        const newUser = result.rows[0];

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name
                }
            })
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to register user' })
        };
    } finally {
        await client.end();
    }
}; 