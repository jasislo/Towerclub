exports.handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      console.log('Received data:', data);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Data submitted successfully!' }),
      };
    } catch (error) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }
  } else {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
};