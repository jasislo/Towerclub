import { Request, Response } from 'express';
import { generateCardNumber } from '../services/cardGenerator';

export class CardController {
    public async createCard(req: Request, res: Response): Promise<void> {
        try {
            const cardDetails = await generateCardNumber();
            res.status(200).json({
                success: true,
                data: cardDetails,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate card number',
                error: error.message,
            });
        }
    }
}