export interface CardDetails {
    cardNumber: string;
    expiryDate: string;
    cardHolderName: string;
}

export interface ServiceResponse {
    success: boolean;
    message: string;
    data?: CardDetails;
}