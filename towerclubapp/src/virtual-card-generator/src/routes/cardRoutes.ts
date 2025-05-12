import { Router } from 'express';
import CardController from '../controllers/cardController';

const router = Router();
const cardController = new CardController();

export const setCardRoutes = (app) => {
    app.use('/api/cards', router);

    router.post('/generate', cardController.createCard);
};