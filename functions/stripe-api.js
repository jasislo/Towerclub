// stripe-api.js
// Netlify serverless function for Stripe API operations

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Parse the path to determine which operation to perform
  const path = event.path.replace(/\/netlify\/functions\/stripe-api\/?/, '');
  
  try {
    // Parse request body if it exists
    const data = event.body ? JSON.parse(event.body) : {};
    
    // Handle different API operations based on path
    switch (path) {
      case 'create-payment-intent':
        return await createPaymentIntent(data, headers);
      
      case 'create-customer':
        return await createCustomer(data, headers);
      
      case 'get-payment-methods':
        return await getPaymentMethods(event.queryStringParameters, headers);
      
      case 'delete-payment-method':
        return await deletePaymentMethod(data, headers);
      
      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Not Found' }),
        };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Create a payment intent
 * @param {Object} data - Request data
 * @param {Object} headers - Response headers
 */
async function createPaymentIntent(data, headers) {
  try {
    const { amount, currency = 'usd', customer, payment_method } = data;
    
    const paymentIntentParams = {
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    };
    
    // Add customer if provided
    if (customer) {
      paymentIntentParams.customer = customer;
    }
    
    // Add payment method if provided
    if (payment_method) {
      paymentIntentParams.payment_method = payment_method;
      paymentIntentParams.confirm = true;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

/**
 * Create a new customer
 * @param {Object} data - Customer data
 * @param {Object} headers - Response headers
 */
async function createCustomer(data, headers) {
  try {
    const { email, name, phone, metadata } = data;
    
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata,
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ customer }),
    };
  } catch (error) {
    console.error('Error creating customer:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

/**
 * Get a customer's payment methods
 * @param {Object} queryParams - Query parameters
 * @param {Object} headers - Response headers
 */
async function getPaymentMethods(queryParams, headers) {
  try {
    const { customer } = queryParams;
    
    if (!customer) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Customer ID is required' }),
      };
    }
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer,
      type: 'card',
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ paymentMethods: paymentMethods.data }),
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

/**
 * Delete a payment method
 * @param {Object} data - Request data
 * @param {Object} headers - Response headers
 */
async function deletePaymentMethod(data, headers) {
  try {
    const { paymentMethodId } = data;
    
    if (!paymentMethodId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment method ID is required' }),
      };
    }
    
    const deletedPaymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ deleted: true, paymentMethod: deletedPaymentMethod }),
    };
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
