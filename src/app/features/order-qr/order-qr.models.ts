export interface QRResponse {
    base64QRString: string
}

export interface QRValidationResponse {
    isValid: boolean;
    token: string | null;
}

