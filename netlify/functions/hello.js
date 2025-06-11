import { app, analytics } from '../Netlify/functions/firebase.js'; // Adjust the path as needed

// Now you can use Firebase services, e.g.:
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const auth = getAuth(app);

// Example: Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in, you can fetch user data, etc.
  } else {
    // User is signed out
  }
});

async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Save user info to localStorage or state
    // Redirect to dashboard, etc.
  } catch (error) {
    // Handle errors
  }
}

exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    // Handle GET request with query parameter
    const subject = event.queryStringParameters && event.queryStringParameters.name
      ? event.queryStringParameters.name
      : 'World';
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Hello, ${subject}!` }),
    };
  } else if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      // Process the data (e.g., save to a database)
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

// Example frontend code (place in your frontend JS file)
// GET request example:
fetch('/.netlify/functions/hello?name=User')
  .then(response => response.json())
  .then(data => {
    console.log(data.message); // Hello, User!
  })
  .catch(error => console.error('Error fetching data:', error));

// POST request example:
// fetch('/.netlify/functions/hello', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({ name: 'User' }),
// })
//   .then(response => response.json())
//   .then(data => {
//     console.log(data.message);
//   })
//   .catch(error => console.error('Error fetching data:', error));