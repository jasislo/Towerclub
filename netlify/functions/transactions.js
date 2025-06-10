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
                // Get user's transactions
                const transactions = await client.query(
                    `SELECT t.*, vc.card_number 
                     FROM transactions t 
                     LEFT JOIN virtual_cards vc ON t.card_id = vc.id 
                     WHERE t.user_id = $1 
                     ORDER BY t.created_at DESC`,
                    [userId]
                );

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({ transactions: transactions.rows })
                };

            case 'POST':
                // Create new transaction
                const { amount, currency, merchant_name, transaction_type, card_id } = JSON.parse(event.body);
                
                const newTransaction = await client.query(
                    'INSERT INTO transactions (user_id, card_id, amount, currency, merchant_name, transaction_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                    [userId, card_id, amount, currency || 'USD', merchant_name, transaction_type]
                );

                return {
                    statusCode: 201,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                    },
                    body: JSON.stringify({ transaction: newTransaction.rows[0] })
                };

            default:
                return { statusCode: 405, body: 'Method Not Allowed' };
        }
    } catch (error) {
        console.error('Transaction error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    } finally {
        await client.end();
    }
}; 