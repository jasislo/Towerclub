import express from 'express';
import { setCardRoutes } from './routes/cardRoutes';
import { authenticate } from './middlewares/authMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(authenticate);

// Routes
setCardRoutes(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});