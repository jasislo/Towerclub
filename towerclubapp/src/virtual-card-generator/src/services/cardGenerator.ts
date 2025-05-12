import { PayPalService } from './paypalService';
import { VisaService } from './visaService';

export async function generateCardNumber(userId: string): Promise<string> {
    const paypalService = new PayPalService();
    const visaService = new VisaService();

    try {
        const paypalCard = await paypalService.createVirtualCard(userId);
        const visaCard = await visaService.createVirtualCard(userId);

        // Combine or choose the card number based on your logic
        return paypalCard || visaCard; // Return the first available card number
    } catch (error) {
        throw new Error('Failed to generate virtual card number: ' + error.message);
    }
}