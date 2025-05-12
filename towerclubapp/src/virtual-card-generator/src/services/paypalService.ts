import axios from 'axios';

class PayPalService {
    private clientId: string;
    private clientSecret: string;
    private apiUrl: string;

    constructor() {
        // Load configuration from environment variables or config file
        this.clientId = process.env.PAYPAL_CLIENT_ID || 'your-client-id';
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'your-client-secret';
        this.apiUrl = 'https://api.paypal.com'; // Use sandbox URL for testing
    }

    private async getAccessToken(): Promise<string> {
        const response = await axios.post(`${this.apiUrl}/v1/oauth2/token`, null, {
            auth: {
                username: this.clientId,
                password: this.clientSecret,
            },
            params: {
                grant_type: 'client_credentials',
            },
        });
        return response.data.access_token;
    }

    public async createVirtualCard(amount: number): Promise<any> {
        const accessToken = await this.getAccessToken();
        const response = await axios.post(`${this.apiUrl}/v1/cards`, {
            amount: amount,
            currency: 'USD',
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
}

export default PayPalService;