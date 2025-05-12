import axios from 'axios';

export class VisaService {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = process.env.VISA_API_URL || 'https://api.visa.com';
        this.apiKey = process.env.VISA_API_KEY || '';
    }

    public async createVirtualCard(amount: number, currency: string): Promise<string> {
        try {
            const response = await axios.post(`${this.apiUrl}/virtual-card`, {
                amount,
                currency,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.data.cardNumber;
        } catch (error) {
            throw new Error(`Failed to create virtual card: ${error.message}`);
        }
    }
}