const { Client } = require('pg');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Verify JWT token
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'No token provided' })
            };
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await client.connect();

        switch (event.httpMethod) {
            case 'GET':
                // Get user's virtual cards
                const cards = await client.query(
                    'SELECT id, card_number, card_holder_name, expiry_month, expiry_year, is_active, created_at FROM virtual_cards WHERE user_id = $1',
                    [userId]
                );

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ cards: cards.rows })
                };

            case 'POST':
                // Create new virtual card
                const { card_holder_name } = JSON.parse(event.body);
                
                // Generate card number (simplified - in production, use proper card generation)
                const cardNumber = '4' + Math.random().toString().slice(2, 16);
                const expiryMonth = Math.floor(Math.random() * 12) + 1;
                const expiryYear = new Date().getFullYear() + 3;
                const cvvHash = Math.random().toString(36).substring(2, 8);

                const newCard = await client.query(
                    'INSERT INTO virtual_cards (user_id, card_number, card_holder_name, expiry_month, expiry_year, cvv_hash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, card_number, card_holder_name, expiry_month, expiry_year, is_active',
                    [userId, cardNumber, card_holder_name, expiryMonth, expiryYear, cvvHash]
                );

                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    body: JSON.stringify({ card: newCard.rows[0] })
                };

            default:
                return { statusCode: 405, body: 'Method Not Allowed' };
        }
    } catch (error) {
        console.error('Virtual card error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    } finally {
        await client.end();
    }
}; 