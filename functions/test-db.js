const { Client } = require('pg');

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const result = await client.query('SELECT NOW()');
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                message: 'Database connection successful',
                timestamp: result.rows[0].now,
                environment: process.env.NODE_ENV || 'development'
            })
        };
    } catch (error) {
        console.error('Database connection error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Database connection failed',
                details: error.message,
                environment: process.env.NODE_ENV || 'development'
            })
        };
    } finally {
        await client.end();
    }
}; 